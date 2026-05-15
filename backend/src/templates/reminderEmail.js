// server/src/templates/reminderEmail.js

/**
 * reminderEmailTemplate
 * Returns a full HTML email string for payment reminders.
 *
 * @param {Object} params
 * @param {string} params.clientName
 * @param {string} params.amount        — pre-formatted, e.g. "₹24,500.00"
 * @param {string} params.dueDate       — pre-formatted, e.g. "12 May 2025"
 * @param {string} params.invoiceId
 */
export function reminderEmailTemplate({ clientName, amount, dueDate, invoiceId }) {
  const firstName = clientName.trim().split(" ")[0];
  const year      = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Payment Reminder — DueFlow</title>
  <style>
    /* Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                   Roboto, Helvetica, Arial, sans-serif;
      background-color: #F7F7F5;
      margin: 0;
      padding: 0;
    }

    .email-wrapper {
      background-color: #F7F7F5;
      padding: 40px 16px;
    }

    .email-container {
      max-width: 520px;
      margin: 0 auto;
    }

    /* Logo bar */
    .logo-bar {
      text-align: center;
      padding-bottom: 28px;
    }
    .logo-inner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .logo-icon {
      display: inline-block;
      width: 28px;
      height: 28px;
      background-color: #E8FF8B;
      border-radius: 8px;
      line-height: 28px;
      text-align: center;
      font-size: 14px;
    }
    .logo-text {
      font-size: 15px;
      font-weight: 600;
      color: #111110;
      letter-spacing: -0.02em;
    }

    /* Card */
    .card {
      background-color: #ffffff;
      border-radius: 20px;
      border: 1px solid #E8E8E4;
      overflow: hidden;
    }

    /* Card top accent bar */
    .card-accent {
      height: 4px;
      background: linear-gradient(90deg, #E8FF8B 0%, #c8f542 100%);
    }

    /* Card body */
    .card-body {
      padding: 36px 36px 32px;
    }

    /* Greeting */
    .greeting {
      font-size: 22px;
      font-weight: 600;
      color: #111110;
      letter-spacing: -0.02em;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    .subtext {
      font-size: 14px;
      color: #888880;
      line-height: 1.6;
      margin-bottom: 28px;
    }

    /* Invoice summary box */
    .summary-box {
      background-color: #F7F7F5;
      border: 1px solid #E8E8E4;
      border-radius: 14px;
      padding: 20px 22px;
      margin-bottom: 28px;
    }
    .summary-label {
      font-size: 10.5px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #AAAA9F;
      margin-bottom: 14px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 0;
      border-bottom: 1px solid #EFEFEB;
    }
    .summary-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .summary-row:first-of-type {
      padding-top: 0;
    }
    .summary-key {
      font-size: 12.5px;
      color: #888880;
    }
    .summary-val {
      font-size: 13px;
      font-weight: 500;
      color: #111110;
    }
    .summary-val.amount {
      font-size: 15px;
      font-weight: 600;
      color: #111110;
    }
    .summary-val.overdue {
      color: #B42B2B;
    }

    /* CTA button */
    .cta-wrapper {
      text-align: center;
      margin-bottom: 28px;
    }
    .cta-btn {
      display: inline-block;
      background-color: #111110;
      color: #ffffff !important;
      font-size: 13.5px;
      font-weight: 500;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 12px;
      letter-spacing: -0.01em;
    }

    /* Divider */
    .divider {
      border: none;
      border-top: 1px solid #F2F2EE;
      margin: 24px 0;
    }

    /* Note */
    .note {
      font-size: 12.5px;
      color: #AAAA9F;
      line-height: 1.6;
      text-align: center;
    }
    .note a {
      color: #888880;
      text-decoration: underline;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding-top: 24px;
      padding-bottom: 8px;
    }
    .footer p {
      font-size: 11.5px;
      color: #BCBCB0;
      line-height: 1.8;
    }
    .footer a {
      color: #BCBCB0;
      text-decoration: none;
    }

    /* Mobile */
    @media only screen and (max-width: 520px) {
      .card-body { padding: 24px 20px 20px; }
      .greeting  { font-size: 18px; }
      .cta-btn   { display: block; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- Logo -->
      <div class="logo-bar">
        <div class="logo-inner">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">DueFlow</span>
        </div>
      </div>

      <!-- Card -->
      <div class="card">
        <div class="card-accent"></div>

        <div class="card-body">

          <!-- Greeting -->
          <p class="greeting">Hi ${firstName},</p>
          <p class="subtext">
            This is a friendly reminder that you have an outstanding payment
            with us. Please find the invoice details below.
          </p>

          <!-- Invoice summary -->
          <div class="summary-box">
            <p class="summary-label">Invoice Summary</p>

            <div class="summary-row">
              <span class="summary-key">Invoice ID</span>
              <span class="summary-val">#${invoiceId.slice(-8).toUpperCase()}</span>
            </div>

            <div class="summary-row">
              <span class="summary-key">Client</span>
              <span class="summary-val">${clientName}</span>
            </div>

            <div class="summary-row">
              <span class="summary-key">Due date</span>
              <span class="summary-val">${dueDate}</span>
            </div>

            <div class="summary-row">
              <span class="summary-key">Amount due</span>
              <span class="summary-val amount">${amount}</span>
            </div>
          </div>

          <!-- CTA -->
          <div class="cta-wrapper">
            
              href="${process.env.CLIENT_URL ?? "http://localhost:5173"}/invoices/${invoiceId}"
              class="cta-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Invoice →
            </a>
          </div>

          <hr class="divider" />

          <!-- Note -->
          <p class="note">
            If you've already made this payment, please disregard this email.<br />
            Questions? Reply to this email and we'll sort it out.
          </p>

        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>
          Sent via <strong>DueFlow</strong> — Smart Invoice Management<br />
          Invoice ID: ${invoiceId}<br />
          &copy; ${year} DueFlow. All rights reserved.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `.trim();
}