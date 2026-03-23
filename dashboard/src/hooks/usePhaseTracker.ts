"use client";

import { useCallback, useMemo, useState } from "react";
import { PHASES, type PhaseDef } from "@/lib/phases";
import { formatTodayLong, formatTodayShort } from "@/lib/date-utils";

export type PhaseRow = PhaseDef & {
  done: boolean;
  completedAt: string | null;
  note: string;
};

function buildRows(): PhaseRow[] {
  return PHASES.map((p) => ({
    ...p,
    done: false,
    completedAt: null,
    note: "",
  }));
}

export function usePhaseTracker() {
  const [rows, setRows] = useState<PhaseRow[]>(buildRows);

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

  const toggleDone = useCallback((id: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = !r.done;
        return {
          ...r,
          done: next,
          completedAt: next ? formatTodayShort() : null,
        };
      }),
    );
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, note } : r)));
  }, []);

  const todayShort = useMemo(() => formatTodayShort(), []);

  return { rows, setDone, toggleDone, setNote, todayShort };
}
