export type WorkflowStepDef = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
};

/**
 * Roofing job workflow — exactly these 5 steps (do not add or rename).
 */
export const WORKFLOW_STEPS: WorkflowStepDef[] = [
  {
    id: "s1",
    order: 1,
    title: "First Call",
    subtitle: "Initial contact, roof discussion, next steps.",
    icon: "telephone",
  },
  {
    id: "s2",
    order: 2,
    title: "Schedule",
    subtitle: "Install date and crew allocation confirmed.",
    icon: "calendar3",
  },
  {
    id: "s3",
    order: 3,
    title: "Reminder",
    subtitle: "Customer reminder and material readiness check.",
    icon: "bell",
  },
  {
    id: "s4",
    order: 4,
    title: "In Progress",
    subtitle: "On-site work: tear-off, install, safety.",
    icon: "hammer",
  },
  {
    id: "s5",
    order: 5,
    title: "Completion",
    subtitle: "Final walkthrough, sign-off, documentation.",
    icon: "check2-circle",
  },
];
