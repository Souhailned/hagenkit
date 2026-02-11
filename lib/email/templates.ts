/**
 * Email templates for Horecagrond notifications
 * Ready for Resend integration (currently logs to console)
 */

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export function newInquiryEmail(data: {
  agentName: string;
  agentEmail: string;
  propertyTitle: string;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone?: string;
  message: string;
  propertyUrl: string;
}): EmailData {
  return {
    to: data.agentEmail,
    subject: `Nieuw bericht voor ${data.propertyTitle} — Horecagrond`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 20px;">
    <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 8px;">Nieuw bericht ontvangen</h1>
    <p style="color: #64748b; margin: 0;">Er is een bericht binnengekomen voor je pand op Horecagrond.</p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px;">Pand</h2>
    <p style="color: #334155; margin: 0;"><strong>${data.propertyTitle}</strong></p>
    <a href="${data.propertyUrl}" style="color: #2563eb; text-decoration: none; font-size: 14px;">Bekijk pand →</a>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px;">Van</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="color: #64748b; padding: 4px 0; width: 100px;">Naam</td>
        <td style="color: #0f172a; padding: 4px 0;"><strong>${data.inquirerName}</strong></td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 4px 0;">Email</td>
        <td style="color: #0f172a; padding: 4px 0;"><a href="mailto:${data.inquirerEmail}" style="color: #2563eb;">${data.inquirerEmail}</a></td>
      </tr>
      ${data.inquirerPhone ? `
      <tr>
        <td style="color: #64748b; padding: 4px 0;">Telefoon</td>
        <td style="color: #0f172a; padding: 4px 0;"><a href="tel:${data.inquirerPhone}" style="color: #2563eb;">${data.inquirerPhone}</a></td>
      </tr>` : ''}
    </table>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px;">Bericht</h2>
    <p style="color: #334155; white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
  </div>

  <div style="text-align: center; margin-top: 32px;">
    <a href="mailto:${data.inquirerEmail}?subject=Re: ${data.propertyTitle}" 
       style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Beantwoord bericht
    </a>
  </div>

  <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
    Dit bericht is verzonden via <a href="https://horecagrond.nl" style="color: #94a3b8;">Horecagrond.nl</a>
  </p>
</body>
</html>`,
  };
}

export function viewingRequestEmail(data: {
  agentEmail: string;
  propertyTitle: string;
  requestorName: string;
  requestorEmail: string;
  requestorPhone?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  propertyUrl: string;
}): EmailData {
  return {
    to: data.agentEmail,
    subject: `Bezichtigingsverzoek voor ${data.propertyTitle} — Horecagrond`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #fef3c7; border-radius: 12px; padding: 32px; margin-bottom: 20px;">
    <h1 style="color: #92400e; font-size: 24px; margin: 0 0 8px;">📅 Bezichtigingsverzoek</h1>
    <p style="color: #a16207; margin: 0;">Iemand wil een bezichtiging plannen voor je pand.</p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px;">Details</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="color: #64748b; padding: 8px 0; width: 120px;">Pand</td>
        <td style="color: #0f172a; padding: 8px 0;"><strong>${data.propertyTitle}</strong></td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 8px 0;">Datum</td>
        <td style="color: #0f172a; padding: 8px 0;"><strong>${data.preferredDate}</strong></td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 8px 0;">Tijd</td>
        <td style="color: #0f172a; padding: 8px 0;"><strong>${data.preferredTime}</strong></td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 8px 0;">Naam</td>
        <td style="color: #0f172a; padding: 8px 0;">${data.requestorName}</td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 8px 0;">Email</td>
        <td style="color: #0f172a; padding: 8px 0;"><a href="mailto:${data.requestorEmail}" style="color: #2563eb;">${data.requestorEmail}</a></td>
      </tr>
      ${data.requestorPhone ? `
      <tr>
        <td style="color: #64748b; padding: 8px 0;">Telefoon</td>
        <td style="color: #0f172a; padding: 8px 0;"><a href="tel:${data.requestorPhone}" style="color: #2563eb;">${data.requestorPhone}</a></td>
      </tr>` : ''}
    </table>
    ${data.message ? `<p style="color: #334155; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">${data.message}</p>` : ''}
  </div>

  <div style="text-align: center; margin-top: 32px;">
    <a href="mailto:${data.requestorEmail}?subject=Bezichtiging ${data.propertyTitle}" 
       style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Bevestig bezichtiging
    </a>
  </div>

  <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
    Dit verzoek is verzonden via <a href="https://horecagrond.nl" style="color: #94a3b8;">Horecagrond.nl</a>
  </p>
</body>
</html>`,
  };
}

/**
 * Send email — currently logs to console, ready for Resend integration
 */
export async function sendEmail(email: EmailData): Promise<boolean> {
  // TODO: Integrate with Resend when API key is available
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'Horecagrond <noreply@horecagrond.nl>', ...email });

  console.log(`[EMAIL] To: ${email.to} | Subject: ${email.subject}`);
  return true;
}
