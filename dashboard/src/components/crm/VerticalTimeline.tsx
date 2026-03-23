"use client";

import { useState } from "react";
import MiniCalendar from "./MiniCalendar";
import TeamStrip from "./TeamStrip";
import { usePhaseTracker } from "@/hooks/usePhaseTracker";

type Panel = "notes" | "material" | null;

export default function VerticalTimeline() {
  const { rows, toggleDone, setNote } = usePhaseTracker();
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<Record<string, Panel>>({});

  const togglePanel = (phaseId: string, panel: Exclude<Panel, null>) => {
    setOpenPanel((prev) => ({
      ...prev,
      [phaseId]: prev[phaseId] === panel ? null : panel,
    }));
  };

  const handleToggle = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (row && !row.done) {
      setPulseId(id);
      window.setTimeout(() => setPulseId(null), 900);
    }
    toggleDone(id);
  };

  return (
    <div>
      <h2 className="app-page-title">Step-by-step</h2>
      <p className="app-lead">
        Tap the circle when a phase is finished. Open production notes or material
        only when you need them.
      </p>

      <div className="row g-4">
        <div className="col-lg-8">
          {rows.map((phase, index) => {
            const isLast = index === rows.length - 1;
            const showComplete = phase.done && phase.completedAt;
            const panel = openPanel[phase.id] ?? null;

            return (
              <div key={phase.id} className="app-tl">
                <div className="app-tl-rail">
                  <button
                    type="button"
                    className={`app-tl-dot ${phase.done ? "app-tl-dot--on" : ""} ${pulseId === phase.id ? "app-pulse" : ""}`}
                    onClick={() => handleToggle(phase.id)}
                    aria-pressed={phase.done}
                    aria-label={
                      phase.done ? "Mark phase not complete" : "Mark phase complete"
                    }
                  >
                    <i className="bi bi-check-lg" aria-hidden />
                  </button>
                  {!isLast && <div className="app-tl-line" aria-hidden />}
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="app-tl-card">
                    <p className="fw-semibold mb-1">
                      {phase.order} · {phase.title}
                    </p>
                    {showComplete ? (
                      <p className="small text-success fw-semibold mb-2">
                        Completed {phase.completedAt}
                      </p>
                    ) : (
                      <p className="app-subtle mb-2">{phase.summary}</p>
                    )}

                    <button
                      type="button"
                      className="app-btn-ghost mb-1"
                      aria-expanded={panel === "notes"}
                      onClick={() => togglePanel(phase.id, "notes")}
                    >
                      Production notes
                    </button>
                    {panel === "notes" && (
                      <textarea
                        className="form-control form-control-sm mt-1"
                        rows={2}
                        placeholder="Short field notes…"
                        value={phase.note}
                        onChange={(e) => setNote(phase.id, e.target.value)}
                      />
                    )}

                    <button
                      type="button"
                      className="app-btn-ghost mt-2"
                      aria-expanded={panel === "material"}
                      onClick={() => togglePanel(phase.id, "material")}
                    >
                      Material &amp; logistics
                    </button>
                    {panel === "material" && (
                      <ul className="app-subtle small ps-3 mb-0 mt-1">
                        <li>Shingles / metal / underlayment PO status</li>
                        <li>Gutter coil &amp; siding material ETA</li>
                        <li>Dumpster swap and driveway protection</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="col-lg-4">
          <div className="app-card sticky-lg-top" style={{ top: "1rem" }}>
            <p className="app-section-title">Reference</p>
            <MiniCalendar compact embedded />
            <TeamStrip embedded />
          </div>
        </div>
      </div>
    </div>
  );
}
