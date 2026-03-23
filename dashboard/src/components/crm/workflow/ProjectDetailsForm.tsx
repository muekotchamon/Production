"use client";

import type { ProjectDetails } from "@/hooks/useProjectDetails";
import ProjectDetailsSection from "./ProjectDetailsSection";

type Props = {
  details: ProjectDetails;
  updateDetail: <K extends keyof ProjectDetails>(
    key: K,
    value: ProjectDetails[K],
  ) => void;
};

export default function ProjectDetailsForm({ details, updateDetail }: Props) {
  return <ProjectDetailsSection details={details} updateDetail={updateDetail} />;
}
