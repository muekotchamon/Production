"use client";

import ProjectDetailsForm from "./ProjectDetailsForm";
import ProjectDashboardCalendar from "./ProjectDashboardCalendar";
import type { ProjectDetails } from "@/hooks/useProjectDetails";

type Props = {
  completedCount: number;
  totalSteps: number;
  details: ProjectDetails;
  updateDetail: <K extends keyof ProjectDetails>(
    key: K,
    value: ProjectDetails[K],
  ) => void;
};

export default function ProjectDashboardSidebar({
  completedCount,
  totalSteps,
  details,
  updateDetail,
}: Props) {
  return (
    <div className="rj-d5-sidebar">
      <ProjectDashboardCalendar />

      <section className="rj-d5-side-widget">
        <div className="rj-d5-side-header">
          <h2>Project Team</h2>
          <button type="button" className="rj-d5-add-btn" aria-label="Add team member">
            <i className="bi bi-plus-lg" />
          </button>
        </div>
        <div className="rj-d5-team-list">
          <div className="rj-d5-team-item">
            <div className="rj-d5-team-avatar">JD</div>
            <div className="rj-d5-team-info">
              <p className="rj-d5-team-name">John Doe</p>
              <p className="rj-d5-team-role">Project Manager</p>
            </div>
          </div>
          <div className="rj-d5-team-item">
            <div className="rj-d5-team-avatar">SM</div>
            <div className="rj-d5-team-info">
              <p className="rj-d5-team-name">Sarah Miller</p>
              <p className="rj-d5-team-role">Site Supervisor</p>
            </div>
          </div>
          <div className="rj-d5-team-empty">
            <p>No People Assigned - Pending QA Approval</p>
          </div>
        </div>
      </section>

      <ProjectDetailsForm details={details} updateDetail={updateDetail} />
    </div>
  );
}
