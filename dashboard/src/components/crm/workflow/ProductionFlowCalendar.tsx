"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProjectDetails, ScheduleCalendarEntry } from "@/hooks/useProjectDetails";
import { PRODUCTION_CREW, crewTone } from "@/lib/production-crew";
import {
  compareLocalDay,
  formatStoredFromIsoPicker,
  parseStoredDate,
  parseStoredDateToIso,
  startOfLocalDay,
} from "@/lib/schedule-calendar-dates";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const PROJECT_SCHEDULE_ID = "__project-schedule__";

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

type WeekSegment = {
  eventId: string;
  title: string;
  subtitle?: string;
  tone: string;
  startCol: number;
  endCol: number;
  lane: number;
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

function clipEventToMonth(
  start: Date,
  end: Date,
  year: number,
  month: number,
): { start: Date; end: Date } | null {
  const ms = startOfLocalDay(new Date(year, month, 1));
  const me = startOfLocalDay(new Date(year, month + 1, 0));
  const s = startOfLocalDay(start);
  const e = startOfLocalDay(end);
  const cs = s > ms ? s : ms;
  const ce = e < me ? e : me;
  if (compareLocalDay(cs, ce) > 0) return null;
  return { start: cs, end: ce };
}

function segmentsForWeek(
  week: (number | null)[],
  year: number,
  month: number,
  clipStart: Date,
  clipEnd: Date,
): { startCol: number; endCol: number } | null {
  const cols: number[] = [];
  for (let c = 0; c < 7; c++) {
    const day = week[c];
    if (day === null) continue;
    const dt = startOfLocalDay(new Date(year, month, day));
    if (compareLocalDay(dt, clipStart) >= 0 && compareLocalDay(dt, clipEnd) <= 0) {
      cols.push(c);
    }
  }
  if (!cols.length) return null;
  return { startCol: Math.min(...cols), endCol: Math.max(...cols) };
}

function assignLanes(
  raw: { eventId: string; startCol: number; endCol: number }[],
): Map<string, number> {
  const sorted = [...raw].sort(
    (a, b) => a.startCol - b.startCol || a.endCol - b.endCol,
  );
  const laneEnds: number[] = [];
  const map = new Map<string, number>();
  for (const seg of sorted) {
    let lane = 0;
    while (lane < laneEnds.length && laneEnds[lane]! >= seg.startCol) {
      lane++;
    }
    if (lane === laneEnds.length) laneEnds.push(seg.endCol);
    else laneEnds[lane] = seg.endCol;
    map.set(seg.eventId, lane);
  }
  return map;
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

type Props = {
  details: ProjectDetails;
  updateDetail: <K extends keyof ProjectDetails>(
    key: K,
    value: ProjectDetails[K],
  ) => void;
  /** Same array as the Assign step — calendar sidebar edits this list in real time. */
  assignPersonIds: string[];
  onAssignPersonIdsChange: (next: string[]) => void;
  /** After saving dates from the modal, mark the Schedule flow step complete. */
  onScheduleDatesSaved?: () => void;
};

export default function ProductionFlowCalendar({
  details,
  updateDetail,
  assignPersonIds,
  onAssignPersonIdsChange,
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
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weeks = useMemo(() => buildMonthWeeks(year, month), [year, month]);

  const visualEvents = useMemo(
    () =>
      toVisualEvents(
        details.scheduleCalendarEntries,
        details.scheduleStart,
        details.scheduleEnd,
        details.customerName,
        details.customerAddress,
      ),
    [
      details.scheduleCalendarEntries,
      details.scheduleStart,
      details.scheduleEnd,
      details.customerName,
      details.customerAddress,
    ],
  );

  const allCrewAssigned = useMemo(
    () =>
      PRODUCTION_CREW.length > 0 &&
      PRODUCTION_CREW.every((c) => assignPersonIds.includes(c.id)),
    [assignPersonIds],
  );

  const filteredEvents = useMemo(() => {
    return visualEvents.filter((ev) => {
      if (ev.id === PROJECT_SCHEDULE_ID) return true;
      if (assignPersonIds.length === 0) return true;
      return assignPersonIds.includes(ev.assigneeId);
    });
  }, [visualEvents, assignPersonIds]);

  const weekSegments = useMemo(() => {
    return weeks.map((week, wi) => {
      const segs: Omit<WeekSegment, "lane">[] = [];
      for (const ev of filteredEvents) {
        const clipped = clipEventToMonth(ev.start, ev.end, year, month);
        if (!clipped) continue;
        const seg = segmentsForWeek(week, year, month, clipped.start, clipped.end);
        if (!seg) continue;
        segs.push({
          eventId: ev.id,
          title: ev.title,
          subtitle: ev.subtitle,
          tone: ev.tone,
          startCol: seg.startCol,
          endCol: seg.endCol,
        });
      }
      const lanes = assignLanes(
        segs.map((s) => ({
          eventId: s.eventId,
          startCol: s.startCol,
          endCol: s.endCol,
        })),
      );
      const full: WeekSegment[] = segs.map((s) => ({
        ...s,
        lane: lanes.get(s.eventId) ?? 0,
      }));
      const maxLane = full.reduce((m, s) => Math.max(m, s.lane), -1);
      return { weekIndex: wi, week, segments: full, maxLane };
    });
  }, [weeks, filteredEvents, year, month]);

  const eventsStartingOnDay = useCallback(
    (day: number) => {
      const dt = startOfLocalDay(new Date(year, month, day));
      return filteredEvents.filter(
        (ev) => compareLocalDay(startOfLocalDay(ev.start), dt) === 0,
      );
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

  const toggleAssignPerson = (id: string) => {
    const has = assignPersonIds.includes(id);
    if (has) {
      onAssignPersonIdsChange(assignPersonIds.filter((x) => x !== id));
    } else {
      onAssignPersonIdsChange([...assignPersonIds, id]);
    }
  };

  const selectEveryoneOnCrew = () => {
    onAssignPersonIdsChange(PRODUCTION_CREW.map((c) => c.id));
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
          className="rj-pf-flow-cal-people"
          aria-label="Assign — linked to Assign step"
        >
          <p className="rj-pf-flow-cal-people-heading">Assign</p>
          <p className="rj-pf-flow-cal-assign-sync-hint">
            Same list as the <strong>Assign</strong> step in the flow.
          </p>
          <button
            type="button"
            className={`rj-pf-flow-cal-chip-all${allCrewAssigned ? " is-on" : ""}`}
            onClick={selectEveryoneOnCrew}
          >
            <span className="rj-pf-flow-cal-check rj-pf-flow-cal-check--all" />
            Everyone
          </button>
          <ul className="rj-pf-flow-cal-people-list list-unstyled mb-0">
            {PRODUCTION_CREW.map((c) => {
              const on = assignPersonIds.includes(c.id);
              return (
                <li key={c.id}>
                  <label className="rj-pf-flow-cal-person-row">
                    <input
                      type="checkbox"
                      className="rj-pf-flow-cal-person-input"
                      checked={on}
                      onChange={() => toggleAssignPerson(c.id)}
                    />
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
                  </label>
                </li>
              );
            })}
          </ul>
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
            <button
              type="button"
              className="btn btn-sm rj-pf-flow-cal-add"
              onClick={() => openAddModal()}
            >
              <i className="bi bi-plus-lg me-1" aria-hidden />
              Add schedule
            </button>
          </div>

          <div className="rj-pf-flow-cal-grid-wrap" role="grid" aria-label="Production schedule">
            <div className="rj-pf-flow-cal-dow">
              {DOW.map((d) => (
                <div key={d} className="rj-pf-flow-cal-dow-cell">
                  {d}
                </div>
              ))}
            </div>

            {weekSegments.map(({ week, segments, maxLane, weekIndex }) => {
              const nLanes = Math.max(maxLane + 1, 1);
              return (
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
                                  const evs = eventsStartingOnDay(day);
                                  const max = 2;
                                  const shown = evs.slice(0, max);
                                  const more = evs.length - max;
                                  return (
                                    <>
                                      {shown.map((ev) => (
                                        <span
                                          key={ev.id + day}
                                          className={`rj-pf-flow-cal-mini-chip rj-pf-flow-cal-mini-chip--${ev.tone}`}
                                        >
                                          {ev.title}
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
                  <div
                    className="rj-pf-flow-cal-week-lanes"
                    style={{
                      gridTemplateRows: `repeat(${nLanes}, minmax(26px, auto))`,
                    }}
                  >
                    {segments.map((seg) => {
                      const isProject = seg.eventId === PROJECT_SCHEDULE_ID;
                      const tip = isProject
                        ? seg.subtitle
                          ? `${seg.title} · ${seg.subtitle} · Project schedule`
                          : seg.title === "Project schedule"
                            ? "Project schedule"
                            : `${seg.title} · Project schedule`
                        : seg.title;
                      return (
                        <div
                          key={`${seg.eventId}-w${weekIndex}`}
                          className={`rj-pf-flow-cal-bar rj-pf-flow-cal-bar--${seg.tone}${
                            isProject && seg.subtitle
                              ? " rj-pf-flow-cal-bar--project"
                              : ""
                          }`}
                          style={{
                            gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                            gridRow: seg.lane + 1,
                          }}
                          title={tip}
                        >
                          {isProject && seg.subtitle ? (
                            <>
                              <span className="rj-pf-flow-cal-bar-project-name">
                                {seg.title}
                              </span>
                              <span className="rj-pf-flow-cal-bar-project-addr">
                                {seg.subtitle}
                              </span>
                            </>
                          ) : (
                            <span className="rj-pf-flow-cal-bar-text">
                              {seg.title}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="rj-pf-flow-cal-hint text-muted small mb-0">
            <strong>Add schedule</strong> edits the same start/end dates as the
            Schedule step. Double-click a day to open with that day when dates
            are empty. Assign list filters crew bars; project schedule always
            shows.
          </p>
        </div>
      </div>

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
