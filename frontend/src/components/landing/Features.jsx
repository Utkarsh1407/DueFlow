// components/landing/Features.jsx
import {
  Bell, Activity, Users, FileText, Zap, ChartIcon, ChevronRight, Template,
} from "@/hooks/icons";
import { useInView } from "@/hooks/hooks";

const FEATURES = [
  {
    Icon:  Bell,
    title: "One-Click Reminders",
    desc:  "Send professional payment reminder emails to clients instantly with a single click, with a built-in 24-hour cooldown to prevent spam.",
    color: "#6366f1",
  },
  {
    Icon:  FileText,
    title: "Invoice Tracking",
    desc:  "Track paid, pending, and overdue invoices in real time from one clean view.",
    color: "#22c55e",
  },
  {
    Icon:  Activity,
    title: "Activity Timeline",
    desc:  "Monitor invoice activity and reminder history with a detailed event log.",
    color: "#f59e0b",
  },
  {
    Icon:  ChartIcon,
    title: "Analytics Dashboard",
    desc:  "View revenue, payment trends, and overdue insights with visual charts.",
    color: "#ec4899",
  },
  {
    Icon:  Template,
    title: "Reminder Templates",
    desc:  "Use friendly, professional, or final-warning reminder styles per client.",
    color: "#14b8a6",
  },
  {
    Icon:  Users,
    title: "Client Management",
    desc:  "Store and manage all invoice clients with contact and payment history.",
    color: "#f97316",
  },
];

export default function Features() {
  const [ref, inView] = useInView();

  return (
    <section className="l-features" id="features" ref={ref}>
      <div className={`l-container ${inView ? "l-animate-in" : ""}`}>
        <div className="l-section-label">Features</div>

        <h2 className="l-section-title">
          Everything you need to<br />
          <span className="l-gradient-text">get paid on time</span>
        </h2>

        <p className="l-section-sub">
          DueFlow brings all your invoice management into one streamlined workspace.
        </p>

        <div className="l-features__grid">
          {FEATURES.map((feature, i) => (
            <div
              className="l-feature-card"
              key={feature.title}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="l-feature-card__icon">
                <feature.Icon size={22} stroke={feature.color} />
              </div>
              <h3 className="l-feature-card__title">{feature.title}</h3>
              <p className="l-feature-card__desc">{feature.desc}</p>
              <div className="l-feature-card__arrow">
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}