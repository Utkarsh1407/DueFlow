import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useState } from "react";

const STATUS_CONFIG = {
  paid: { label: "Paid", color: "#22C55E", bg: "bg-[#EDFBF3]", text: "text-[#1A7A45]" },
  pending: { label: "Pending", color: "#F59E0B", bg: "bg-[#FFFBEB]", text: "text-[#92600A]" },
  overdue: { label: "Overdue", color: "#EF4444", bg: "bg-[#FEF1F1]", text: "text-[#B42B2B]" },
};

const VIEWS = ["donut", "bar"];

/* Custom tooltip for both chart types */
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cfg = STATUS_CONFIG[d.status] ?? {};
  return (
    <div className="rounded-xl border border-[#E8E8E4] bg-white px-3 py-2 shadow-sm text-[12px]">
      <p className="font-medium text-[#111110]">{cfg.label ?? d.status}</p>
      <p className="text-[#888880]">
        {d.count} invoice{d.count !== 1 ? "s" : ""} · {d.percent}%
      </p>
    </div>
  );
}

/* Custom label in the center of the donut */
function DonutCenterLabel({ viewBox, total }) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        className="fill-[#111110]"
        style={{
          fontSize: 22,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          fill: "#111110",
        }}
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 13}
        textAnchor="middle"
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fill: "#AAAA9F",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Total
      </text>
    </g>
  );
}

/**
 * InvoiceStatusChart
 * Props:
 *   data    — [{ status: "paid"|"pending"|"overdue", count: number }]
 *   loading — boolean
 */
export default function InvoiceStatusChart({ data = [], loading = false }) {
  const [view, setView] = useState("donut");

  if (loading) return <InvoiceStatusChartSkeleton />;

  const total = data.reduce((s, d) => s + d.count, 0);

  const enriched = data.map((d) => ({
    ...d,
    ...STATUS_CONFIG[d.status],
    percent: total ? Math.round((d.count / total) * 100) : 0,
  }));

  const isEmpty = total === 0;

  return (
    <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p
            className="text-[13px] font-semibold text-[#111110]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Invoice breakdown
          </p>
          <p className="text-[11.5px] text-[#AAAA9F] mt-0.5">
            Status distribution
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-[#F2F2EE] p-1">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "rounded-lg px-3 py-1 text-[11.5px] font-medium capitalize transition-all duration-150",
                view === v
                  ? "bg-white text-[#111110] shadow-sm"
                  : "text-[#AAAA9F] hover:text-[#888880]",
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
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="count"
                    strokeWidth={0}
                  >
                    {enriched.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                    <label
                      content={<DonutCenterLabel total={total} />}
                    />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              ) : (
                <BarChart
                  data={enriched}
                  barSize={28}
                  margin={{ top: 4, right: 4, bottom: 0, left: -28 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#F2F2EE"
                    strokeDasharray="0"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                      fill: "#AAAA9F",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#AAAA9F",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F7F7F5" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {enriched.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
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
                  style={{ backgroundColor: d.color }}
                />
                <div>
                  <p className="text-[12px] font-medium text-[#111110]">
                    {d.label}
                  </p>
                  <p className="text-[11px] text-[#AAAA9F]">
                    {d.count} · {d.percent}%
                  </p>
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
      <div className="h-16 w-16 rounded-full bg-[#F7F7F5] border-4 border-dashed border-[#E8E8E4]" />
      <p className="text-[12.5px] text-[#AAAA9F]">No invoice data yet</p>
    </div>
  );
}

export function InvoiceStatusChartSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 rounded-full bg-[#F2F2EE] animate-pulse" />
          <div className="h-3 w-24 rounded-full bg-[#F2F2EE] animate-pulse" />
        </div>
        <div className="h-8 w-28 rounded-xl bg-[#F2F2EE] animate-pulse" />
      </div>
      <div className="flex items-center gap-6">
        <div className="h-44 w-44 rounded-full bg-[#F2F2EE] animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#E8E8E4] animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-16 rounded-full bg-[#F2F2EE] animate-pulse" />
                <div className="h-2.5 w-12 rounded-full bg-[#F2F2EE] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}