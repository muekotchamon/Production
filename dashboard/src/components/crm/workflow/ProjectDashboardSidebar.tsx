"use client";

import { useState, useMemo } from "react";
import { JOB_CAL_HIGHLIGHTS } from "@/lib/job-calendar";
import ProjectDetailsForm from "./ProjectDetailsForm";
import type { ProjectDetails } from "@/hooks/useProjectDetails";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

type Props = {
  completedCount: number;
  totalSteps: number;
  details: ProjectDetails;
  updateDetail: <K extends keyof ProjectDetails>(
    key: K,
    value: ProjectDetails[K],
  ) => void;
};

export default function ProjectDashboardSidebar({
  completedCount,
  totalSteps,
  details,
  updateDetail,
}: Props) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = today.getDate();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthLabel = monthStart.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const lead = monthStart.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const highlightDays = new Set(JOB_CAL_HIGHLIGHTS.map((e) => e.day));

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(clickedDate);
  };

  const cells = useMemo(() => {
    const result: { key: string; day: number | null }[] = [];
    for (let i = 0; i < lead; i++) {
      result.push({ key: `p-${i}`, day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ key: `d-${d}`, day: d });
    }
    return result;
  }, [lead, daysInMonth]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const day = selectedDate.getDate();
    return JOB_CAL_HIGHLIGHTS.filter((e) => e.day === day);
  }, [selectedDate]);

  return (
    <div className="rj-d5-sidebar">
      <section className="rj-d5-side-widget">
        <div className="rj-d5-side-header">
          <h2>Calendar</h2>
          <div className="rj-d5-view-toggle">
            <button
              type="button"
              className={viewMode === "month" ? "active" : ""}
              onClick={() => setViewMode("month")}
            >
              Month
            </button>
            <button
              type="button"
              className={viewMode === "week" ? "active" : ""}
              onClick={() => setViewMode("week")}
            >
              Week
            </button>
          </div>
        </div>
        <div className="rj-d5-cal-nav">
          <button
            type="button"
            className="rj-d5-cal-nav-btn"
            onClick={() => navigateMonth("prev")}
            aria-label="Previous month"
          >
            <i className="bi bi-chevron-left" />
          </button>
          <div className="rj-d5-cal-month-label">
            <span>{monthLabel}</span>
            {!isCurrentMonth && (
              <button
                type="button"
                className="rj-d5-cal-today-btn"
                onClick={goToToday}
              >
                Today
              </button>
            )}
          </div>
          <button
            type="button"
            className="rj-d5-cal-nav-btn"
            onClick={() => navigateMonth("next")}
            aria-label="Next month"
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
        <div className="rj-d5-cal-grid">
          {DOW.map((d) => (
            <div key={d} className="rj-d5-cal-dow">
              {d}
            </div>
          ))}
          {cells.map(({ key, day }) => {
            if (day === null) {
              return (
                <div key={key} className="rj-d5-cal-cell rj-d5-cal-cell--empty">
                  ·
                </div>
              );
            }
            const isToday = isCurrentMonth && day === currentDay;
            const isJob = highlightDays.has(day);
            const isSelected =
              selectedDate &&
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentMonth &&
              selectedDate.getFullYear() === currentYear;
            const cellClass = [
              "rj-d5-cal-cell",
              isToday && "rj-d5-cal-cell--today",
              isSelected && "rj-d5-cal-cell--selected",
              isJob && !isToday && !isSelected && "rj-d5-cal-cell--event",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={key}
                type="button"
                className={cellClass}
                role="gridcell"
                onClick={() => handleDateClick(day)}
                aria-label={`Select ${monthLabel} ${day}`}
              >
                {day}
              </button>
            );
          })}
        </div>
        {selectedDayEvents.length > 0 && (
          <div className="rj-d5-cal-events">
            {selectedDayEvents.map((event, idx) => (
              <div key={idx} className="rj-d5-cal-event">
                <span className="rj-d5-cal-event-dot" />
                <span>{event.label}</span>
              </div>
            ))}
          </div>
        )}
        {selectedDate && selectedDayEvents.length === 0 && (
          <div className="rj-d5-cal-no-events">
            No events on {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        )}
      </section>

      <section className="rj-d5-side-widget">
        <div className="rj-d5-side-header">
          <h2>Project Team</h2>
          <button type="button" className="rj-d5-add-btn" aria-label="Add team member">
            <i className="bi bi-plus-lg" />
          </button>
        </div>
        <div className="rj-d5-team-list">
          <div className="rj-d5-team-item">
            <div className="rj-d5-team-avatar">JD</div>
            <div className="rj-d5-team-info">
              <p className="rj-d5-team-name">John Doe</p>
              <p className="rj-d5-team-role">Project Manager</p>
            </div>
          </div>
          <div className="rj-d5-team-item">
            <div className="rj-d5-team-avatar">SM</div>
            <div className="rj-d5-team-info">
              <p className="rj-d5-team-name">Sarah Miller</p>
              <p className="rj-d5-team-role">Site Supervisor</p>
            </div>
          </div>
          <div className="rj-d5-team-empty">
            <p>No People Assigned - Pending QA Approval</p>
          </div>
        </div>
      </section>

      <ProjectDetailsForm details={details} updateDetail={updateDetail} />
    </div>
  );
}
