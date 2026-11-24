'use server'

import { db } from '@/lib/db'
import {
  requireAdmissionHeadSession,
  requireAdminSession,
  getAdminSession,
  canManageExpenses,
  canDeleteRecords,
} from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * Generate a sequential, unique Expense ID: EXP-YYYY-XXXX
 */
async function generateExpenseNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const prefix = `EXP-${currentYear}-`

  const latest = await db.expense.findFirst({
    where: {
      expenseNumber: { startsWith: prefix },
    },
    orderBy: { createdAt: 'desc' },
    select: { expenseNumber: true },
  })

  let nextSequence = 1
  if (latest && latest.expenseNumber) {
    const parts = latest.expenseNumber.split('-')
    const lastNum = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastNum)) {
      nextSequence = lastNum + 1
    }
  }

  const padded = String(nextSequence).padStart(4, '0')
  return `${prefix}${padded}`
}

/**
 * Fetch all expenses.
 */
export async function getExpensesAction() {
  const session = await requireAdmissionHeadSession()

  try {
    const rawExpenses = await db.expense.findMany({
      where: { isDeleted: false },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { expenseDate: 'desc' },
    })

    // Serialize Decimal amounts to numbers for client components
    const expenses = rawExpenses.map((exp) => ({
      ...exp,
      amount: Number(exp.amount),
    }))

    return {
      success: true,
      expenses,
      currentUser: {
        id: session.id,
        role: session.roleName,
        name: session.fullName,
      },
    }
  } catch (err: any) {
    console.error('Error fetching expenses:', err)
    return { success: false, error: err.message || 'Failed to fetch expenses', expenses: [] }
  }
}

/**
 * Record a new institute expense.
 */
export async function createExpenseAction(data: {
  title: string
  description?: string
  category: string
  amount: number
  paymentMode: string
  expenseDate?: string
  receiptUrl?: string
}) {
  const session = await requireAdmissionHeadSession()

  if (!data.title?.trim() || !data.category?.trim() || !data.amount || data.amount <= 0) {
    return { success: false, error: 'Title, Category, and a valid Amount greater than 0 are required' }
  }

  try {
    const expenseNumber = await generateExpenseNumber()
    const expenseDate = data.expenseDate ? new Date(data.expenseDate) : new Date()

    const created = await db.expense.create({
      data: {
        expenseNumber,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        category: data.category.trim(),
        amount: data.amount,
        paymentMode: data.paymentMode || 'CASH',
        expenseDate,
        receiptUrl: data.receiptUrl || null,
        createdById: session.id,
        createdByName: session.fullName,
      },
    })

    revalidatePath('/admin/expenses')
    return {
      success: true,
      message: `Expense recorded successfully as ${expenseNumber}`,
      expense: {
        ...created,
        amount: Number(created.amount),
      },
    }
  } catch (err: any) {
    console.error('Error creating expense:', err)
    return { success: false, error: err.message || 'Failed to record expense' }
  }
}

/**
 * Update an existing expense record.
 */
export async function updateExpenseAction(
  id: string,
  data: {
    title?: string
    description?: string
    category?: string
    amount?: number
    paymentMode?: string
    expenseDate?: string
    receiptUrl?: string
  }
) {
  await requireAdmissionHeadSession()

  try {
    const updated = await db.expense.update({
      where: { id },
      data: {
        title: data.title?.trim(),
        description: data.description?.trim(),
        category: data.category?.trim(),
        amount: data.amount,
        paymentMode: data.paymentMode,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
        receiptUrl: data.receiptUrl,
      },
    })

    revalidatePath('/admin/expenses')
    return {
      success: true,
      message: 'Expense record updated',
      expense: {
        ...updated,
        amount: Number(updated.amount),
      },
    }
  } catch (err: any) {
    console.error('Error updating expense:', err)
    return { success: false, error: err.message || 'Failed to update expense' }
  }
}

/**
 * Soft delete an expense record (Admin or Super Admin only).
 */
export async function deleteExpenseAction(id: string) {
  await requireAdminSession()

  try {
    await db.expense.update({
      where: { id },
      data: { isDeleted: true },
    })

    revalidatePath('/admin/expenses')
    return { success: true, message: 'Expense record moved to Bin' }
  } catch (err: any) {
    console.error('Error deleting expense:', err)
    return { success: false, error: err.message || 'Failed to delete expense' }
  }
}
