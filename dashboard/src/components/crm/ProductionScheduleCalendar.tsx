"use client";

import { useMemo } from "react";
import type { ScheduleMarkerKind } from "@/lib/schedule-data";
import {
  SCHEDULE_MARKERS,
  SCHEDULE_MONTH_INDEX,
  SCHEDULE_TODAY_DOM,
  SCHEDULE_YEAR,
  markersOnDay,
  upcomingMarkers,
} from "@/lib/schedule-data";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function dotClass(kind: ScheduleMarkerKind): string {
  switch (kind) {
    case "phase":
      return "app-dot app-dot--phase";
    case "delivery":
      return "app-dot app-dot--delivery";
    case "permit":
      return "app-dot app-dot--permit";
    case "crew":
      return "app-dot app-dot--crew";
    default:
      return "app-dot";
  }
}

function formatDayInMonth(day: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(SCHEDULE_YEAR, SCHEDULE_MONTH_INDEX, day));
}

type ProductionScheduleCalendarProps = {
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
};

export default function ProductionScheduleCalendar({
  selectedDay,
  onSelectDay,
}: ProductionScheduleCalendarProps) {
  const year = SCHEDULE_YEAR;
  const monthIndex = SCHEDULE_MONTH_INDEX;
  const todayDom = SCHEDULE_TODAY_DOM;

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(year, monthIndex, 1)),
    [year, monthIndex],
  );

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const out: (number | null)[] = [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (out.length % 7 !== 0) out.push(null);
    while (out.length < 42) out.push(null);
    return out;
  }, [year, monthIndex]);

  const markersByDay = useMemo(() => {
    const map = new Map<number, typeof SCHEDULE_MARKERS>();
    for (const m of SCHEDULE_MARKERS) {
      const list = map.get(m.day) ?? [];
      list.push(m);
      map.set(m.day, list);
    }
    return map;
  }, []);

  const handleDayClick = (day: number) => {
    onSelectDay(selectedDay === day ? null : day);
  };

  const agendaItems =
    selectedDay != null
      ? markersOnDay(selectedDay)
      : upcomingMarkers(todayDom, 5);

  return (
    <div>
      <p className="app-section-title">Schedule</p>
      <div className="app-cal-head">
        <span className="app-cal-month">{monthLabel}</span>
        <span className="app-cal-today">Today is the {todayDom}</span>
      </div>

      <div className="app-cal-weeks" role="row">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="app-cal-wd">
            {d}
          </div>
        ))}
      </div>

      <div className="app-cal-grid" role="grid">
        {cells.map((day, idx) => (
          <div key={idx} className="app-cal-slot">
            {day == null ? (
              <div className="app-cal-day--empty" />
            ) : (
              <button
                type="button"
                className={`app-cal-day ${
                  day === todayDom ? "app-cal-day--today" : ""
                } ${selectedDay === day ? "app-cal-day--picked" : ""}`}
                onClick={() => handleDayClick(day)}
                aria-pressed={selectedDay === day}
                aria-label={`${formatDayInMonth(day)}`}
              >
                {day}
                <span className="app-cal-dots" aria-hidden>
                  {(markersByDay.get(day) ?? []).slice(0, 4).map((m, i) => (
                    <span key={i} className={dotClass(m.kind)} />
                  ))}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="app-cal-hint">
        Dots mean something is scheduled that day (phase target, delivery, permit,
        or crew). Tap a day to see the list below.
      </p>

      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-1">
        <span className="fw-semibold small">
          {selectedDay != null
            ? formatDayInMonth(selectedDay)
            : "Upcoming from today"}
        </span>
        {selectedDay != null && (
          <button
            type="button"
            className="app-link-quiet"
            onClick={() => onSelectDay(null)}
          >
            Clear selection
          </button>
        )}
      </div>

      {agendaItems.length === 0 ? (
        <p className="app-subtle mb-0 small">
          {selectedDay != null
            ? "Nothing on the calendar for this day."
            : "No upcoming items after today this month."}
        </p>
      ) : (
        <ul className="app-cal-list">
          {agendaItems.map((m, i) => (
            <li key={`${m.day}-${m.kind}-${i}`}>
              <span className="app-cal-list-meta">{formatDayInMonth(m.day)}</span>
              {m.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
