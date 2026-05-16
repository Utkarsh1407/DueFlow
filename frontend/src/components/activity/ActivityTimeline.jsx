import { format, isToday, isYesterday } from "date-fns";
import ActivityItem from "./ActivityItem";
import { Activity } from "lucide-react";

function groupActivitiesByDate(activities) {
  const groups = {};
  activities.forEach((activity) => {
    const date = new Date(activity.createdAt);
    let label;
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";
    else label = format(date, "EEEE, MMMM d");
    if (!groups[label]) groups[label] = [];
    groups[label].push(activity);
  });
  return Object.entries(groups);
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
        <Activity className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-gray-700 font-semibold text-base mb-1">
        No activity yet
      </h3>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
        Actions like creating invoices, sending reminders, and marking payments
        will appear here.
      </p>
    </div>
  );
}

export default function ActivityTimeline({ activities = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 animate-pulse" />
            <div className="flex-1 rounded-xl bg-white border border-gray-200 p-4 space-y-2 animate-pulse shadow-sm">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-gray-200 rounded-full" />
                <div className="h-3 w-16 bg-gray-100 rounded-full" />
              </div>
              <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
              <div className="h-6 w-40 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) return <EmptyState />;

  const grouped = groupActivitiesByDate(activities);

  return (
    <div className="space-y-8">
      {grouped.map(([dateLabel, items]) => (
        <div key={dateLabel}>
          {/* Date label */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              {dateLabel}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            <span className="text-[11px] text-gray-400 font-mono">
              {items.length} event{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Activity items */}
          <div>
            {items.map((activity, idx) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={idx === items.length - 1}
                index={idx}
              />
            ))}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}