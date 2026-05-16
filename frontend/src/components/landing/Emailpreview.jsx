// components/landing/EmailPreview.jsx
import { Zap, Template, Check } from "@/hooks/icons";
import { useInView } from "@/hooks/hooks";

const INVOICE_DETAILS = [
  { label: "Invoice",    value: "#INV-0047" },
  { label: "Amount Due", value: "₹12,000.00", isAmount: true },
  { label: "Due Date",   value: "May 25, 2026" },
  { label: "Status",     value: "Pending",     isStatus: true },
];

const CALLOUTS = [
  {
    Icon:  Zap,
    title: "Auto-triggered",
    desc:  "Sent automatically based on due date rules you define once.",
  },
  {
    Icon:  Template,
    title: "Customisable templates",
    desc:  "Friendly, professional, or final-warning tones — your choice.",
  },
  {
    Icon:  Check,
    title: "Delivered reliably",
    desc:  "High deliverability so your reminders land in the inbox.",
  },
];

export default function EmailPreview() {
  const [ref, inView] = useInView();

  return (
    <section className="l-email-section" id="about" ref={ref}>
      <div className={`l-container ${inView ? "l-animate-in" : ""}`}>
        <div className="l-section-label">Reminder Emails</div>

        <h2 className="l-section-title">
          Automated emails that<br />
          <span className="l-gradient-text">actually get opened</span>
        </h2>

        <p className="l-section-sub">
          Professional, personalised payment reminders sent automatically.
        </p>

        <div className="l-email-wrapper">
          {/* Email chrome mockup */}
          <div className="l-email-chrome">
            <div className="l-email-chrome__bar">
              <div className="l-chrome-dot" style={{ background: "#ef4444" }} />
              <div className="l-chrome-dot" style={{ background: "#f59e0b" }} />
              <div className="l-chrome-dot" style={{ background: "#22c55e" }} />
              <span className="l-chrome-title">Payment Reminder · Gmail</span>
            </div>

            <div className="l-email-msg">
              {/* Header meta */}
              <div className="l-email-meta">
                <div className="l-email-avatar">D</div>
                <div>
                  <div className="l-email-from">
                    DueFlow{" "}
                    <span className="l-email-addr">&lt;hello@dueflow.app&gt;</span>
                  </div>
                  <div className="l-email-to">To: vikram@example.com</div>
                </div>
                <div className="l-email-time">Just now</div>
              </div>

              <div className="l-email-subject">📋 Invoice #INV-0047 — Payment Reminder</div>

              <div className="l-email-body">
                <p>Hi Vikram,</p>
                <p>
                  Hope you&apos;re doing well! This is a friendly reminder that the following
                  invoice is due soon.
                </p>

                <div className="l-email-inv-box">
                  {INVOICE_DETAILS.map(({ label, value, isAmount, isStatus }) => (
                    <div className="l-email-inv-row" key={label}>
                      <span>{label}</span>
                      {isAmount ? (
                        <span className="l-email-inv-amt">{value}</span>
                      ) : isStatus ? (
                        <span className="l-chip l-chip--pending">{value}</span>
                      ) : (
                        <span>{value}</span>
                      )}
                    </div>
                  ))}
                </div>

                <a
                  href="#"
                  className="l-email-cta-btn"
                  onClick={(e) => e.preventDefault()}
                >
                  Pay Invoice Now →
                </a>

                <p className="l-email-footer-note">
                  If you&apos;ve already made the payment, please disregard this message.
                  Thank you for your business!
                </p>

                <div className="l-email-sig">
                  <strong>DueFlow Team</strong><br />
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    Automated via DueFlow · hello@dueflow.app
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Callouts */}
          <div className="l-email-callouts">
            {CALLOUTS.map((c) => (
              <div className="l-email-callout" key={c.title}>
                <div className="l-email-callout__icon">
                  <c.Icon size={18} color="#6366f1" />
                </div>
                <div>
                  <div className="l-email-callout__title">{c.title}</div>
                  <div className="l-email-callout__desc">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}