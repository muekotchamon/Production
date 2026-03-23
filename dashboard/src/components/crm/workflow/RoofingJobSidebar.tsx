"use client";

import {
  JOB_CAL_HIGHLIGHTS,
  JOB_CAL_MONTH,
  JOB_CAL_TODAY,
  JOB_CAL_YEAR,
} from "@/lib/job-calendar";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

type Props = {
  completedCount: number;
  totalSteps: number;
};

export default function RoofingJobSidebar({
  completedCount,
  totalSteps,
}: Props) {
  const monthStart = new Date(JOB_CAL_YEAR, JOB_CAL_MONTH - 1, 1);
  const monthLabel = monthStart.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const lead = monthStart.getDay();
  const daysInMonth = new Date(JOB_CAL_YEAR, JOB_CAL_MONTH, 0).getDate();
  const highlightDays = new Set(JOB_CAL_HIGHLIGHTS.map((e) => e.day));

  const cells: { key: string; day: number | null }[] = [];
  for (let i = 0; i < lead; i++) {
    cells.push({ key: `p-${i}`, day: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: `d-${d}`, day: d });
  }

  return (
    <div className="d-flex flex-column gap-3">
      <section className="rj-side-cal" aria-labelledby="rj-cal-heading">
        <h2 id="rj-cal-heading">Job calendar</h2>
        <p className="small fw-semibold text-dark mb-2">{monthLabel}</p>
        <div className="rj-cal-grid mt-2" role="grid" aria-label="Calendar">
          {DOW.map((d) => (
            <div key={d} className="rj-cal-dow">
              {d}
            </div>
          ))}
          {cells.map(({ key, day }) => {
            if (day === null) {
              return (
                <div key={key} className="rj-cal-cell rj-cal-cell--muted">
                  ·
                </div>
              );
            }
            const isToday = day === JOB_CAL_TODAY;
            const isJob = highlightDays.has(day);
            const cellClass = [
              "rj-cal-cell",
              isToday && "rj-cal-cell--today",
              isJob && !isToday && "rj-cal-cell--job",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div key={key} className={cellClass} role="gridcell">
                {day}
              </div>
            );
          })}
        </div>
        <ul className="list-unstyled small text-muted mt-2 mb-0">
          {JOB_CAL_HIGHLIGHTS.map((e) => (
            <li key={e.day}>
              <span className="text-danger fw-semibold">{e.day}</span> —{" "}
              {e.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="rj-side-team" aria-labelledby="rj-team-heading">
        <div className="rj-team-header">
          <h2 id="rj-team-heading">Project Team</h2>
          <button
            type="button"
            className="rj-team-add-btn"
            aria-label="Add team member"
            title="Add team member"
          >
            <i className="bi bi-plus-lg" />
          </button>
        </div>
        <div className="rj-team-list">
          <div className="rj-team-card">
            <div className="rj-team-avatar">CA</div>
            <div className="rj-team-info">
              <p className="rj-team-name">Crew A</p>
              <p className="rj-team-role">Tear-off lead</p>
            </div>
            <div className="rj-team-status">
              <span className="rj-team-status-dot rj-team-status-dot--active" aria-label="Active" />
            </div>
          </div>
          <div className="rj-team-card">
            <div className="rj-team-avatar">CB</div>
            <div className="rj-team-info">
              <p className="rj-team-name">Crew B</p>
              <p className="rj-team-role">Install & detail</p>
            </div>
            <div className="rj-team-status">
              <span className="rj-team-status-dot rj-team-status-dot--active" aria-label="Active" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
