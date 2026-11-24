import nodemailer from 'nodemailer'

export type EnquiryType = 'admission' | 'contact' | 'career' | 'franchise' | 'hire'

export interface EnquiryEmailPayload {
  type: EnquiryType
  title: string
  name: string
  email: string
  phone: string
  details: Record<string, string | number | boolean | undefined | null>
  submittedAt?: Date
}

const TYPE_CONFIG: Record<
  EnquiryType,
  { label: string; color: string; adminPath: string }
> = {
  admission: {
    label: 'Admission Enquiry',
    color: '#d97706', // amber-600
    adminPath: '/admin/enquiries/admission',
  },
  contact: {
    label: 'Contact Enquiry',
    color: '#2563eb', // blue-600
    adminPath: '/admin/enquiries/contact',
  },
  career: {
    label: 'Career Job Application',
    color: '#9333ea', // purple-600
    adminPath: '/admin/enquiries/careers',
  },
  hire: {
    label: 'Corporate Hire Request',
    color: '#e11d48', // rose-600
    adminPath: '/admin/enquiries/hire',
  },
  franchise: {
    label: 'Franchise Partner Proposal',
    color: '#4f46e5', // indigo-600
    adminPath: '/admin/enquiries/franchise',
  },
}

function getTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  if (!host || !user) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })
}

/**
 * Sends a formatted notification email for any website enquiry form submission.
 * Primary recipient: info@quickuppinstitute.com (configurable via NOTIFICATION_EMAIL)
 */
export async function sendEnquiryNotificationEmail(payload: EnquiryEmailPayload) {
  const recipient = process.env.NOTIFICATION_EMAIL || 'info@quickuppinstitute.com'
  const config = TYPE_CONFIG[payload.type] || {
    label: 'Website Enquiry',
    color: '#2563eb',
    adminPath: '/admin',
  }
  const submittedAt = payload.submittedAt || new Date()
  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const adminUrl = `${siteUrl.replace(/\/$/, '')}${config.adminPath}`

  const subject = `[New ${config.label}] - ${payload.name}`

  // Format detail entries into clean HTML table rows
  const detailRows = Object.entries(payload.details)
    .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== '')
    .map(([key, val]) => {
      const isUrl = typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))
      const formattedVal = isUrl
        ? `<a href="${val}" style="color: #2563eb; text-decoration: underline;" target="_blank">View / Open Link</a>`
        : String(val).replace(/\n/g, '<br/>')

      return `
        <tr>
          <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 35%; font-size: 13px;">
            ${key}
          </td>
          <td style="padding: 10px 14px; background-color: #ffffff; border: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">
            ${formattedVal}
          </td>
        </tr>
      `
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background-color: ${config.color}; padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">
            Quickupp Institute
          </h1>
          <p style="margin: 6px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500;">
            Website Form Notification
          </p>
        </div>

        <!-- Banner / Tag -->
        <div style="padding: 20px 24px 0;">
          <div style="display: inline-block; padding: 6px 12px; background-color: #f1f5f9; border-radius: 8px; font-size: 12px; font-weight: 700; color: ${config.color}; text-transform: uppercase; letter-spacing: 0.5px;">
            ${config.label}
          </div>
          <h2 style="margin: 12px 0 6px; font-size: 18px; color: #0f172a; font-weight: 700;">
            New enquiry received from ${payload.name}
          </h2>
          <p style="margin: 0 0 16px; font-size: 13px; color: #64748b;">
            Submitted on ${submittedAt.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>

        <!-- Details Table -->
        <div style="padding: 0 24px 20px;">
          <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 35%; font-size: 13px;">Full Name</td>
              <td style="padding: 10px 14px; background-color: #ffffff; border: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600;">${payload.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; font-size: 13px;">Email Address</td>
              <td style="padding: 10px 14px; background-color: #ffffff; border: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">
                <a href="mailto:${payload.email}" style="color: #2563eb; text-decoration: underline;">${payload.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; font-size: 13px;">Phone Number</td>
              <td style="padding: 10px 14px; background-color: #ffffff; border: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">
                <a href="tel:${payload.phone}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${payload.phone}</a>
              </td>
            </tr>
            ${detailRows}
          </table>
        </div>

        <!-- Action Button -->
        <div style="padding: 0 24px 28px; text-align: center;">
          <a href="${adminUrl}" style="display: inline-block; padding: 12px 28px; background-color: ${config.color}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Open in Admin Portal &rarr;
          </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b;">
          This is an automated notification from the Quickupp Institute website.<br>
          Recipient: <strong style="color: #334155;">${recipient}</strong>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
New ${config.label} Received
================================
Name: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone}
Date: ${submittedAt.toLocaleString()}

Details:
${Object.entries(payload.details)
  .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== '')
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

View in Admin: ${adminUrl}
  `.trim()

  try {
    const transporter = getTransporter()
    if (!transporter) {
      console.log(`[Mail Notification] SMTP not configured. Notification details for ${recipient}:`)
      console.log(`[Mail Notification] Subject: ${subject}`)
      console.log(text)
      return { success: true, simulated: true }
    }

    const fromAddress = process.env.SMTP_FROM || `"Quickupp Institute" <${process.env.SMTP_USER}>`
    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      subject,
      text,
      html,
    })

    console.log(`[Mail Notification] Sent email for ${payload.type} to ${recipient}, id: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err: any) {
    console.error(`[Mail Notification] Failed to send email for ${payload.type}:`, err)
    // Non-blocking: We log error and return failure object without throwing
    return { success: false, error: err.message || 'Failed to send notification email' }
  }
}
