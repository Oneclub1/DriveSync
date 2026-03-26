import nodemailer from 'nodemailer';
import { config } from '../config';

let transporter: nodemailer.Transporter;

function getTransporter() {
  if (!transporter) {
    if (!config.smtp.host || !config.smtp.user) {
      // Dev-Modus: E-Mails werden in die Konsole geloggt
      console.log('[Email] SMTP nicht konfiguriert - E-Mails werden nur geloggt');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

export async function sendInvitationEmail(
  toEmail: string,
  instructorName: string,
  inviteToken: string,
) {
  const inviteUrl = `${config.appUrl}/register?invite=${inviteToken}`;

  const subject = `${instructorName} lädt dich zu DriveSync ein`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Einladung zu DriveSync</h2>
      <p>Hallo,</p>
      <p><strong>${instructorName}</strong> lädt dich ein, DriveSync für die Buchung deiner Fahrstunden zu nutzen.</p>
      <p>Klicke auf den folgenden Link, um dich zu registrieren:</p>
      <p>
        <a href="${inviteUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Jetzt registrieren
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        Oder kopiere diesen Link: ${inviteUrl}
      </p>
      <p style="color: #666; font-size: 14px;">
        Diese Einladung ist 7 Tage gültig.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">DriveSync - Fahrstunden einfach buchen</p>
    </div>
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
    html,
  });
}
