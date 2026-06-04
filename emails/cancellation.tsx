const outcomeText: Record<string, string> = {
  refund:
    "Your deposit has been fully refunded to your card. You should see the amount returned within 3–5 working days.",
  credit: "Your deposit has been held as credit toward your next visit.",
  forfeit:
    "Per the cancellation policy agreed at booking, your deposit has been forfeited.",
}

export function cancellationHtml(params: {
  clientName: string
  service: string
  date: string
  time: string
  deposit: string
  depositAmount: number
  outcome: "refund" | "credit" | "forfeit"
}) {
  const depositBox =
    params.depositAmount === 0
      ? `<div style="background: #f9f9f9; border-radius: 4px; padding: 20px; margin-bottom: 32px;">
           <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">No deposit taken</p>
           <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
             No deposit was taken for this booking — nothing to refund.
           </p>
         </div>`
      : `<div style="background: #f9f9f9; border-radius: 4px; padding: 20px; margin-bottom: 32px;">
           <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Deposit: ${params.deposit}</p>
           <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
             ${outcomeText[params.outcome]}
           </p>
         </div>`

  return `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; color: #333; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Appointment cancelled</h1>
  <p style="font-size: 16px; color: #666; margin-bottom: 32px;">
    Hi ${params.clientName}, your ${params.service} appointment on ${params.date} at ${params.time} has been cancelled.
  </p>

  ${depositBox}

  <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="display: inline-block; background: #222; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600;">
    Book again
  </a>
</body>
</html>`
}
