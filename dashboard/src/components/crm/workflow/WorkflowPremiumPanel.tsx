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

export default function WorkflowPremiumPanel({
  rows,
  setDone,
  setNote,
  completedCount,
  totalSteps,
  firstIncompleteIndex,
  noteOpenForId,
  setNoteOpenForId,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <div className="rj-d4-stack">
        {rows.map((step, i) => {
          const v = workflowStepVisual(step, i, firstIncompleteIndex);
          const isOpen = openId === step.id;
          const cardClass = [
            "rj-d4-card",
            v === "completed" && "rj-d4-card--done",
            v === "active" && "rj-d4-card--active",
            isOpen && "rj-d4-card--open",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={step.id}
              className={cardClass}
              role="button"
              tabIndex={0}
              onClick={() =>
                setOpenId((cur) => (cur === step.id ? null : step.id))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenId((cur) => (cur === step.id ? null : step.id));
                }
              }}
            >
              <div className="rj-d4-top">
                <div className="d-flex align-items-start gap-2 min-w-0">
                  <label
                    className="mb-0 flex-shrink-0"
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
                  <div className="min-w-0">
                    <h3 className="rj-d4-title">{step.title}</h3>
                    <p className="small text-muted mb-0">{step.subtitle}</p>
                  </div>
                </div>
                <span
                  className={`rj-d4-badge ${
                    step.done ? "rj-d4-badge--done" : "rj-d4-badge--pending"
                  }`}
                >
                  {step.done ? "Completed" : "Pending"}
                </span>
              </div>
              <p className="rj-d4-date mb-0">
                {step.done && step.completedAt
                  ? step.completedAt
                  : "—"}
              </p>
              <div
                className="rj-d4-expand"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <StepNoteBlock
                  step={step}
                  stepId={step.id}
                  setNote={setNote}
                  noteOpenForId={noteOpenForId}
                  setNoteOpenForId={setNoteOpenForId}
                />
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
