/**
 * Demo schedule — March 2026. Replace with job data from your system.
 */
export type ScheduleMarkerKind = "phase" | "delivery" | "permit" | "crew";

export type ScheduleMarker = {
  day: number;
  kind: ScheduleMarkerKind;
  short: string;
  label: string;
  phaseId?: string;
};

export const SCHEDULE_YEAR = 2026;
export const SCHEDULE_MONTH_INDEX = 2;
export const SCHEDULE_TODAY_DOM = 20;

export const PHASE_DEADLINE_DAY: Record<string, number> = {
  p1: 6,
  p2: 11,
  p3: 18,
  p4: 24,
  p5: 30,
};

export const SCHEDULE_MARKERS: ScheduleMarker[] = [
  {
    day: 3,
    kind: "crew",
    short: "Walk",
    label: "Ladder safety + laydown plan walkthrough (09:00)",
  },
  {
    day: 6,
    kind: "phase",
    short: "P01",
    label: "Target: signed scope (roof + channeling + gutters/siding notes)",
    phaseId: "p1",
  },
  {
    day: 10,
    kind: "permit",
    short: "Permit",
    label: "Building dept / HOA packet submitted",
  },
  {
    day: 11,
    kind: "phase",
    short: "P02",
    label: "Target: install week + shingle & metal delivery on calendar",
    phaseId: "p2",
  },
  {
    day: 15,
    kind: "crew",
    short: "Crew",
    label: "Foreman + gutter/siding sub coordination call",
  },
  {
    day: 18,
    kind: "phase",
    short: "P03",
    label: "Target: tear-off start — deck ready for dry-in",
    phaseId: "p3",
  },
  {
    day: 20,
    kind: "permit",
    short: "Permit",
    label: "AHJ / HOA response due",
  },
  {
    day: 22,
    kind: "delivery",
    short: "Mat",
    label: "Shingle bundle drop + drip edge / valley metal on site",
  },
  {
    day: 24,
    kind: "phase",
    short: "P04",
    label: "Target: roof replacement & channeling signed off (water test OK)",
    phaseId: "p4",
  },
  {
    day: 26,
    kind: "delivery",
    short: "Gutter",
    label: "Seamless gutter run — expected delivery / hang day",
  },
  {
    day: 30,
    kind: "phase",
    short: "P05",
    label: "Target: gutters & siding complete — homeowner walk + warranty docs",
    phaseId: "p5",
  },
];

export function markersOnDay(day: number): ScheduleMarker[] {
  return SCHEDULE_MARKERS.filter((m) => m.day === day);
}

export function upcomingMarkers(fromDay: number, limit = 5): ScheduleMarker[] {
  return [...SCHEDULE_MARKERS]
    .filter((m) => m.day >= fromDay)
    .sort((a, b) => a.day - b.day)
    .slice(0, limit);
}
