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

export default function WorkflowProjectDashboard({
  rows,
  setDone,
  setNote,
  completedCount,
  totalSteps,
  firstIncompleteIndex,
  noteOpenForId,
  setNoteOpenForId,
}: Props) {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const getStepStatus = (
    step: (typeof rows)[number],
    index: number,
  ): "completed" | "active" | "upcoming" => {
    const visual = workflowStepVisual(step, index, firstIncompleteIndex);
    if (visual === "completed") return "completed";
    if (visual === "active") return "active";
    return "upcoming";
  };

  return (
    <div className="rj-d5">
      <div className="rj-d5-header">
        <p className="rj-d5-label">CURRENT PRODUCTION</p>
        <h2 className="rj-d5-title">Project Alpha: Luxury Residential</h2>
        <div className="rj-d5-progress-wrap">
          <div className="rj-d5-progress-value">{progressPercent}%</div>
          <p className="rj-d5-progress-label">Completion Progress</p>
          <div className="rj-d5-progress-bar">
            <div
              className="rj-d5-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rj-d5-steps">
        {rows.map((step, index) => {
          const status = getStepStatus(step, index);
          const showNote = expandedNoteId === step.id;
          const hasNote = step.note.trim().length > 0;

          return (
            <div
              key={step.id}
              className={`rj-d5-step-card rj-d5-step-card--${status}`}
            >
              <div className="rj-d5-step-icon">
                {status === "completed" ? (
                  <i className="bi bi-check-circle-fill" />
                ) : status === "active" ? (
                  <i className="bi bi-three-dots" />
                ) : (
                  <i className={`bi bi-${step.icon}`} />
                )}
              </div>
              <div className={`rj-d5-step-badge rj-d5-step-badge--${status}`}>
                {status === "completed"
                  ? "Completed"
                  : status === "active"
                    ? "Current Step"
                    : index === rows.length - 1
                      ? "Final Milestone"
                      : "Upcoming"}
              </div>
              <h3 className="rj-d5-step-title">{step.title}</h3>
              <p className="rj-d5-step-subtitle">{step.subtitle}</p>
              {step.done && step.completedAt && (
                <p className="rj-d5-step-date">Completed: {step.completedAt}</p>
              )}
              {status === "active" && (
                <div className="rj-d5-internal-notes">
                  <p className="rj-d5-internal-label">INTERNAL NOTES</p>
                  {expandedNoteId === step.id || hasNote ? (
                    <textarea
                      className="form-control form-control-sm rj-note-input rj-d5-internal-textarea"
                      rows={2}
                      placeholder="Add notes for high-fidelity renders, crew instructions..."
                      value={step.note}
                      onChange={(e) => setNote(step.id, e.target.value)}
                      aria-label="Internal production notes"
                    />
                  ) : (
                    <p className="rj-d5-internal-placeholder">
                      Add notes for high-fidelity renders, crew instructions...
                    </p>
                  )}
                  {!expandedNoteId && !hasNote && (
                    <button
                      type="button"
                      className="rj-d5-note-toggle"
                      onClick={() => setExpandedNoteId(step.id)}
                    >
                      Add Note
                    </button>
                  )}
                </div>
              )}
              <div className="rj-d5-step-foot">
                {status !== "active" && (
                  <button
                    type="button"
                    className="rj-d5-note-toggle"
                    onClick={() =>
                      setExpandedNoteId((cur) =>
                        cur === step.id ? null : step.id,
                      )
                    }
                  >
                    {showNote ? "Hide" : "Add"} Note
                  </button>
                )}
                {showNote && status !== "active" && (
                  <div className="rj-d5-note-expand">
                    <StepNoteBlock
                      step={step}
                      stepId={step.id}
                      setNote={setNote}
                      noteOpenForId={noteOpenForId}
                      setNoteOpenForId={setNoteOpenForId}
                    />
                  </div>
                )}
                <label className="rj-d5-step-checkbox">
                  <input
                    type="checkbox"
                    className="rj-check"
                    checked={step.done}
                    onChange={(e) => setDone(step.id, e.target.checked)}
                    aria-label={`Mark ${step.title} complete`}
                  />
                  <span>Mark as done</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
