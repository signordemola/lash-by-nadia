export function confirmationHtml(params: {
  clientName: string
  service: string
  date: string
  time: string
  deposit: string
  manageUrl: string
}) {
  return `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; color: #333; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Booking confirmed</h1>
  <p style="font-size: 16px; color: #666; margin-bottom: 32px;">
    Hi ${params.clientName}, your appointment has been confirmed.
  </p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #999;">Treatment</td>
      <td style="padding: 12px 4px; text-align: right; font-size: 14px; font-weight: 600;">${params.service}</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #999;">Date</td>
      <td style="padding: 12px 4px; text-align: right; font-size: 14px;">${params.date}</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #999;">Time</td>
      <td style="padding: 12px 4px; text-align: right; font-size: 14px;">${params.time}</td>
    </tr>
    <tr>
      <td style="padding: 12px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #999;">Deposit</td>
      <td style="padding: 12px 4px; text-align: right; font-size: 14px; font-weight: 600;">${params.deposit}</td>
    </tr>
  </table>

  <a href="${params.manageUrl}" style="display: inline-block; background: #222; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600;">
    Manage booking
  </a>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #999; line-height: 1.6;">
      Lash by Nadia<br />
      Cambridge Heath Road, Bethnal Green<br />
      Entrance via the teal doors.
    </p>
  </div>
</body>
</html>`
}
