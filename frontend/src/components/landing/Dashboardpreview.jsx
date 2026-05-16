// components/landing/DashboardPreview.jsx
import {
  FileText, Check, Clock, Zap, Rupee,
  ChartIcon, Bell, Activity,
} from "@/hooks/icons";
import { useInView } from "@/hooks/hooks";

const KPI_ITEMS = [
  { label: "Total Invoices", val: "10",      Icon: FileText, color: "#6366f1" },
  { label: "Paid",           val: "4",       Icon: Check,    color: "#22c55e" },
  { label: "Pending",        val: "5",       Icon: Clock,    color: "#f59e0b" },
  { label: "Overdue",        val: "1",       Icon: Zap,      color: "#ef4444" },
  { label: "Unpaid Amount",  val: "₹57,650", Icon: Rupee,    color: "#6366f1" },
];

const SIDEBAR_ITEMS = [
  { Icon: ChartIcon, label: "Dashboard", active: true },
  { Icon: FileText,  label: "Invoices"              },
  { Icon: Bell,      label: "Reminders"             },
  { Icon: Activity,  label: "Activity"              },
];

const LEGEND_ROWS = [
  ["#22c55e", "Paid",    "4 · 40%"],
  ["#f59e0b", "Pending", "5 · 50%"],
  ["#ef4444", "Overdue", "1 · 10%"],
];

const QUICK_ACTIONS = [
  { Icon: FileText, label: "New invoice",    sub: "Create and send",      accent: true },
  { Icon: Bell,     label: "Send reminders", sub: "5 pending · nudge now"             },
  { Icon: Zap,      label: "View overdue",   sub: "1 invoice past due"                },
];

const RECENT_INVOICES = [
  ["Aditya Joshi", "₹15,000", "May 20", "paid"],
  ["Vikram Nair",  "₹12,000", "May 25", "pending"],
  ["Priya Shah",   "₹8,500",  "May 18", "overdue"],
  ["Rohan Das",    "₹21,150", "Jun 1",  "pending"],
];

function DashDonut() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r="34" fill="none" stroke="#f1f5f9" strokeWidth="14" />
      <circle cx="45" cy="45" r="34" fill="none" stroke="#22c55e" strokeWidth="14"
        strokeDasharray="85 128.8" strokeDashoffset="0" transform="rotate(-90 45 45)" />
      <circle cx="45" cy="45" r="34" fill="none" stroke="#f59e0b" strokeWidth="14"
        strokeDasharray="107 106.8" strokeDashoffset="-85" transform="rotate(-90 45 45)" />
      <circle cx="45" cy="45" r="34" fill="none" stroke="#ef4444" strokeWidth="14"
        strokeDasharray="21.4 192.4" strokeDashoffset="-192" transform="rotate(-90 45 45)" />
    </svg>
  );
}

export default function DashboardPreview() {
  const [ref, inView] = useInView();

  return (
    <section className="l-dash-preview" id="dashboard-preview" ref={ref}>
      <div className={`l-container ${inView ? "l-animate-in" : ""}`}>
        <div className="l-section-label">Dashboard Preview</div>

        <h2 className="l-section-title">
          Your entire invoice workflow<br />
          <span className="l-gradient-text">in one place</span>
        </h2>

        <p className="l-section-sub">
          A powerful, clean dashboard that gives you full control without the complexity.
        </p>

        <div className="l-dp-shell">
          {/* Sidebar */}
          <aside className="l-dp-sidebar">
            <div className="l-dp-sidebar__logo">
              <div className="l-logo-icon l-logo-icon--sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13 }}>DueFlow</span>
            </div>
            <div className="l-dp-sidebar__section-label">MENU</div>
            {SIDEBAR_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`l-dp-sidebar__item ${item.active ? "l-dp-sidebar__item--active" : ""}`}
              >
                <item.Icon size={15} />
                <span>{item.label}</span>
              </div>
            ))}
          </aside>

          {/* Main area */}
          <div className="l-dp-main">
            <div className="l-dp-header">
              <span className="l-dp-page-title">Dashboard</span>
            </div>

            <div className="l-dp-greeting">Good afternoon 👋</div>

            {/* KPIs */}
            <div className="l-dp-kpi-row">
              {KPI_ITEMS.map((k) => (
                <div className="l-dp-kpi" key={k.label}>
                  <span className="l-dp-kpi__label">{k.label}</span>
                  <div className="l-dp-kpi__row">
                    <span className="l-dp-kpi__val">{k.val}</span>
                    <k.Icon size={16} stroke={k.color} />
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + Quick actions */}
            <div className="l-dp-mid-row">
              <div className="l-dp-chart-card">
                <div className="l-dp-card-title">
                  Invoice breakdown{" "}
                  <span className="l-dp-card-sub">Status distribution</span>
                </div>
                <div className="l-dp-chart-inner">
                  <DashDonut />
                  <div className="l-dp-legend">
                    {LEGEND_ROWS.map(([color, label, val]) => (
                      <div key={label} className="l-dp-legend-row">
                        <span className="l-legend-dot" style={{ background: color }} />
                        <span className="l-dp-legend-label">{label}</span>
                        <span className="l-dp-legend-val">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="l-dp-qa-card">
                <div className="l-dp-card-title">Quick actions</div>
                {QUICK_ACTIONS.map((qa) => (
                  <div key={qa.label} className={`l-dp-qa-row ${qa.accent ? "l-dp-qa-row--accent" : ""}`}>
                    <qa.Icon size={14} color={qa.accent ? "#fff" : "currentColor"} />
                    <div>
                      <div className="l-dp-qa-label">{qa.label}</div>
                      <div className="l-dp-qa-sub">{qa.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice table */}
            <div className="l-dp-table-card">
              <div className="l-dp-card-title">Recent invoices</div>
              <table className="l-dp-table">
                <thead>
                  <tr>
                    {["Client", "Amount", "Due Date", "Status"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_INVOICES.map(([client, amount, dueDate, status]) => (
                    <tr key={client}>
                      <td>{client}</td>
                      <td>{amount}</td>
                      <td>{dueDate}</td>
                      <td>
                        <span className={`l-dp-status l-dp-status--${status}`}>{status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}