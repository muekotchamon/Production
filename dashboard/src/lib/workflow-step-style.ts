export type WorkflowStepVisual = "completed" | "active" | "pending";

export function workflowStepVisual(
  row: { done: boolean },
  index: number,
  firstIncompleteIndex: number,
): WorkflowStepVisual {
  if (row.done) return "completed";
  if (index === firstIncompleteIndex) return "active";
  return "pending";
}
