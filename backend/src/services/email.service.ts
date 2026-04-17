import nodemailer from 'nodemailer';
import { config } from '../config';

let transporter: nodemailer.Transporter | null = null;
let initialized = false;

function getTransporter() {
  if (initialized) return transporter;
  initialized = true;

  if (!config.smtp.host || !config.smtp.user) {
    console.log('[Email] SMTP nicht konfiguriert - E-Mails werden nur geloggt');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  return transporter;
}

function wrapHtml(title: string, body: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #2563eb; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">DriveSync</h1>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="margin-top: 0; color: #1f2937;">${title}</h2>
        <div style="color: #4b5563; line-height: 1.6;">${body}</div>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
        DriveSync - Fahrstunden einfach buchen
      </p>
    </div>
  `;
}

/**
 * Generic E-Mail-Versand für Notifications.
 */
export async function sendEmail(toEmail: string, subject: string, message: string) {
  const html = wrapHtml(subject, `<p>${message.replace(/\n/g, '<br/>')}</p>`);
  const smtp = getTransporter();
  if (!smtp) {
    console.log(`[Email] An: ${toEmail} | Betreff: ${subject}`);
    console.log(`[Email] Inhalt: ${message}`);
    return;
  }
  await smtp.sendMail({ from: config.smtp.from, to: toEmail, subject, html });
}

export async function sendInvitationEmail(
  toEmail: string,
  instructorName: string,
  inviteToken: string,
) {
  const inviteUrl = `${config.appUrl}/register?invite=${inviteToken}`;
  const subject = `${instructorName} lädt dich zu DriveSync ein`;
  const body = `
    <p>Hallo,</p>
    <p><strong>${instructorName}</strong> lädt dich ein, DriveSync für die Buchung deiner Fahrstunden zu nutzen.</p>
    <p>
      <a href="${inviteUrl}"
         style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
        Jetzt registrieren
      </a>
    </p>
    <p style="color: #666; font-size: 14px;">Oder kopiere diesen Link: ${inviteUrl}</p>
    <p style="color: #666; font-size: 14px;">Diese Einladung ist 7 Tage gültig.</p>
  `;

  const smtp = getTransporter();
  if (!smtp) {
    console.log(`[Email] Einladung an ${toEmail}:`);
    console.log(`[Email] Link: ${inviteUrl}`);
    return;
  }

  await smtp.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject,
    html: wrapHtml(subject, body),
  });
}
