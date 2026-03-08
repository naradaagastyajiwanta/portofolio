import nodemailer from 'nodemailer';

// ─── Config ─────────────────────────────────────────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL; // where to send notifications

const isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS && NOTIFY_EMAIL);

// Create transporter only if configured
const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

export async function sendContactNotification(contact: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  if (!transporter || !isConfigured) {
    console.log('[Email] SMTP not configured — skipping notification email.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      replyTo: contact.email,
      subject: `📬 New Contact: ${contact.subject || 'No Subject'} — from ${contact.name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">📬 New Contact Message</h1>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: 0; padding: 24px; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 80px; vertical-align: top;">From:</td>
                <td style="padding: 8px 0; font-size: 14px;"><strong>${contact.name}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Email:</td>
                <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${contact.email}" style="color: #667eea;">${contact.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Subject:</td>
                <td style="padding: 8px 0; font-size: 14px;">${contact.subject || '<em style="color: #9ca3af;">No subject</em>'}</td>
              </tr>
            </table>
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 8px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${contact.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
            <div style="margin-top: 20px; text-align: center;">
              <a href="mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject || 'Your message')}" style="display: inline-block; background: #667eea; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px;">Reply to ${contact.name}</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              Sent from your portfolio contact form
            </p>
          </div>
        </div>
      `,
      text: `New message from ${contact.name} (${contact.email})\n\nSubject: ${contact.subject || 'N/A'}\n\n${contact.message}`,
    });

    console.log(`[Email] Notification sent to ${NOTIFY_EMAIL}`);
  } catch (error) {
    console.error('[Email] Failed to send notification:', error);
    // Don't throw — email failure shouldn't break the contact form
  }
}
