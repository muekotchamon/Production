"use client";

import type { SyntheticEvent } from "react";
import type { WorkflowRow } from "@/hooks/useWorkflowTracker";

type Props = {
  step: WorkflowRow;
  stepId: string;
  setNote: (id: string, note: string) => void;
  noteOpenForId: string | null;
  setNoteOpenForId: (id: string | null) => void;
};

export default function StepNoteBlock({
  step,
  stepId,
  setNote,
  noteOpenForId,
  setNoteOpenForId,
}: Props) {
  if (!step.done) return null;

  const hasText = step.note.trim().length > 0;
  const expanded = noteOpenForId === stepId || hasText;

  const stopCardToggle = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  if (!expanded) {
    return (
      <div onClick={stopCardToggle} onKeyDown={stopCardToggle}>
        <button
          type="button"
          className="rj-note-add"
          onClick={() => setNoteOpenForId(stepId)}
        >
          + Add Note
        </button>
      </div>
    );
  }

  return (
    <div onClick={stopCardToggle} onKeyDown={stopCardToggle}>
      <textarea
        className="form-control form-control-sm rj-note-input"
        rows={2}
        placeholder="Optional note…"
        value={step.note}
        onChange={(e) => setNote(stepId, e.target.value)}
        aria-label="Step note"
      />
    </div>
  );
}
