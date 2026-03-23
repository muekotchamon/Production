"use client";

import type { Dispatch, SetStateAction } from "react";
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

function StepCard({
  step,
  index,
  firstIncompleteIndex,
  expandedId,
  setExpandedId,
  setDone,
  setNote,
  noteOpenForId,
  setNoteOpenForId,
}: {
  step: WorkflowTrackerState["rows"][number];
  index: number;
  firstIncompleteIndex: number;
  expandedId: string | null;
  setExpandedId: Dispatch<SetStateAction<string | null>>;
  setDone: WorkflowTrackerState["setDone"];
  setNote: WorkflowTrackerState["setNote"];
  noteOpenForId: string | null;
  setNoteOpenForId: (id: string | null) => void;
}) {
  const v = workflowStepVisual(step, index, firstIncompleteIndex);
  const expanded = expandedId === step.id;
  const cardClass = [
    "rj-d3-card",
    v === "completed" && "rj-d3-card--done",
    v === "active" && "rj-d3-card--active",
    v === "pending" && "rj-d3-card--pending",
    expanded && "rj-d3-card--expanded",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClass}
      role="button"
      tabIndex={0}
      onClick={() =>
        setExpandedId((cur) => (cur === step.id ? null : step.id))
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpandedId((cur) => (cur === step.id ? null : step.id));
        }
      }}
    >
      <div className="rj-d3-card-head">
        <h3 className="rj-d3-card-title">{step.title}</h3>
        <span className="rj-d3-icon">
          {step.done ? (
            <i className="bi bi-check-lg" aria-hidden />
          ) : (
            <i className={`bi bi-${step.icon}`} aria-hidden />
          )}
        </span>
      </div>
      <label
        className="d-flex align-items-center gap-2 small text-muted mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className="rj-check form-check-input m-0"
          checked={step.done}
          onChange={(e) => setDone(step.id, e.target.checked)}
          aria-label={`Mark ${step.title} complete`}
        />
        <span>Done</span>
      </label>
      {step.done && step.completedAt && (
        <div className="rj-d3-date mt-2">{step.completedAt}</div>
      )}
      <div
        className="rj-d3-expand"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <p className="small text-muted mb-2">{step.subtitle}</p>
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
}

export default function WorkflowCardGrid({
  rows,
  setDone,
  setNote,
  completedCount,
  totalSteps,
  firstIncompleteIndex,
  noteOpenForId,
  setNoteOpenForId,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const row1 = rows.slice(0, 3);
  const row2 = rows.slice(3, 5);

  return (
    <div>
      <div className="rj-d3-grid">
        {row1.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={i}
            firstIncompleteIndex={firstIncompleteIndex}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            setDone={setDone}
            setNote={setNote}
            noteOpenForId={noteOpenForId}
            setNoteOpenForId={setNoteOpenForId}
          />
        ))}
        <div className="rj-d3-row2">
          {row2.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={3 + i}
              firstIncompleteIndex={firstIncompleteIndex}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              setDone={setDone}
              setNote={setNote}
              noteOpenForId={noteOpenForId}
              setNoteOpenForId={setNoteOpenForId}
            />
          ))}
        </div>
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
