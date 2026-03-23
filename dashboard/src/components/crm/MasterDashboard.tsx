"use client";

import { useState } from "react";
import ProductionScheduleCalendar from "./ProductionScheduleCalendar";
import TeamStrip from "./TeamStrip";
import { usePhaseTracker } from "@/hooks/usePhaseTracker";
import { PHASE_DEADLINE_DAY } from "@/lib/schedule-data";

export default function MasterDashboard() {
  const { rows, setDone, setNote } = usePhaseTracker();
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(null);

  return (
    <div>
      <h2 className="app-page-title">Job board</h2>
      <p className="app-lead">
        Track <strong>roof replacement</strong>, <strong>channeling / flashing</strong>,{" "}
        <strong>gutters</strong>, and <strong>siding</strong>. Use the calendar on the
        left, then check off each phase — completion date fills in automatically.
      </p>

      <div className="row g-4 align-items-start">
        <div className="col-lg-5">
          <div className="app-card mb-0">
            <ProductionScheduleCalendar
              selectedDay={selectedCalDay}
              onSelectDay={setSelectedCalDay}
            />
          </div>
          <TeamStrip className="mt-3 mb-0" />
        </div>

        <div className="col-lg-7">
          <div className="app-card">
            <p className="app-section-title">Production — 5 phases</p>
            <p className="app-subtle mb-3">
              Check the box when a phase is done. Use <strong>Note</strong> only if
              you need extra detail.
            </p>

            <div className="app-phase-list">
              {rows.map((phase) => {
                const deadline = PHASE_DEADLINE_DAY[phase.id];
                const calMatch =
                  selectedCalDay != null && selectedCalDay === deadline;

                return (
                  <div
                    key={phase.id}
                    className={[
                      "app-phase",
                      phase.done ? "app-phase--done" : "",
                      calMatch ? "app-phase--focus" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      className="form-check-input app-phase-check"
                      type="checkbox"
                      checked={phase.done}
                      id={`chk-${phase.id}`}
                      onChange={(e) => setDone(phase.id, e.target.checked)}
                      aria-label={`Mark ${phase.title} complete`}
                    />
                    <div className="app-phase-ico" aria-hidden>
                      <i className={`bi bi-${phase.icon}`} />
                    </div>
                    <div className="app-phase-body">
                      <p className="app-phase-name">
                        {phase.order} · {phase.title}
                      </p>
                      <p className="app-phase-meta">
                        Target this month: {deadline}
                        {calMatch ? " · matches selected calendar day" : ""}
                      </p>
                      <p className="app-subtle small mb-0 d-none d-sm-block">
                        {phase.summary}
                      </p>
                    </div>
                    <div className="app-phase-date">
                      <label className="visually-hidden" htmlFor={`d-${phase.id}`}>
                        Completion date
                      </label>
                      <input
                        id={`d-${phase.id}`}
                        type="text"
                        readOnly
                        className="form-control form-control-sm"
                        placeholder="MM/DD/YY"
                        value={phase.completedAt ?? ""}
                      />
                    </div>
                    <button
                      type="button"
                      className="app-btn-ghost"
                      aria-expanded={openNoteId === phase.id}
                      onClick={() =>
                        setOpenNoteId((c) => (c === phase.id ? null : phase.id))
                      }
                    >
                      Note
                    </button>
                    {openNoteId === phase.id && (
                      <div className="app-note-box">
                        <label className="app-field-label" htmlFor={`n-${phase.id}`}>
                          Activity notes
                        </label>
                        <textarea
                          id={`n-${phase.id}`}
                          className="form-control"
                          rows={2}
                          placeholder="Dumpster location, color selections, access issues…"
                          value={phase.note}
                          onChange={(e) => setNote(phase.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <details className="app-more mt-3">
        <summary>More fields (internal notes, logistics, compliance, supply)</summary>
        <div className="app-more-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="app-field-label">Internal production notes</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Crew instructions, site conditions, photos to upload…"
              />
            </div>
            <div className="col-md-6">
              <label className="app-field-label">Material &amp; logistics</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Shingle color / style, gutter size, siding access, boom lift…"
              />
            </div>
            <div className="col-12">
              <label className="app-field-label">Regulatory &amp; compliance</label>
              <div className="row g-2">
                <div className="col-sm-4">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">$</span>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="0.00"
                    />
                  </div>
                  <span className="app-subtle small d-block mt-1">
                    Permit / fee budget
                  </span>
                </div>
                <div className="col-sm-8">
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Jurisdiction, HOA, wind codes, ice & water requirements…"
                  />
                </div>
              </div>
            </div>
            <div className="col-12">
              <label className="app-field-label">Supply chain</label>
              <div className="row g-2">
                <div className="col-sm-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Order placed (date)"
                  />
                </div>
                <div className="col-sm-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Expected delivery (date)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
