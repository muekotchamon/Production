"use client";

import { useState, useCallback } from "react";

export type ProjectDetails = {
  internalNotes: string;
  materialLogistics: string;
  permitAllocation: string;
  requirementDetails: string;
  orderPlaced: string;
  expectedDelivery: string;
};

const initialDetails: ProjectDetails = {
  internalNotes: "",
  materialLogistics: "",
  permitAllocation: "0.00",
  requirementDetails: "",
  orderPlaced: "",
  expectedDelivery: "",
};

export function useProjectDetails() {
  const [details, setDetails] = useState<ProjectDetails>(initialDetails);

  const updateDetail = useCallback(
    <K extends keyof ProjectDetails>(
      key: K,
      value: ProjectDetails[K],
    ) => {
      setDetails((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return { details, updateDetail };
}
