"use client";

import { useState } from "react";
import MiniCalendar from "./MiniCalendar";
import TeamStrip from "./TeamStrip";
import RowNotePopover from "./RowNotePopover";
import { usePhaseTracker } from "@/hooks/usePhaseTracker";

type BottomTab = "compliance" | "supply";

export default function SplitScreen() {
  const { rows, setDone, setNote, todayShort } = usePhaseTracker();
  const [bottomTab, setBottomTab] = useState<BottomTab | null>(null);

  return (
    <div>
      <h2 className="app-page-title">Split view</h2>
      <p className="app-lead">
        Calendar and crew on the left — a compact checklist for roof, channeling,
        gutters, and siding on the right.
      </p>

      <div className="app-split">
        <aside className="app-split-side">
          <p className="app-section-title">Reference</p>
          <MiniCalendar compact embedded className="mb-0" />
          <TeamStrip embedded />
        </aside>
        <div className="app-split-main">
          <div className="p-3 border-bottom flex-shrink-0">
            <p className="app-subtle small mb-1">Today</p>
            <p className="fw-semibold mb-0">{todayShort}</p>
          </div>
          <div className="p-3 flex-grow-1 overflow-auto">
            <p className="app-section-title">Production</p>
            {rows.map((phase) => (
              <div
                key={phase.id}
                className={`app-split-row ${phase.done ? "app-split-row--done" : ""}`}
              >
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={phase.done}
                    id={`sw-${phase.id}`}
                    onChange={(e) => setDone(phase.id, e.target.checked)}
                    aria-label={`Complete ${phase.title}`}
                  />
                </div>
                <span className="small fw-semibold text-muted">{phase.order}</span>
                <span className="flex-grow-1 text-truncate small fw-medium">
                  {phase.title}
                </span>
                <span
                  className={`small text-nowrap ${phase.done ? "fw-bold text-primary" : "text-muted"}`}
                >
                  {phase.done && phase.completedAt ? phase.completedAt : "—"}
                </span>
                <RowNotePopover
                  value={phase.note}
                  onChange={(v) => setNote(phase.id, v)}
                />
              </div>
            ))}
          </div>
          <div className="border-top bg-light p-2">
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn btn-sm flex-fill ${bottomTab === "compliance" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() =>
                  setBottomTab((t) => (t === "compliance" ? null : "compliance"))
                }
              >
                Compliance
              </button>
              <button
                type="button"
                className={`btn btn-sm flex-fill ${bottomTab === "supply" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() =>
                  setBottomTab((t) => (t === "supply" ? null : "supply"))
                }
              >
                Supply chain
              </button>
            </div>
            {bottomTab === "compliance" && (
              <p className="small text-muted mb-0 mt-2 px-1">
                Permits, inspections, HOA letters, and sign-off photos in one place.
              </p>
            )}
            {bottomTab === "supply" && (
              <p className="small text-muted mb-0 mt-2 px-1">
                Supplier lead times, backorders, and gutter/siding substitutions.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
