import { db } from './db'

export async function createAuditLog({
  userId,
  module,
  action,
  recordId,
  ipAddress,
  userAgent,
}: {
  userId?: string
  module: string
  action: string
  recordId?: string
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: userId || null,
        module,
        action,
        recordId: recordId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    })
  } catch (err) {
    console.error('Audit log creation failed:', err)
  }
}

export async function createNotificationLog({
  recipient,
  notificationType,
  subject,
  deliveryStatus,
  errorMessage,
}: {
  recipient: string
  notificationType: string
  subject: string
  deliveryStatus?: 'SENT' | 'FAILED'
  errorMessage?: string
}) {
  try {
    await db.notificationLog.create({
      data: {
        recipient,
        notificationType,
        subject,
        deliveryStatus: deliveryStatus || 'SENT',
        errorMessage: errorMessage || null,
      },
    })
  } catch (err) {
    console.error('Notification log creation failed:', err)
  }
}
