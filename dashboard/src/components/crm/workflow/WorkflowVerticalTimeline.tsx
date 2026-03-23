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

export default function WorkflowVerticalTimeline({
  rows,
  setDone,
  setNote,
  completedCount,
  totalSteps,
  firstIncompleteIndex,
  noteOpenForId,
  setNoteOpenForId,
}: Props) {
  const [openStepId, setOpenStepId] = useState<string | null>(rows[0]?.id ?? null);

  return (
    <div>
      <div className="rj-d2">
        {rows.map((step, i) => {
          const v = workflowStepVisual(step, i, firstIncompleteIndex);
          const isOpen = openStepId === step.id;
          const cardClass = [
            "rj-d2-card",
            v === "completed" && "rj-d2-card--completed",
            v === "active" && "rj-d2-card--active",
            v === "pending" && "rj-d2-card--pending",
            isOpen && "rj-d2-card--open",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={step.id} className={cardClass}>
              <span className="rj-d2-dot" aria-hidden />
              <div
                className="rj-d2-inner"
                role="button"
                tabIndex={0}
                onClick={() =>
                  setOpenStepId((cur) => (cur === step.id ? null : step.id))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenStepId((cur) => (cur === step.id ? null : step.id));
                  }
                }}
              >
                <div className="rj-d2-head">
                  <label
                    className="mb-0 d-flex align-items-start"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rj-check form-check-input m-0 mt-1"
                      checked={step.done}
                      onChange={(e) => setDone(step.id, e.target.checked)}
                      aria-label={`Mark ${step.title} complete`}
                    />
                  </label>
                  <h3 className="rj-d2-title">{step.title}</h3>
                  {v === "completed" && (
                    <i className="bi bi-check-circle-fill text-success" aria-hidden />
                  )}
                </div>
                {step.done && step.completedAt && (
                  <p className="rj-d2-date mb-0">
                    <i className="bi bi-clock" aria-hidden />
                    {step.completedAt}
                  </p>
                )}
                <div
                  className="rj-d2-body"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <p className="rj-d2-sub">{step.subtitle}</p>
                  <StepNoteBlock
                    step={step}
                    stepId={step.id}
                    setNote={setNote}
                    noteOpenForId={noteOpenForId}
                    setNoteOpenForId={setNoteOpenForId}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
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
