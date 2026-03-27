"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type {
  JobFlagStatusEvent,
  ProjectDetails,
  ScheduleCalendarEntry,
} from "@/hooks/useProjectDetails";
import {
  PRODUCTION_CREW,
  crewLabel,
  crewTone,
  type ProductionCrewMember,
} from "@/lib/production-crew";
import {
  compareLocalDay,
  formatStoredFromIsoPicker,
  parseStoredDate,
  parseStoredDateToIso,
  startOfLocalDay,
} from "@/lib/schedule-calendar-dates";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const PROJECT_SCHEDULE_ID = "__project-schedule__";

/** Calendar chips/bars from flow checks + dated fields (ids must use this prefix). */
const FLOW_MILESTONE_ID_PREFIX = "flow-ms-";

const JOB_FLAG_TYPES = [
  "Funding",
  "Permitting",
  "Customer",
  "Material",
  "Scheduling",
  "Other",
] as const;

const CREW_EMAIL_BY_ID: Record<string, string> = {
  "pm-rivera": "alex.r@klauslarsen.com",
  "pm-kim": "jordan.k@klauslarsen.com",
  "lead-ortiz": "sam.o@klauslarsen.com",
  "lead-nguyen": "casey.n@klauslarsen.com",
  "coord-patel": "riley.p@klauslarsen.com",
};

function crewMemberEmail(id: string): string {
  if (!id) return "";
  if (CREW_EMAIL_BY_ID[id]) return CREW_EMAIL_BY_ID[id];
  const label = crewLabel(id).toLowerCase().replace(/\s+/g, ".");
  return `${label}@example.com`;
}

function timelineToneClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("closed")) return "rj-pf-flag-timeline-item--done";
  if (s.includes("progress")) return "rj-pf-flag-timeline-item--active";
  if (s.includes("open")) return "rj-pf-flag-timeline-item--open";
  if (s.includes("updated")) return "rj-pf-flag-timeline-item--updated";
  return "rj-pf-flag-timeline-item--neutral";
}

type FlagFormDraft = {
  flagType: string;
  assigneeIds: string[];
  comment: string;
  statusHistory: JobFlagStatusEvent[];
};

export type FlowCalendarMilestone = {
  id: string;
  title: string;
  dateStored: string;
};

function isFlowMilestoneId(id: string): boolean {
  return id.startsWith(FLOW_MILESTONE_ID_PREFIX);
}

type VisualEvent = {
  id: string;
  title: string;
  /** Second line on project schedule bar (e.g. customer address). */
  subtitle?: string;
  assigneeId: string;
  tone: string;
  start: Date;
  end: Date;
};

