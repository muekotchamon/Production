"use client";

import { useEffect, useId, useRef, useState } from "react";

type RowNotePopoverProps = {
  value: string;
  onChange: (next: string) => void;
};

export default function RowNotePopover({
  value,
  onChange,
}: RowNotePopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="position-relative" ref={rootRef}>
      <button
        type="button"
        className="app-btn-ghost"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        Note
      </button>
      {open && (
        <div id={id} className="app-pop" role="dialog">
          <label className="app-field-label" htmlFor={`${id}-ta`}>
            Quick note
          </label>
          <textarea
            id={`${id}-ta`}
            className="form-control form-control-sm"
            rows={3}
            autoFocus
            placeholder="Type here…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
