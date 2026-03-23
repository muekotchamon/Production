"use client";

import { useState } from "react";
import type { WorkflowTrackerState } from "@/hooks/useWorkflowTracker";
import { workflowStepVisual } from "@/lib/workflow-step-style";
import StepNoteBlock from "./StepNoteBlock";

type Props = Pick<
  WorkflowTrackerState,
  | "rows"
  | "setDone"
  | "setNote"
  | "completedCount"
  | "totalSteps"
  | "firstIncompleteIndex"
> & {
  noteOpenForId: string | null;
  setNoteOpenForId: (id: string | null) => void;
};

export default function WorkflowHorizontal({
  rows,
  setDone,
  setNote,
  completedCount,
  totalSteps,
  firstIncompleteIndex,
  noteOpenForId,
  setNoteOpenForId,
}: Props) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? "s1");
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  return (
    <div className="rj-d1">
      <div className="rj-d1-track" role="list">
        {rows.map((step, i) => {
          const v = workflowStepVisual(step, i, firstIncompleteIndex);
          const pillClass = [
            "rj-d1-pill",
            v === "completed" && "rj-d1-pill--completed",
            v === "active" && "rj-d1-pill--active",
            v === "pending" && "rj-d1-pill--pending",
            selectedId === step.id && "rj-d1-pill--selected",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={step.id} className="rj-d1-seg" role="listitem">
              <div
                className={pillClass}
                role="button"
                tabIndex={0}
                aria-pressed={selectedId === step.id}
                onClick={() => setSelectedId(step.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(step.id);
                  }
                }}
              >
                <label
                  className="mb-0 d-flex align-items-center"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="rj-check form-check-input m-0"
                    checked={step.done}
                    onChange={(e) => setDone(step.id, e.target.checked)}
                    aria-label={`Mark ${step.title} complete`}
                  />
                </label>
                <span className="d-flex flex-column min-w-0 flex-grow-1">
                  <span className="rj-d1-pill-title">{step.title}</span>
                  {step.done && step.completedAt && (
                    <span className="rj-d1-pill-date">{step.completedAt}</span>
                  )}
                </span>
                {v === "completed" && (
                  <i
                    className="bi bi-check-lg text-success flex-shrink-0"
                    aria-hidden
                  />
                )}
              </div>
              {i < rows.length - 1 && (
                <span className="rj-d1-connector" aria-hidden />
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="rj-d1-detail">
          <h3>{selected.title}</h3>
          <p className="rj-d1-detail-meta mb-0">{selected.subtitle}</p>
          <p className="small text-muted mt-2 mb-1">
            {selected.done && selected.completedAt ? (
              <>Completed: {selected.completedAt}</>
            ) : (
              <>Not completed yet</>
            )}
          </p>
          <StepNoteBlock
            step={selected}
            stepId={selected.id}
            setNote={setNote}
            noteOpenForId={noteOpenForId}
            setNoteOpenForId={setNoteOpenForId}
          />
        </div>
      )}

      <p className="rj-progress-line mt-3 mb-0">
        Progress:{" "}
        <span>
          {completedCount} / {totalSteps}
        </span>{" "}
        steps completed
      </p>
    </div>
  );
}
