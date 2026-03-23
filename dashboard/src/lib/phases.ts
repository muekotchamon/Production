export type PhaseDef = {
  id: string;
  order: string;
  title: string;
  summary: string;
  icon: string;
};

/**
 * Roofing & exteriors workflow: replacement, channeling (flashing/drainage),
 * gutters, and siding — aligned to how crews run jobs on site.
 */
export const PHASES: PhaseDef[] = [
  {
    id: "p1",
    order: "01",
    title: "Lead & roof assessment",
    summary:
      "First visit, photos, replacement scope (shingles/metal), channeling, gutters, and siding notes.",
    icon: "telephone",
  },
  {
    id: "p2",
    order: "02",
    title: "Schedule & permits",
    summary:
      "Install window, permit/HOA submissions, dumpster and material delivery dates locked.",
    icon: "calendar3",
  },
  {
    id: "p3",
    order: "03",
    title: "Tear-off & deck prep",
    summary:
      "Protection, tear-off, deck inspection, dry-in plan before new roof system.",
    icon: "layers-half",
  },
  {
    id: "p4",
    order: "04",
    title: "Roof replacement & channeling",
    summary:
      "Underlayment, flashing/channeling, field install — watertight before trim trades.",
    icon: "house-up",
  },
  {
    id: "p5",
    order: "05",
    title: "Gutters, siding & closeout",
    summary:
      "Gutter install/adjust, siding touch or wrap, punch list, photos, and warranty packet.",
    icon: "droplet-half",
  },
];
