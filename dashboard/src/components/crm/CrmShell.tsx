"use client";

import { useCallback, useState } from "react";
import { useWorkflowTracker } from "@/hooks/useWorkflowTracker";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import WorkflowProjectDashboard from "./workflow/WorkflowProjectDashboard";
import ProjectDashboardSidebar from "./workflow/ProjectDashboardSidebar";
import ProductionFlowDesign2 from "./workflow/ProductionFlowDesign2";

export default function CrmShell() {
  const [shellDesign, setShellDesign] = useState<"design1" | "design2">(
    "design1",
  );
  const [noteOpenForId, setNoteOpenForId] = useState<string | null>(null);
  const {
    rows,
    setDone,
    setNote,
    completedCount,
    totalSteps,
    firstIncompleteIndex,
  } = useWorkflowTracker();
  const { details, updateDetail } = useProjectDetails();

  const handleSetDone = useCallback(
    (id: string, done: boolean) => {
      if (!done) {
        setNoteOpenForId((cur) => (cur === id ? null : cur));
      }
      setDone(id, done);
    },
    [setDone],
  );

  const shared = {
    rows,
    setDone: handleSetDone,
    setNote,
    completedCount,
    totalSteps,
    firstIncompleteIndex,
    noteOpenForId,
    setNoteOpenForId,
  };

  return (
    <div
      className="d-flex flex-column flex-grow-1 rj-dashboard"
      style={{ paddingLeft: 0, paddingRight: 0, minHeight: 0 }}
    >
      <header className="app-top">
        <div className="app-top-inner">
          <div>
            <p className="app-brand-sub">
              Roofing job workflow · production dashboard
            </p>
            <h1 className="app-brand">Exteriors production</h1>
          </div>
          <nav className="app-tabs" aria-label="Dashboard layout">
            <button
              type="button"
              className="app-tab"
              aria-current={shellDesign === "design1" ? "true" : undefined}
              onClick={() => setShellDesign("design1")}
            >
              Design 1
            </button>
            <button
              type="button"
              className="app-tab"
              aria-current={shellDesign === "design2" ? "true" : undefined}
              onClick={() => setShellDesign("design2")}
            >
              Design 2
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main flex-grow-1">
        <div className="app-wrap py-2">
          {shellDesign === "design1" ? (
            <div className="rj-crm-design1-grid">
              <div className="rj-crm-design1-grid__main">
                <WorkflowProjectDashboard
                  {...shared}
                  productionDetail={details.productionDetail}
                />
              </div>
              <div className="rj-crm-design1-grid__side">
                <ProjectDashboardSidebar
                  completedCount={completedCount}
                  totalSteps={totalSteps}
                  details={details}
                  updateDetail={updateDetail}
                />
              </div>
            </div>
          ) : (
            <ProductionFlowDesign2
              details={details}
              updateDetail={updateDetail}
            />
          )}
        </div>
      </main>
    </div>
  );
}