function buildMonthWeeks(year: number, month: number): (number | null)[][] {
  const lead = new Date(year, month, 1).getDay();
  const dim = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function toVisualEvents(
  entries: ScheduleCalendarEntry[],
  scheduleStart: string,
  scheduleEnd: string,
  customerName: string,
  customerAddress: string,
): VisualEvent[] {
  const out: VisualEvent[] = [];
  for (const e of entries) {
    const s = parseStoredDate(e.startDate);
    const en = parseStoredDate(e.endDate) ?? s;
    if (!s) continue;
    out.push({
      id: e.id,
      title: e.title.trim() || "Work",
      assigneeId: e.assigneeId,
      tone: crewTone(e.assigneeId),
      start: s,
      end: en ?? s,
    });
  }
  const ps = parseStoredDate(scheduleStart);
  const pe = parseStoredDate(scheduleEnd) ?? ps;
  if (ps && scheduleStart.trim()) {
    const name = customerName.trim();
    const addr = customerAddress.trim();
    let title: string;
    let subtitle: string | undefined;
    if (name && addr) {
      title = name;
      subtitle = addr;
    } else if (name) {
      title = name;
    } else if (addr) {
      title = addr;
    } else {
      title = "Project schedule";
    }
    out.push({
      id: PROJECT_SCHEDULE_ID,
      title,
      subtitle,
      assigneeId: PROJECT_SCHEDULE_ID,
      tone: "slate",
      start: ps,
      end: pe ?? ps,
    });
  }
  return out;
}

/**
 * Project schedule chip only on the start and/or end calendar day — plain labels.
 * If start and end are the same day, only "Start date" is shown.
 */
function projectScheduleChipLabel(
  ev: VisualEvent,
  day: number,
  year: number,
  month: number,
): string | null {
  const dt = startOfLocalDay(new Date(year, month, day));
  const rangeStart = startOfLocalDay(ev.start);
  const rangeEnd = startOfLocalDay(ev.end);
  const isStart = compareLocalDay(dt, rangeStart) === 0;
  const isEnd = compareLocalDay(dt, rangeEnd) === 0;
  if (isStart) return "Start date";
  if (isEnd) return "End date";
  return null;
}

function appendFlowMilestoneEvents(
  base: VisualEvent[],
  milestones: FlowCalendarMilestone[],
  assignPersonIds: string[],
): VisualEvent[] {
  const toneId = assignPersonIds[0] ?? "";
  const tone = toneId ? crewTone(toneId) : "slate";
  const out = [...base];
  for (const ms of milestones) {
    if (!isFlowMilestoneId(ms.id)) continue;
    const s = parseStoredDate(ms.dateStored);
    if (!s) continue;
    const day = startOfLocalDay(s);
    out.push({
      id: ms.id,
      title: ms.title,
      subtitle: undefined,
      assigneeId: toneId || "__flow-milestone__",
      tone,
      start: day,
      end: day,
    });
  }
  return out;
}

type Props = {
  details: ProjectDetails;
  updateDetail: <K extends keyof ProjectDetails>(
    key: K,
    value: ProjectDetails[K],
  ) => void;
  /** Same list as the Assign flow step — shown read-only in the calendar rail. */
  assignPersonIds: string[];
  /** Point-in-time rows from the flow / project details (Assign check, permit dates, …). */
  flowMilestones?: FlowCalendarMilestone[];
  /** After saving dates from the modal, mark the Schedule flow step complete. */
  onScheduleDatesSaved?: () => void;
};

export default function ProductionFlowCalendar({
  details,
  updateDetail,
  assignPersonIds,
  flowMilestones = [],
  onScheduleDatesSaved,
}: Props): ReactNode {
  const today = new Date();
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftStartIso, setDraftStartIso] = useState("");
  const [draftEndIso, setDraftEndIso] = useState("");
  const modalTitleId = useId();
  const flagPopoverRootId = useId();
  const flagPopoverTitleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const flagAnchorRef = useRef<HTMLDivElement>(null);
  const flagPopoverRef = useRef<HTMLDivElement>(null);
  const [flagPopoverBox, setFlagPopoverBox] = useState({
    top: 0,
    left: 0,
    width: 420,
    maxHeight: 520,
  });

  const [flagPopoverOpen, setFlagPopoverOpen] = useState(false);
  const [flagDraft, setFlagDraft] = useState<FlagFormDraft | null>(null);
  const [flagFormError, setFlagFormError] = useState<string | null>(null);

  const closeFlagPopover = useCallback(() => {
    setFlagPopoverOpen(false);
    setFlagDraft(null);
    setFlagFormError(null);
  }, []);

  const openFlagPopover = useCallback(() => {
    setFlagFormError(null);
    setFlagDraft({
      flagType: details.jobFlagType || "Funding",
      assigneeIds:
        details.jobFlagAssigneeIds.length > 0
          ? [...details.jobFlagAssigneeIds]
          : [...assignPersonIds],
      comment: details.jobFlagComment,
      statusHistory: details.jobFlagStatusHistory.map((e) => ({ ...e })),
    });
    setFlagPopoverOpen(true);
  }, [
    assignPersonIds,
    details.jobFlagAssigneeIds,
    details.jobFlagComment,
    details.jobFlagStatusHistory,
    details.jobFlagType,
  ]);

  useEffect(() => {
    if (!flagPopoverOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeFlagPopover();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [flagPopoverOpen, closeFlagPopover]);

  useLayoutEffect(() => {
    if (!flagPopoverOpen || !flagAnchorRef.current) return;
    const place = () => {
      const el = flagAnchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(420, Math.max(300, window.innerWidth - 24));
      const left = Math.min(
        Math.max(12, r.right - width),
        window.innerWidth - width - 12,
      );
      const top = r.bottom + 6;
      const maxHeight = Math.max(240, window.innerHeight - top - 12);
      setFlagPopoverBox({ top, left, width, maxHeight });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [flagPopoverOpen]);

  useEffect(() => {
    if (!flagPopoverOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (flagAnchorRef.current?.contains(t)) return;
      if (flagPopoverRef.current?.contains(t)) return;
      closeFlagPopover();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [flagPopoverOpen, closeFlagPopover]);

  const saveFlagPopover = useCallback(() => {
    if (!flagDraft) return;
    const ids = flagDraft.assigneeIds.filter(Boolean);
    if (!flagDraft.flagType.trim()) {
      setFlagFormError("Choose a flag type.");
      return;
    }
    if (ids.length === 0) {
      setFlagFormError("Add at least one assignee.");
      return;
    }
    if (
      flagDraft.statusHistory.length > 0 &&
      flagDraft.statusHistory.some((ev) => !parseStoredDateToIso(ev.dateStored))
    ) {
      setFlagFormError("Set a valid date for each status in the history.");
      return;
    }
    setFlagFormError(null);
    const now = new Date();
    updateDetail("jobFlagType", flagDraft.flagType.trim());
    updateDetail("jobFlagComment", flagDraft.comment);
    updateDetail("jobFlagAssigneeIds", ids);
    updateDetail(
      "jobFlagStatusHistory",
      flagDraft.statusHistory.map((ev) => ({
        status: ev.status,
        dateStored: parseStoredDateToIso(ev.dateStored),
      })),
    );
    if (!details.jobFlagCreatedByEmail.trim()) {
      updateDetail("jobFlagCreatedByEmail", "kim.w@klauslarsen.com");
    }
    if (!details.jobFlagCreatedAtDisplay.trim()) {
      updateDetail(
        "jobFlagCreatedAtDisplay",
        now.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      );
    }
    closeFlagPopover();
  }, [
    closeFlagPopover,
    details.jobFlagCreatedAtDisplay,
    details.jobFlagCreatedByEmail,
    flagDraft,
    updateDetail,
  ]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weeks = useMemo(() => buildMonthWeeks(year, month), [year, month]);

  const visualEvents = useMemo(() => {
    const base = toVisualEvents(
      details.scheduleCalendarEntries,
      details.scheduleStart,
      details.scheduleEnd,
      details.customerName,
      details.customerAddress,
    );
    return appendFlowMilestoneEvents(base, flowMilestones, assignPersonIds);
  }, [
    details.scheduleCalendarEntries,
    details.scheduleStart,
    details.scheduleEnd,
    details.customerName,
    details.customerAddress,
    flowMilestones,
    assignPersonIds,
  ]);

  const assignedCrewDisplay = useMemo(() => {
    const byId = new Map(PRODUCTION_CREW.map((c) => [c.id, c]));
    return assignPersonIds
      .map((id) => byId.get(id))
      .filter((c): c is ProductionCrewMember => c !== undefined);
  }, [assignPersonIds]);

  const filteredEvents = useMemo(() => {
    return visualEvents.filter((ev) => {
      if (ev.id === PROJECT_SCHEDULE_ID) return true;
      if (isFlowMilestoneId(ev.id)) return true;
      if (assignPersonIds.length === 0) return true;
      return assignPersonIds.includes(ev.assigneeId);
    });
  }, [visualEvents, assignPersonIds]);

  /** Events whose local date range includes this calendar day (start through end inclusive). */
  const eventsOverlappingDay = useCallback(
    (day: number) => {
      const dt = startOfLocalDay(new Date(year, month, day));
      return filteredEvents.filter((ev) => {
        const rangeStart = startOfLocalDay(ev.start);
        const rangeEnd = startOfLocalDay(ev.end);
        return (
          compareLocalDay(dt, rangeStart) >= 0 &&
          compareLocalDay(dt, rangeEnd) <= 0
        );
      });
    },
    [filteredEvents, year, month],
  );

  const openAddModal = (day?: number) => {
    const dayIso = (d: number) =>
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    let startIso = parseStoredDateToIso(details.scheduleStart);
    let endIso = parseStoredDateToIso(details.scheduleEnd);
    if (!startIso) {
      const d =
        day !== undefined
          ? day
          : selectedDay !== null
            ? selectedDay
            : 1;
      startIso = dayIso(d);
    }
    if (!endIso) {
      endIso = startIso;
    }
    setDraftStartIso(startIso);
    setDraftEndIso(endIso);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const saveEntry = () => {
    let start = draftStartIso
      ? formatStoredFromIsoPicker(draftStartIso)
      : "";
    let end = draftEndIso ? formatStoredFromIsoPicker(draftEndIso) : "";
    if (start && end && draftStartIso > draftEndIso) {
      const x = start;
      start = end;
      end = x;
    }
    if (!start.trim()) return;
    if (!end.trim()) end = start;
    updateDetail("scheduleStart", start);
    updateDetail("scheduleEnd", end);
    onScheduleDatesSaved?.();
    setModalOpen(false);
  };

  const navigateMonth = (dir: -1 | 1) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));
    setSelectedDay(null);
  };

  const isToday = (day: number | null) =>
    day !== null &&
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  return (
    <div className="rj-pf-flow-cal">
      <div className="rj-pf-flow-cal-shell">
        <aside
          className="rj-pf-flow-cal-people rj-pf-flow-cal-people--readonly"
          aria-label="Assigned crew from the Assign step (view only)"
        >
          <p className="rj-pf-flow-cal-people-heading">Assign</p>
          <p className="rj-pf-flow-cal-assign-sync-hint">
            Who is on the job — set in the <strong>Assign</strong> step (not
            editable here).
          </p>
          {assignedCrewDisplay.length === 0 ? (
            <p className="rj-pf-flow-cal-assign-empty text-muted small mb-0">
              No one selected yet.
            </p>
          ) : (
            <ul className="rj-pf-flow-cal-people-list list-unstyled mb-0">
              {assignedCrewDisplay.map((c) => (
                <li key={c.id}>
                  <div className="rj-pf-flow-cal-person-row rj-pf-flow-cal-person-row--readonly">
                    <span
                      className={`rj-pf-flow-cal-swatch rj-pf-flow-cal-swatch--${c.tone}`}
                      aria-hidden
                    />
                    <span className="rj-pf-flow-cal-person-label">
                      <span className="rj-pf-flow-cal-person-name">{c.label}</span>
                      <span className="rj-pf-flow-cal-person-role">
                        {c.assignSuffix}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="rj-pf-flow-cal-main">
          <div className="rj-pf-flow-cal-toolbar">
            <div className="rj-pf-flow-cal-nav">
              <button
                type="button"
                className="rj-pf-flow-cal-nav-btn"
                aria-label="Previous month"
                onClick={() => navigateMonth(-1)}
              >
                <i className="bi bi-chevron-left" />
              </button>
              <h2 className="rj-pf-flow-cal-month">{monthLabel}</h2>
              <button
                type="button"
                className="rj-pf-flow-cal-nav-btn"
                aria-label="Next month"
                onClick={() => navigateMonth(1)}
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
            <div className="rj-pf-flow-cal-toolbar-actions">
              <div
                className="rj-pf-flow-cal-flag-anchor"
                ref={flagAnchorRef}
              >
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rj-pf-flow-cal-flag"
                  aria-label="Job flag"
                  aria-expanded={flagPopoverOpen}
                  aria-haspopup="dialog"
                  aria-controls={flagPopoverOpen ? flagPopoverRootId : undefined}
                  onClick={() => {
                    if (flagPopoverOpen) closeFlagPopover();
                    else openFlagPopover();
                  }}
                >
                  <i className="bi bi-flag me-1" aria-hidden />
                  Flag
                </button>
              </div>
              <button
                type="button"
                className="btn btn-sm rj-pf-flow-cal-add"
                onClick={() => openAddModal()}
              >
                <i className="bi bi-plus-lg me-1" aria-hidden />
                Add schedule
              </button>
            </div>
          </div>

          <div className="rj-pf-flow-cal-grid-wrap" role="grid" aria-label="Production schedule">
            <div className="rj-pf-flow-cal-dow">
              {DOW.map((d) => (
                <div key={d} className="rj-pf-flow-cal-dow-cell">
                  {d}
                </div>
              ))}
            </div>

            {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="rj-pf-flow-cal-week">
                  <div className="rj-pf-flow-cal-week-days">
                    {week.map((day, col) => {
                      const empty = day === null;
                      const selected = !empty && selectedDay === day;
                      return (
                        <button
                          key={`${weekIndex}-${col}`}
                          type="button"
                          className={[
                            "rj-pf-flow-cal-day",
                            empty ? "rj-pf-flow-cal-day--pad" : "",
                            !empty && isToday(day) ? "rj-pf-flow-cal-day--today" : "",
                            selected ? "rj-pf-flow-cal-day--selected" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          role="gridcell"
                          disabled={empty}
                          onClick={() => {
                            if (day === null) return;
                            setSelectedDay(day);
                          }}
                          onDoubleClick={() => {
                            if (day === null) return;
                            setSelectedDay(day);
                            openAddModal(day);
                          }}
                        >
                          {empty ? (
                            <span className="rj-pf-flow-cal-day-num rj-pf-flow-cal-day-num--pad">
                              ·
                            </span>
                          ) : (
                            <>
                              <span className="rj-pf-flow-cal-day-num">{day}</span>
                              <div className="rj-pf-flow-cal-day-chips">
                                {(() => {
                                  const evs = eventsOverlappingDay(day);
                                  const max = 2;
                                  type ChipRow = {
                                    key: string;
                                    tone: string;
                                    text: string;
                                    tip?: string;
                                  };
                                  const rows: ChipRow[] = [];
                                  for (const ev of evs) {
                                    if (ev.id === PROJECT_SCHEDULE_ID) {
                                      const text = projectScheduleChipLabel(
                                        ev,
                                        day,
                                        year,
                                        month,
                                      );
                                      if (text === null) continue;
                                      const tip = [
                                        ev.title,
                                        ev.subtitle,
                                      ]
                                        .filter(Boolean)
                                        .join(" · ");
                                      rows.push({
                                        key: `${ev.id}-${day}`,
                                        tone: ev.tone,
                                        text,
                                        tip: tip || undefined,
                                      });
                                    } else {
                                      rows.push({
                                        key: `${ev.id}-${day}`,
                                        tone: ev.tone,
                                        text: ev.title,
                                      });
                                    }
                                  }
                                  const shown = rows.slice(0, max);
                                  const more = rows.length - max;
                                  return (
                                    <>
                                      {shown.map((row) => (
                                        <span
                                          key={row.key}
                                          className={`rj-pf-flow-cal-mini-chip rj-pf-flow-cal-mini-chip--${row.tone}`}
                                          title={row.tip}
                                        >
                                          {row.text}
                                        </span>
                                      ))}
                                      {more > 0 ? (
                                        <span className="rj-pf-flow-cal-more">
                                          +{more} more
                                        </span>
                                      ) : null}
                                    </>
                                  );
                                })()}
                              </div>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
            ))}
          </div>

          <p className="rj-pf-flow-cal-hint text-muted small mb-0">
            <strong>Add schedule</strong> sets start/end on the{" "}
            <strong>Schedule</strong> step; the project row shows chips{" "}
            <strong>Start date</strong> and <strong>End date</strong> only on
            those days (middle days have no project chip). Multi-day crew blocks
            still show each day in range. Double-click a day to open when dates
            are empty. Calendar crew chips follow Assign; flow milestones always
            show.
          </p>
        </div>
      </div>

      {flagPopoverOpen && flagDraft
        ? createPortal(
            <div
              ref={flagPopoverRef}
              id={flagPopoverRootId}
              className="rj-pf-flow-cal-flag-popover"
              role="dialog"
              aria-modal="false"
              aria-labelledby={flagPopoverTitleId}
              style={{
                position: "fixed",
                top: flagPopoverBox.top,
                left: flagPopoverBox.left,
                width: flagPopoverBox.width,
                maxHeight: flagPopoverBox.maxHeight,
                zIndex: 1060,
              }}
            >
              <div className="rj-pf-flag-popover-head">
                <h2 className="rj-pf-flag-popover-title" id={flagPopoverTitleId}>
                  Job flag
                </h2>
                <button
                  type="button"
                  className="rj-pf-flag-popover-close"
                  aria-label="Close"
                  onClick={closeFlagPopover}
                >
                  <i className="bi bi-x-lg" aria-hidden />
                </button>
              </div>

              <div className="rj-pf-flag-popover-body">
                <section className="rj-pf-flag-section" aria-label="Job summary">
                  <h3 className="rj-pf-flag-section-title">About this job</h3>
                  <p className="rj-pf-flag-section-lead">
                    Read-only summary. Update job details in the main workflow.
                  </p>
                  <div className="rj-pf-flag-panel">
                    <dl className="rj-pf-flag-summary">
                      <div className="rj-pf-flag-summary-row">
                        <dt>Job ID</dt>
                        <dd>{details.jobNumber.trim() || "—"}</dd>
                      </div>
                      <div className="rj-pf-flag-summary-row">
                        <dt>Work type</dt>
                        <dd>{details.workType.trim() || "—"}</dd>
                      </div>
                      <div className="rj-pf-flag-summary-row">
                        <dt>Customer</dt>
                        <dd>{details.customerName.trim() || "—"}</dd>
                      </div>
                      <div className="rj-pf-flag-summary-row">
                        <dt>Phone</dt>
                        <dd>{details.customerPhone.trim() || "—"}</dd>
                      </div>
                      <div className="rj-pf-flag-summary-row">
                        <dt>Address</dt>
                        <dd>{details.customerAddress.trim() || "—"}</dd>
                      </div>
                    </dl>
                  </div>
                </section>

                <section className="rj-pf-flag-section" aria-label="Flag status history">
                  <h3 className="rj-pf-flag-section-title">Status history</h3>
                  <p className="rj-pf-flag-section-lead">
                    Newest step is at the bottom. Change dates with the picker,
                    then save.
                  </p>
                  {flagDraft.statusHistory.length === 0 ? (
                    <div className="rj-pf-flag-panel">
                      <p className="rj-pf-flag-empty">No status entries yet.</p>
                    </div>
                  ) : (
                    <div className="rj-pf-flag-panel rj-pf-flag-panel--flush">
                      <ol className="rj-pf-flag-timeline list-unstyled mb-0">
                        {flagDraft.statusHistory.map((ev, i) => (
                          <li
                            key={`${ev.status}-${i}`}
                            className={`rj-pf-flag-timeline-item ${timelineToneClass(ev.status)}`}
                          >
                            <span
                              className="rj-pf-flag-timeline-track"
                              aria-hidden
                            />
                            <div className="rj-pf-flag-timeline-card">
                              <span className="rj-pf-flag-timeline-status">
                                {ev.status}
                              </span>
                              <label className="rj-pf-flag-timeline-date-field">
                                <span className="visually-hidden">
                                  Date for {ev.status}
                                </span>
                                <input
                                  type="date"
                                  className="form-control form-control-sm rj-pf-flag-timeline-date-input"
                                  value={parseStoredDateToIso(ev.dateStored)}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setFlagDraft((d) => {
                                      if (!d) return d;
                                      const next = d.statusHistory.map((row, j) =>
                                        j === i
                                          ? { ...row, dateStored: v }
                                          : row,
                                      );
                                      return { ...d, statusHistory: next };
                                    });
                                  }}
                                />
                              </label>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </section>

                <section className="rj-pf-flag-section" aria-label="Flag details">
                  <h3 className="rj-pf-flag-section-title">Flag details</h3>
                  <div className="rj-pf-flag-field">
                    <label
                      className="rj-pf-flag-field-label"
                      htmlFor="rj-pf-flag-type"
                    >
                      Flag type
                      <span className="text-danger" aria-hidden>
                        {" "}
                        *
                      </span>
                    </label>
                    <select
                      id="rj-pf-flag-type"
                      className="form-select form-select-sm"
                      value={flagDraft.flagType}
                      onChange={(e) =>
                        setFlagDraft((d) =>
                          d ? { ...d, flagType: e.target.value } : d,
                        )
                      }
                    >
                      {JOB_FLAG_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rj-pf-flag-field">
                    <h4 className="rj-pf-flag-subheading">
                      Assigned team
                      <span className="text-danger" aria-hidden>
                        {" "}
                        *
                      </span>
                    </h4>
                    <p className="rj-pf-flag-field-hint">
                      Choose who owns this flag. Add more rows if several people
                      should be notified.
                    </p>
                    <ul className="list-unstyled rj-pf-flag-assign-list">
                      {flagDraft.assigneeIds.map((id, index) => (
                        <li key={`assign-${index}`}>
                          <div className="rj-pf-flag-assign-card">
                            <div className="rj-pf-flag-assign-card-top">
                              <span className="rj-pf-flag-assign-label">
                                {index === 0
                                  ? "Primary"
                                  : `Additional ${index}`}
                              </span>
                              {flagDraft.assigneeIds.length > 1 ? (
                                <button
                                  type="button"
                                  className="rj-pf-flag-assign-remove"
                                  aria-label={`Remove assignee ${index + 1}`}
                                  onClick={() =>
                                    setFlagDraft((d) => {
                                      if (!d) return d;
                                      const next = d.assigneeIds.filter(
                                        (_, j) => j !== index,
                                      );
                                      return { ...d, assigneeIds: next };
                                    })
                                  }
                                >
                                  <i className="bi bi-dash-lg" aria-hidden />
                                </button>
                              ) : null}
                            </div>
                            <select
                              id={
                                index === 0 ? "rj-pf-flag-assign-0" : undefined
                              }
                              className="form-select form-select-sm rj-pf-flag-assign-select"
                              aria-label={
                                index === 0
                                  ? "Primary assignee"
                                  : `Assignee ${index + 1}`
                              }
                              value={id}
                              onChange={(e) => {
                                const v = e.target.value;
                                setFlagDraft((d) => {
                                  if (!d) return d;
                                  const next = [...d.assigneeIds];
                                  next[index] = v;
                                  return { ...d, assigneeIds: next };
                                });
                              }}
                            >
                              <option value="">Select person…</option>
                              {PRODUCTION_CREW.map((c) => {
                                const takenElsewhere =
                                  flagDraft.assigneeIds.some(
                                    (x, j) => j !== index && x === c.id,
                                  );
                                if (takenElsewhere) return null;
                                return (
                                  <option key={c.id} value={c.id}>
                                    {c.label} — {c.assignSuffix}
                                  </option>
                                );
                              })}
                            </select>
                            {id ? (
                              <div className="rj-pf-flag-assign-email-line">
                                {crewMemberEmail(id)}
                              </div>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="rj-pf-flag-add-person"
                      onClick={() =>
                        setFlagDraft((d) =>
                          d
                            ? { ...d, assigneeIds: [...d.assigneeIds, ""] }
                            : d,
                        )
                      }
                    >
                      + Add another person
                    </button>
                  </div>

                  <div className="rj-pf-flag-field">
                    <label
                      className="rj-pf-flag-field-label"
                      htmlFor="rj-pf-flag-comment"
                    >
                      Comment
                    </label>
                    <textarea
                      id="rj-pf-flag-comment"
                      className="form-control form-control-sm rj-pf-flag-comment"
                      rows={4}
                      placeholder="Notes for the team…"
                      value={flagDraft.comment}
                      onChange={(e) =>
                        setFlagDraft((d) =>
                          d ? { ...d, comment: e.target.value } : d,
                        )
                      }
                    />
                  </div>

                  {flagFormError ? (
                    <p className="rj-pf-flag-form-error" role="alert">
                      {flagFormError}
                    </p>
                  ) : null}
                </section>

                {(details.jobFlagCreatedByEmail.trim() ||
                  details.jobFlagCreatedAtDisplay.trim()) && (
                  <footer className="rj-pf-flag-audit">
                    {details.jobFlagCreatedByEmail.trim() ? (
                      <span>
                        <span className="rj-pf-flag-audit-label">Created by</span>{" "}
                        {details.jobFlagCreatedByEmail.trim()}
                      </span>
                    ) : null}
                    {details.jobFlagCreatedByEmail.trim() &&
                    details.jobFlagCreatedAtDisplay.trim()
                      ? " · "
                      : null}
                    {details.jobFlagCreatedAtDisplay.trim() ? (
                      <span>
                        <span className="rj-pf-flag-audit-label">Created</span>{" "}
                        {details.jobFlagCreatedAtDisplay.trim()}
                      </span>
                    ) : null}
                  </footer>
                )}
              </div>

              <div className="rj-pf-flag-popover-foot">
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={closeFlagPopover}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={saveFlagPopover}
                >
                  Save
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}

      {modalOpen ? (
        <>
          <button
            type="button"
            className="rj-pf-flow-cal-modal-backdrop"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
          />
          <div
            className="modal fade show d-block rj-pf-flow-cal-modal"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
          >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h2 className="h5 modal-title" id={modalTitleId}>
                    Add schedule
                  </h2>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setModalOpen(false)}
                  />
                </div>
                <div className="modal-body pt-2">
                  <p className="text-muted small mb-3">
                    Same fields as the <strong>Schedule</strong> step in the
                    flow — saving updates both places.
                  </p>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small" htmlFor="rj-pf-cal-s">
                        Start date
                      </label>
                      <input
                        id="rj-pf-cal-s"
                        type="date"
                        className="form-control form-control-sm"
                        value={draftStartIso}
                        onChange={(e) => setDraftStartIso(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small" htmlFor="rj-pf-cal-e">
                        End date
                      </label>
                      <input
                        id="rj-pf-cal-e"
                        type="date"
                        className="form-control form-control-sm"
                        value={draftEndIso}
                        onChange={(e) => setDraftEndIso(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={saveEntry}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
