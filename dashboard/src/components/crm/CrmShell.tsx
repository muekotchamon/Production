"use client";

import { useCallback, useState } from "react";
import { useWorkflowTracker } from "@/hooks/useWorkflowTracker";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import RoofingJobSidebar from "./workflow/RoofingJobSidebar";
import WorkflowCardGrid from "./workflow/WorkflowCardGrid";
import WorkflowHorizontal from "./workflow/WorkflowHorizontal";
import WorkflowPremiumPanel from "./workflow/WorkflowPremiumPanel";
import WorkflowProjectDashboard from "./workflow/WorkflowProjectDashboard";
import WorkflowVerticalTimeline from "./workflow/WorkflowVerticalTimeline";
import ProjectDashboardSidebar from "./workflow/ProjectDashboardSidebar";
import ProjectDetailsSection from "./workflow/ProjectDetailsSection";

type TabId = "d1" | "d2" | "d3" | "d4" | "d5";

const TABS: { id: TabId; label: string }[] = [
  { id: "d1", label: "Step bar" },
  { id: "d2", label: "Timeline" },
  { id: "d3", label: "Card grid" },
  { id: "d4", label: "Premium" },
  { id: "d5", label: "Project" },
];

export default function CrmShell() {
  const [tab, setTab] = useState<TabId>("d1");
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

  const projectDetailsProps = {
    details,
    updateDetail,
    designVariant: tab,
  };

  return (
    <div className="min-vh-100 d-flex flex-column rj-dashboard" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <header className="app-top">
        <div className="app-top-inner">
          <div>
            <p className="app-brand-sub">
              Roofing job workflow · production dashboard
            </p>
            <h1 className="app-brand">Exteriors production</h1>
          </div>
          <nav className="app-tabs" aria-label="Workflow layout">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="app-tab"
                aria-current={tab === t.id ? "true" : undefined}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main flex-grow-1">
        <div className="app-wrap py-2">
          <div className="row g-3 align-items-start">
            <div className="col-12 col-lg-5">
              {tab === "d1" && (
                <>
                  <WorkflowHorizontal {...shared} />
                  <ProjectDetailsSection {...projectDetailsProps} variant="compact" designVariant="d1" />
                </>
              )}
              {tab === "d2" && (
                <>
                  <WorkflowVerticalTimeline {...shared} />
                  <ProjectDetailsSection {...projectDetailsProps} variant="compact" designVariant="d2" />
                </>
              )}
              {tab === "d3" && (
                <>
                  <WorkflowCardGrid {...shared} />
                  <ProjectDetailsSection {...projectDetailsProps} variant="compact" designVariant="d3" />
                </>
              )}
              {tab === "d4" && (
                <>
                  <WorkflowPremiumPanel {...shared} />
                  <ProjectDetailsSection {...projectDetailsProps} variant="compact" designVariant="d4" />
                </>
              )}
              {tab === "d5" && <WorkflowProjectDashboard {...shared} />}
            </div>
            <div className="col-12 col-lg-7">
              {tab === "d5" ? (
                <ProjectDashboardSidebar
                  completedCount={completedCount}
                  totalSteps={totalSteps}
                  details={details}
                  updateDetail={updateDetail}
                />
              ) : (
                <RoofingJobSidebar
                  completedCount={completedCount}
                  totalSteps={totalSteps}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
