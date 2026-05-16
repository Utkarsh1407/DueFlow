// components/landing/Hero.jsx
import { ArrowRight } from "@/hooks/icons";
import { useInView } from "@/hooks/hooks";

const STATS = [
  ["10+",   "Invoices tracked"],
  ["₹57K+", "Amount managed"],
  ["6",     "Reminders sent"],
];

const MOCKUP_STATS = [
  { label: "Total",   val: "10", color: "#6366f1" },
  { label: "Paid",    val: "4",  color: "#22c55e" },
  { label: "Pending", val: "5",  color: "#f59e0b" },
  { label: "Overdue", val: "1",  color: "#ef4444" },
];

const LEGEND = [
  ["#22c55e", "Paid 40%"],
  ["#f59e0b", "Pending 50%"],
  ["#ef4444", "Overdue 10%"],
];

const INVOICES = [
  { client: "Vikram Nair", amt: "₹12,000", status: "pending" },
  { client: "Priya Shah",  amt: "₹8,500",  status: "paid"    },
  { client: "Rohan Das",   amt: "₹21,150", status: "overdue" },
];

function FloatingBadge({ children, style }) {
  return (
    <div className="l-floating-badge" style={style}>
      {children}
    </div>
  );
}

function MockupDonut() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="30" fill="none" stroke="#f1f5f9" strokeWidth="12" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="#22c55e" strokeWidth="12"
        strokeDasharray="75.4 188.5" strokeDashoffset="0" transform="rotate(-90 40 40)" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" strokeWidth="12"
        strokeDasharray="94.2 169.6" strokeDashoffset="-75.4" transform="rotate(-90 40 40)" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" strokeWidth="12"
        strokeDasharray="18.8 244.9" strokeDashoffset="-169.6" transform="rotate(-90 40 40)" />
    </svg>
  );
}

export default function Hero() {
  const [ref, inView] = useInView(0.1);

  return (
    <section className="l-hero" ref={ref}>
      {/* Background */}
      <div className="l-hero__bg">
        <div className="l-hero__blob l-hero__blob--1" />
        <div className="l-hero__blob l-hero__blob--2" />
        <div className="l-hero__grid" />
      </div>

      <div className={`l-hero__content l-container ${inView ? "l-animate-in" : ""}`}>
        {/* Left — copy */}
        <div className="l-hero__left">
          <div className="l-hero__badge">
            <span className="l-badge-dot" />
            Invoice automation for freelancers &amp; agencies
          </div>

          <h1 className="l-hero__headline">
            Get Paid Faster.<br />
            <span className="l-gradient-text">Automate Invoice</span><br />
            Reminders Effortlessly.
          </h1>

          <p className="l-hero__sub">
            Track invoices, automate payment reminders, and manage overdue payments
            with a clean and powerful workflow.
          </p>

          <div className="l-hero__ctas">
            <a href="/dashboard" className="l-btn l-btn--primary l-btn--lg">
              Start Managing Invoices
            <ArrowRight size={18} />
            </a>
            <a href="#dashboard-preview" className="l-btn l-btn--outline l-btn--lg">
              View Dashboard
            </a>
          </div>

          <div className="l-hero__stats">
            {STATS.map(([num, label]) => (
              <div className="l-stat" key={label}>
                <span className="l-stat__num">{num}</span>
                <span className="l-stat__label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — mockup */}
        <div className="l-hero__right">
          <div className="l-mockup">
            {/* Main card */}
            <div className="l-mockup__card">
              <div className="l-mockup__header">
                <span className="l-mockup__title">Invoice Overview</span>
                <span className="l-mockup__live-badge">Live</span>
              </div>

              <div className="l-mockup__stats-row">
                {MOCKUP_STATS.map((s) => (
                  <div className="l-mockup__stat" key={s.label}>
                    <span className="l-mockup__stat-val" style={{ color: s.color }}>{s.val}</span>
                    <span className="l-mockup__stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="l-mockup__chart-row">
                <MockupDonut />
                <div className="l-mockup__legend">
                  {LEGEND.map(([color, label]) => (
                    <div className="l-legend-item" key={label}>
                      <span className="l-legend-dot" style={{ background: color }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="l-mockup__invoice-list">
                {INVOICES.map((inv) => (
                  <div className="l-inv-chip" key={inv.client}>
                    <span className="l-inv-chip__client">{inv.client}</span>
                    <span className="l-inv-chip__amt">{inv.amt}</span>
                    <span className={`l-chip l-chip--${inv.status}`}>{inv.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <FloatingBadge style={{ top: "12%", right: "-8%", animationDelay: "0.5s" }}>
              <div className="l-fbadge-inner">
                <span className="l-fbadge-icon">₹</span>
                <div>
                  <div className="l-fbadge-val">₹57,650</div>
                  <div className="l-fbadge-sub">Unpaid amount</div>
                </div>
              </div>
            </FloatingBadge>

            <FloatingBadge style={{ bottom: "18%", left: "-10%", animationDelay: "1s" }}>
              <div className="l-fbadge-inner">
                <span className="l-fbadge-icon">🔔</span>
                <div>
                  <div className="l-fbadge-val">Reminder sent</div>
                  <div className="l-fbadge-sub">Aditya Joshi · just now</div>
                </div>
              </div>
            </FloatingBadge>
          </div>
        </div>
      </div>
    </section>
  );
}