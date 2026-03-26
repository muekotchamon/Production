/** Crew / assignee list shared by Assign step and Design 2 production calendar. */
export type ProductionCrewMember = {
  id: string;
  label: string;
  /** Shown after em dash in Assign dropdown, e.g. "PM", "Lead installer". */
  assignSuffix: string;
  /** CSS hook for checkbox + event bars (pastel fill + text). */
  tone: string;
};

export const PRODUCTION_CREW: ProductionCrewMember[] = [
  { id: "pm-rivera", label: "Alex Rivera", assignSuffix: "PM", tone: "violet" },
  { id: "pm-kim", label: "Jordan Kim", assignSuffix: "PM", tone: "indigo" },
  {
    id: "lead-ortiz",
    label: "Sam Ortiz",
    assignSuffix: "Lead installer",
    tone: "rose",
  },
  {
    id: "lead-nguyen",
    label: "Casey Nguyen",
    assignSuffix: "Lead installer",
    tone: "amber",
  },
  {
    id: "coord-patel",
    label: "Riley Patel",
    assignSuffix: "Coordinator",
    tone: "teal",
  },
];

export function crewAssignLabel(id: string): string {
  const c = PRODUCTION_CREW.find((x) => x.id === id);
  if (!c) return id;
  return `${c.label} — ${c.assignSuffix}`;
}

/** Options for Assign multiselect (no empty row — parent prepends “Select person” if needed). */
export const ASSIGN_CREW_DROPDOWN: { value: string; label: string }[] =
  PRODUCTION_CREW.map((c) => ({
    value: c.id,
    label: crewAssignLabel(c.id),
  }));

export function crewLabel(id: string): string {
  const hit = PRODUCTION_CREW.find((c) => c.id === id);
  return hit?.label ?? id;
}

export function crewTone(id: string): string {
  const hit = PRODUCTION_CREW.find((c) => c.id === id);
  return hit?.tone ?? "slate";
}
