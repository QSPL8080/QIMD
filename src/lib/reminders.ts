import { db } from './db'
import { loadLedgers, LIVE_ADMISSION } from './admissionData'
import { addDays, daysBetween, fmtDate, fmtMoney, istEnd, istStart, todayIST } from './dates'
import { notifyRoles, notifyUser } from './notifications'
import { audit } from './audit'
import { emailStaff } from './staffMail'

/**
 * Internal fee reminders (SRS §11.1): 15, 7 and 3 days before a due date, on the
 * due date, and once when overdue — to the Admission Head(s).
 *
 * The unique key includes the instalment's current due date, so changing a due
 * date automatically recalculates (old stages are never sent for the new date),
 * a cleared instalment gets nothing, and the same stage is never sent twice.
 */

const STAGES: { stage: string; from: number; to: number; text: string }[] = [
  { stage: 'D15', from: 8, to: 15, text: 'due in 15 days' },
  { stage: 'D7', from: 4, to: 7, text: 'due in 7 days' },
  { stage: 'D3', from: 1, to: 3, text: 'due in 3 days' },
  { stage: 'D0', from: 0, to: 0, text: 'due today' },
]

function stageFor(daysLeft: number) {
  if (daysLeft < 0) return { stage: 'OVERDUE', text: 'overdue' }
  return STAGES.find((s) => daysLeft >= s.from && daysLeft <= s.to) || null
}

/** Claim a reminder key; false if it was already used (prevents duplicates even if two runs overlap). */
async function claim(data: Record<string, any>): Promise<boolean> {
  try {
    await (db as any).reminderLog.create({ data })
    return true
  } catch (err: any) {
    if (err?.code === 'P2002' || /unique/i.test(String(err?.message))) return false
    throw err
  }
}

async function admissionHeadRoles(): Promise<string[]> {
  const heads = await db.user.count({ where: { role: 'ADMISSION_HEAD', status: true, isDeleted: false } })
  return heads > 0 ? ['ADMISSION_HEAD'] : ['SUPER_ADMIN', 'ADMIN']
}

export async function runFeeReminders(today = todayIST()) {
  let sent = 0
  const horizon = addDays(today, 15)
  // Only admissions with an instalment due within 15 days (or already past due)
  const admissions = await (db as any).admission.findMany({
    where: { ...LIVE_ADMISSION, installments: { some: { dueDate: { lte: new Date(`${horizon}T00:00:00Z`) } } } },
    select: { id: true, admissionCode: true, studentName: true, totalFee: true },
  })
  if (admissions.length === 0) return 0
  const ledgers = await loadLedgers(admissions, today)
  const roles = await admissionHeadRoles()
  const digest: string[] = []

  for (const a of admissions) {
    const ledger = ledgers.get(a.id)!
    for (const inst of ledger.installments) {
      if (inst.remaining <= 0) continue
      const daysLeft = daysBetween(today, inst.dueDate)
      if (daysLeft > 15) continue
      const st = stageFor(daysLeft)
      if (!st) continue
      const ok = await claim({
        admissionId: a.id,
        installmentId: inst.id,
        audience: 'INTERNAL',
        stage: st.stage,
        channel: 'IN_APP',
        dueDate: new Date(`${inst.dueDate}T00:00:00Z`),
        amount: inst.remaining,
        uniqueKey: `INT:${inst.id}:${inst.dueDate}:${st.stage}`,
        status: 'SENT',
      })
      if (!ok) continue
      sent++
      const title = `${a.studentName} (${a.admissionCode}): ${fmtMoney(inst.remaining)} ${st.text}${st.stage === 'OVERDUE' ? ` since ${fmtDate(inst.dueDate)}` : ` — ${fmtDate(inst.dueDate)}`}`
      digest.push(title)
      await notifyRoles(roles, { type: st.stage === 'OVERDUE' ? 'FEE_OVERDUE' : 'FEE_DUE', title, link: `/admin/admissions/${a.id}?tab=fees` })
    }
  }
  // One email with everything that became due in this run
  if (digest.length) {
    await emailStaff(
      { roles },
      {
        subject: `Fee reminders: ${digest.length} instalment${digest.length === 1 ? '' : 's'} due or overdue`,
        title: 'Fee instalments to follow up',
        intro: 'These instalments reached a reminder point (15, 7 or 3 days before, due today, or overdue):',
        items: digest,
        link: '/admin/fees?view=dues&due=7',
        linkLabel: 'Open pending dues',
      },
    )
  }
  return sent
}

/** In-system alert to each counsellor for their follow-ups due today (once per lead per day). */
export async function runFollowUpAlerts(today = todayIST()) {
  const leads = await (db as any).lead.findMany({
    where: { isDeleted: false, assignedToId: { not: null }, nextFollowUpAt: { gte: istStart(today), lte: istEnd(today) } },
    select: { id: true, leadCode: true, fullName: true, phone: true, assignedToId: true, nextFollowUpAt: true },
  })
  let sent = 0
  const perUser = new Map<string, string[]>()
  for (const l of leads) {
    const already = await (db as any).adminNotification.count({
      where: { recipientId: l.assignedToId, type: 'FOLLOW_UP_DUE', link: `/admin/leads/${l.id}`, createdAt: { gte: istStart(today) } },
    })
    if (already) continue
    const time = new Date(l.nextFollowUpAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })
    await notifyUser(l.assignedToId, { type: 'FOLLOW_UP_DUE', title: `Follow-up due today at ${time}: ${l.fullName} (${l.leadCode})`, link: `/admin/leads/${l.id}` })
    perUser.set(l.assignedToId, [...(perUser.get(l.assignedToId) || []), `${time} · ${l.fullName} (${l.leadCode})${l.phone ? ` · ${l.phone}` : ''}`])
    sent++
  }
  // One email per counsellor with today's follow-ups
  for (const [userId, items] of perUser) {
    await emailStaff(
      { userIds: [userId] },
      {
        subject: `Today's follow-ups: ${items.length} lead${items.length === 1 ? '' : 's'}`,
        title: 'Follow-ups due today',
        intro: 'Please call these leads today and add the follow-up in the CRM:',
        items,
        link: '/admin/leads?followup=today',
        linkLabel: "Open today's follow-ups",
      },
    )
  }
  return sent
}

const LAST_RUN_KEY = 'system.remindersLastRun'

/**
 * Runs the reminder jobs at most once an hour. Called when anyone opens the admin
 * panel, and by /api/cron/reminders for a scheduled run. Never throws.
 */
export async function runRemindersIfDue(force = false) {
  try {
    const row = await (db as any).appSetting.findUnique({ where: { key: LAST_RUN_KEY } })
    const last = row?.value?.at ? new Date(row.value.at).getTime() : 0
    if (!force && Date.now() - last < 60 * 60 * 1000) return { skipped: true }
    await (db as any).appSetting.upsert({
      where: { key: LAST_RUN_KEY },
      create: { key: LAST_RUN_KEY, value: { at: new Date().toISOString() } },
      update: { value: { at: new Date().toISOString() } },
    })
    const fee = await runFeeReminders()
    const followUps = await runFollowUpAlerts()
    if (fee || followUps) await audit(null, 'REMINDERS_RUN', 'system', null, `Reminder job: ${fee} fee alert(s), ${followUps} follow-up alert(s)`)
    return { skipped: false, fee, followUps }
  } catch (err) {
    console.error('[reminders] run failed:', err)
    return { skipped: false, error: String(err) }
  }
}
