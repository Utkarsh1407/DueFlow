// components/ui/LoadingSkeleton.jsx

/**
 * LoadingSkeleton — animated shimmer skeleton for DueFlow
 *
 * Usage:
 *   <LoadingSkeleton variant="stat" />
 *   <LoadingSkeleton variant="table" rows={5} />
 *   <LoadingSkeleton variant="card" />
 *   <LoadingSkeleton variant="detail" />
 *   <LoadingSkeleton variant="activity" rows={4} />
 *   <LoadingSkeleton />   ← generic block
 */

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent";

// ─── Primitive ────────────────────────────────────────────────────────────────
function Bone({ className = "" }) {
  return (
    <div
      className={`rounded-md bg-zinc-800/70 ${shimmer} ${className}`}
    />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Bone className="h-3.5 w-24" />
        <Bone className="h-8 w-8 rounded-lg" />
      </div>
      <Bone className="h-8 w-32" />
      <Bone className="h-3 w-20" />
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-zinc-800/70">
      <Bone className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Bone className="h-3.5 w-36" />
        <Bone className="h-3 w-24" />
      </div>
      <Bone className="h-3.5 w-20 hidden sm:block" />
      <Bone className="h-3.5 w-16 hidden md:block" />
      <Bone className="h-6 w-16 rounded-full" />
      <Bone className="h-7 w-20 rounded-lg hidden lg:block" />
    </div>
  );
}

// ─── Invoice Card (mobile) ────────────────────────────────────────────────────
function InvoiceCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Bone className="h-9 w-9 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Bone className="h-3.5 w-28" />
            <Bone className="h-3 w-20" />
          </div>
        </div>
        <Bone className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Bone className="h-5 w-24" />
        <Bone className="h-3.5 w-20" />
      </div>
      <div className="flex gap-2 pt-1">
        <Bone className="h-8 flex-1 rounded-lg" />
        <Bone className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Detail Page ──────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Bone className="h-7 w-48" />
          <Bone className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-9 w-24 rounded-lg" />
          <Bone className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-2"
          >
            <Bone className="h-3 w-16" />
            <Bone className="h-5 w-24" />
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3">
        <Bone className="h-4 w-20" />
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-4/5" />
        <Bone className="h-3.5 w-3/5" />
      </div>

      {/* Activity */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
        <Bone className="h-4 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Bone className="h-3.5 w-48" />
              <Bone className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
function ActivitySkeleton({ rows = 5 }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 py-3 border-b border-zinc-800/60 last:border-0">
          <Bone className="h-8 w-8 rounded-full flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Bone className={`h-3.5 ${i % 2 === 0 ? "w-3/4" : "w-2/3"}`} />
            <Bone className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Bone className="h-4 w-36" />
        <Bone className="h-6 w-20 rounded-lg" />
      </div>
      <div className="flex items-end gap-3 h-40 pt-4">
        {[60, 85, 45, 70, 90, 55, 75].map((h, i) => (
          <Bone
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <Bone key={d} className="h-3 w-6" />
        ))}
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function FormSkeleton({ fields = 5 }) {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Bone className="h-3.5 w-24" />
          <Bone className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Bone className="h-10 w-28 rounded-lg" />
        <Bone className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Generic / Fallback ───────────────────────────────────────────────────────
function GenericSkeleton({ className = "" }) {
  return <Bone className={`h-6 w-full ${className}`} />;
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function LoadingSkeleton({
  variant = "generic",
  rows = 5,
  fields = 5,
  className = "",
}) {
  switch (variant) {
    case "stat":
      return <StatCardSkeleton />;

    case "stats":
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      );

    case "table":
      return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
            {[140, 100, 80, 70, 90].map((w, i) => (
              <Bone key={i} className={`h-3 rounded`} style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      );

    case "card":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: rows }).map((_, i) => (
            <InvoiceCardSkeleton key={i} />
          ))}
        </div>
      );

    case "detail":
      return <DetailSkeleton />;

    case "activity":
      return <ActivitySkeleton rows={rows} />;

    case "chart":
      return <ChartSkeleton />;

    case "form":
      return <FormSkeleton fields={fields} />;

    default:
      return <GenericSkeleton className={className} />;
  }
}

// Named exports for targeted use
export {
  StatCardSkeleton,
  TableRowSkeleton,
  InvoiceCardSkeleton,
  DetailSkeleton,
  ActivitySkeleton,
  ChartSkeleton,
  FormSkeleton,
  Bone,
};