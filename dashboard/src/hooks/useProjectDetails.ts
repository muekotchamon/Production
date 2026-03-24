"use client";

import { useState, useCallback } from "react";

export type ProjectDetails = {
  productionDetail: string;
  internalNotes: string;
  materialLogistics: string;
  permitAllocation: string;
  requirementDetails: string;
  orderPlaced: string;
  expectedDelivery: string;
  specialOrder: boolean;
  specialOrderOrdered: string;
  specialOrderDelivery: string;
  materialOrderingNote: string;
  permitRequired: boolean;
  permitApplied: boolean;
  permitAppliedDate: string;
  permitObtain: boolean;
  permitObtainDate: string;
  permitExpiration: boolean;
  permitExpirationDate: string;
  permitFinalized: boolean;
  permitFinalizedDate: string;
  permitIpiRequired: boolean;
  dumpsterEnabled: boolean;
  dumpsterOrdered: string;
  dumpsterCost: string;
};

const initialDetails: ProjectDetails = {
  productionDetail:
    "3/13- 1st Call: LVM letting Valerie know we will call when temp gets warmer",
  internalNotes: "",
  materialLogistics: "",
  permitAllocation: "",
  requirementDetails: "",
  orderPlaced: "",
  expectedDelivery: "",
  specialOrder: false,
  specialOrderOrdered: "",
  specialOrderDelivery: "",
  materialOrderingNote: "",
  permitRequired: false,
  permitApplied: false,
  permitAppliedDate: "",
  permitObtain: false,
  permitObtainDate: "",
  permitExpiration: false,
  permitExpirationDate: "",
  permitFinalized: false,
  permitFinalizedDate: "",
  permitIpiRequired: false,
  dumpsterEnabled: false,
  dumpsterOrdered: "",
  dumpsterCost: "",
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
