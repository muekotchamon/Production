"use client";

import { useCallback, useMemo, useState } from "react";
import { WORKFLOW_STEPS, type WorkflowStepDef } from "@/lib/workflow-steps";
import { formatTodayShort } from "@/lib/date-utils";

export type WorkflowRow = WorkflowStepDef & {
  done: boolean;
  completedAt: string | null;
  note: string;
};

function buildRows(): WorkflowRow[] {
  return WORKFLOW_STEPS.map((s) => ({
    ...s,
    done: false,
    completedAt: null,
    note: "",
  }));
}

export function useWorkflowTracker() {
  const [rows, setRows] = useState<WorkflowRow[]>(buildRows);

  const setDone = useCallback((id: string, done: boolean) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              done,
              completedAt: done ? formatTodayShort() : null,
            }
          : r,
      ),
    );
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, note } : r)));
  }, []);

  const completedCount = useMemo(
    () => rows.filter((r) => r.done).length,
    [rows],
  );

  const firstIncompleteIndex = useMemo(
    () => rows.findIndex((r) => !r.done),
    [rows],
  );

  return {
    rows,
    setDone,
    setNote,
    completedCount,
    totalSteps: rows.length,
    firstIncompleteIndex,
  };
}

export type WorkflowTrackerState = ReturnType<typeof useWorkflowTracker>;
