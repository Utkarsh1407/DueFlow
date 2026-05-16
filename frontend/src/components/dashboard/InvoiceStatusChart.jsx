import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useState } from "react";

const STATUS_CONFIG = {
  paid:    { label: "Paid",    color: "var(--color-paid)",    bg: "bg-[var(--color-paid-bg)]",    text: "text-[var(--color-paid-text)]"    },
  pending: { label: "Pending", color: "var(--color-pending)", bg: "bg-[var(--color-pending-bg)]", text: "text-[var(--color-pending-text)]" },
  overdue: { label: "Overdue", color: "var(--color-overdue)", bg: "bg-[var(--color-overdue-bg)]", text: "text-[var(--color-overdue-text)]" },
};

// Resolve CSS variables to actual hex values for Recharts (canvas can't read CSS vars)
function resolveColor(varName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName.replace("var(", "").replace(")", ""))
    .trim();
}

const VIEWS = ["donut", "bar"];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cfg = STATUS_CONFIG[d.status] ?? {};
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 shadow-sm text-[12px]">
      <p className="font-medium text-[var(--color-text-primary)]">{cfg.label ?? d.status}</p>
      <p className="text-[var(--color-text-tertiary)]">
        {d.count} invoice{d.count !== 1 ? "s" : ""} · {d.percent}%
      </p>
    </div>
  );
}

function DonutCenterLabel({ viewBox, total }) {
  const { cx, cy } = viewBox;
  const textPrimary = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-text-primary").trim();
  const textMuted = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-text-muted").trim();
  return (
    <g>
      <text
        x={cx} y={cy - 6} textAnchor="middle"
        style={{ fontSize: 22, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", fill: textPrimary || "#111110" }}
      >
        {total}
      </text>
      <text
        x={cx} y={cy + 13} textAnchor="middle"
        style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", fill: textMuted || "#AAAA9F", fontFamily: "'DM Sans', sans-serif" }}
      >
        Total
      </text>
    </g>
  );
}

export default function InvoiceStatusChart({ data = [], loading = false }) {
  const [view, setView] = useState("donut");

  if (loading) return <InvoiceStatusChartSkeleton />;

  const total = data.reduce((s, d) => s + d.count, 0);

  const enriched = data.map((d) => ({
    ...d,
    ...STATUS_CONFIG[d.status],
    resolvedColor: resolveColor(STATUS_CONFIG[d.status]?.color ?? "var(--color-text-muted)"),
    percent: total ? Math.round((d.count / total) * 100) : 0,
  }));

  const isEmpty = total === 0;

  const gridColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-bg-subtle").trim() || "#F2F2EE";
  const axisTickColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-text-muted").trim() || "#AAAA9F";
  const barCursorColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-bg-app").trim() || "#F7F7F5";

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-text-primary)]"
             style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Invoice breakdown
          </p>
          <p className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5">
            Status distribution
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-[var(--color-bg-subtle)] p-1">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "rounded-lg px-3 py-1 text-[11.5px] font-medium capitalize transition-all duration-150",
                view === v
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)]",
              ].join(" ")}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <EmptyChart />
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Chart */}
          <div className="w-full sm:w-48 h-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              {view === "donut" ? (
                <PieChart>
                  <Pie
                    data={enriched}
                    cx="50%" cy="50%"
                    innerRadius="58%" outerRadius="80%"
                    paddingAngle={3} dataKey="count" strokeWidth={0}
                  >
                    {enriched.map((entry, i) => (
                      <Cell key={i} fill={entry.resolvedColor} />
                    ))}
                    <label content={<DonutCenterLabel total={total} />} />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              ) : (
                <BarChart data={enriched} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                  <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: axisTickColor, fontFamily: "'DM Sans', sans-serif" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: axisTickColor, fontFamily: "'DM Sans', sans-serif" }}
                    axisLine={false} tickLine={false} allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: barCursorColor }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {enriched.map((entry, i) => (
                      <Cell key={i} fill={entry.resolvedColor} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-row sm:flex-col gap-3 flex-wrap">
            {enriched.map((d) => (
              <div key={d.status} className="flex items-center gap-2.5 min-w-[100px]">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.resolvedColor }}
                />
                <div>
                  <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{d.label}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{d.count} · {d.percent}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-44 gap-2">
      <div className="h-16 w-16 rounded-full bg-[var(--color-bg-app)] border-4 border-dashed border-[var(--color-border)]" />
      <p className="text-[12.5px] text-[var(--color-text-muted)]">No invoice data yet</p>
    </div>
  );
}

export function InvoiceStatusChartSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
          <div className="h-3 w-24 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
        </div>
        <div className="h-8 w-28 rounded-xl bg-[var(--color-bg-subtle)] animate-pulse" />
      </div>
      <div className="flex items-center gap-6">
        <div className="h-44 w-44 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-border)] animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-16 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
                <div className="h-2.5 w-12 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}