'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requirePermission, requireSuperAdminSession } from '@/lib/auth'
import { audit, diff } from '@/lib/audit'
import { recordTrash, clearTrash } from '@/lib/trash'
import { istLocalToDate, fmtMoney } from '@/lib/dates'
import { PAYMENT_MODES } from '@/lib/fees'

type Result = { success: boolean; message?: string; error?: string; id?: string }
const fail = (err: any): Result => ({ success: false, error: String(err?.message || err).replace(/^(UNAUTHORIZED|FORBIDDEN): /, '') })
const str = (v: unknown, max: number) => {
  const s = String(v ?? '').trim()
  return s ? s.slice(0, max) : null
}
const isUuid = (v: unknown) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v)

function validate(d: any) {
  const expenseAt = istLocalToDate(d.expenseAt || '')
  if (!expenseAt) return { error: 'Enter the expense date and time.' }
  if (expenseAt.getTime() > Date.now() + 5 * 60 * 1000) return { error: 'Expense date cannot be in the future.' }
  const description = str(d.description, 500)
  if (!description) return { error: 'Enter a description.' }
  const amount = Math.round(Number(String(d.amount ?? '').replace(/,/g, '')) * 100) / 100
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Amount must be greater than 0.' }
  if (amount > 100000000) return { error: 'Amount is too large.' }
  if (!PAYMENT_MODES.some((m) => m.value === d.paymentMode)) return { error: 'Choose the payment mode.' }
  return {
    data: {
      expenseAt,
      description,
      amount,
      paymentMode: d.paymentMode,
      category: str(d.category, 100),
      reference: str(d.reference, 150),
      attachmentFileId: isUuid(d.attachmentFileId) ? d.attachmentFileId : null,
    },
  }
}

async function attachFile(fileId: string | null, expenseId: string) {
  if (!fileId) return
  await (db as any).storedFile.updateMany({ where: { id: fileId, ownerType: 'expense', OR: [{ ownerId: null }, { ownerId: expenseId }] }, data: { ownerId: expenseId } })
}

function refresh() {
  revalidatePath('/admin/expenses')
  revalidatePath('/admin/reports')
  revalidatePath('/admin/dashboard')
}

export async function saveExpenseAction(id: string | null, input: any): Promise<Result> {
  try {
    const session = await requirePermission('expenses', id ? 'edit' : 'add')
    const v = validate(input)
    if (v.error) return { success: false, error: v.error }
    if (v.data!.attachmentFileId) {
      const f = await (db as any).storedFile.findFirst({ where: { id: v.data!.attachmentFileId, ownerType: 'expense', isDeleted: false }, select: { ownerId: true } })
      if (!f || (f.ownerId && f.ownerId !== id)) return { success: false, error: 'The attached bill was not found. Upload it again.' }
    }
    if (id) {
      const before = await (db as any).expense.findFirst({ where: { id, isDeleted: false } })
      if (!before) return { success: false, error: 'Expense not found.' }
      const after = await (db as any).expense.update({ where: { id }, data: { ...v.data, updatedById: session.id, updatedByName: session.fullName } })
      await attachFile(after.attachmentFileId, id)
      const n = (x: any) => ({ ...x, amount: Number(x.amount), expenseAt: new Date(x.expenseAt).toISOString() })
      const d = diff(n(before), n(after))
      if (d.changed.length) await audit(session, 'EXPENSE_UPDATE', 'expense', id, `Updated ${before.expenseCode}: ${d.changed.join(', ')}`, d)
      refresh()
      return { success: true, message: 'Expense updated.', id }
    }
    const row = await (db as any).expense.create({
      data: { ...v.data, createdById: session.id, createdByName: session.fullName, updatedById: session.id, updatedByName: session.fullName },
    })
    await attachFile(row.attachmentFileId, row.id)
    await audit(session, 'EXPENSE_CREATE', 'expense', row.id, `${row.expenseCode}: ${fmtMoney(v.data!.amount)} — ${row.description}`, { after: row })
    refresh()
    return { success: true, message: `Expense ${row.expenseCode} saved.`, id: row.id }
  } catch (err) {
    return fail(err)
  }
}

export async function trashExpenseAction(id: string): Promise<Result> {
  try {
    const session = await requirePermission('expenses', 'delete')
    const e = await (db as any).expense.findFirst({ where: { id, isDeleted: false } })
    if (!e) return { success: false, error: 'Expense not found.' }
    await (db as any).expense.update({ where: { id }, data: { isDeleted: true, updatedById: session.id, updatedByName: session.fullName } })
    await recordTrash('expense', id, session)
    await audit(session, 'EXPENSE_DELETE', 'expense', id, `Moved ${e.expenseCode} (${fmtMoney(Number(e.amount))}) to the Bin`, { before: e })
    refresh()
    return { success: true, message: 'Expense moved to the Bin.' }
  } catch (err) {
    return fail(err)
  }
}

export async function restoreExpenseAction(id: string): Promise<Result> {
  try {
    const session = await requireSuperAdminSession()
    const e = await (db as any).expense.update({ where: { id }, data: { isDeleted: false } })
    await clearTrash('expense', id)
    await audit(session, 'EXPENSE_RESTORE', 'expense', id, `Restored ${e.expenseCode} from the Bin`)
    refresh()
    return { success: true, message: 'Expense restored.' }
  } catch (err) {
    return fail(err)
  }
}

/** Expenses are financial history: they can sit in the Bin but are never erased. */
export async function deleteExpenseForeverAction(id: string): Promise<Result> {
  await requireSuperAdminSession()
  void id
  return { success: false, error: 'Expenses are financial records and cannot be erased. They stay in the Bin (excluded from reports).' }
}
