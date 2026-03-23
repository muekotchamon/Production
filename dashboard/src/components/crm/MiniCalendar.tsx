"use client";

import {
  SCHEDULE_MONTH_INDEX,
  SCHEDULE_TODAY_DOM,
  SCHEDULE_YEAR,
} from "@/lib/schedule-data";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

type MiniCalendarProps = {
  year?: number;
  monthIndex?: number;
  highlightDay?: number;
  compact?: boolean;
  /** Omit outer card — use inside a larger panel */
  embedded?: boolean;
  className?: string;
};

export default function MiniCalendar({
  year = SCHEDULE_YEAR,
  monthIndex = SCHEDULE_MONTH_INDEX,
  highlightDay = SCHEDULE_TODAY_DOM,
  compact = false,
  embedded = false,
  className = "",
}: MiniCalendarProps) {
  const label = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);

  const inner = (
    <>
      <div className="app-cal-head">
        <span
          className="app-cal-month"
          style={{ fontSize: compact ? "0.85rem" : undefined }}
        >
          {label}
        </span>
        <span
          className="app-cal-today"
          style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}
        >
          Today {highlightDay}
        </span>
      </div>
      <div className="app-cal-weeks">
        {WEEKDAYS.map((d, i) => (
          <div key={`${d}-${i}`} className="app-cal-wd">
            {d}
          </div>
        ))}
      </div>
      <div className={`app-cal-grid ${compact ? "app-cal-mini" : ""}`}>
        {cells.map((day, idx) => (
          <div key={idx} className="app-cal-slot">
            {day == null ? (
              <div className="app-cal-day--empty" />
            ) : (
              <div
                className={`app-cal-day ${
                  day === highlightDay ? "app-cal-day--today" : ""
                }`}
                style={{ cursor: "default" }}
              >
                {day}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  if (embedded) {
    return <div className={className}>{inner}</div>;
  }

  return <div className={`app-card ${className}`.trim()}>{inner}</div>;
}
