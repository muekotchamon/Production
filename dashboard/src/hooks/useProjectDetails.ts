"use client";

import { useState, useCallback } from "react";

/** Multi-day work blocks on the Design 2 production calendar. */
export type ScheduleCalendarEntry = {
  id: string;
  title: string;
  assigneeId: string;
  startDate: string;
  endDate: string;
};

export type ProjectDetails = {
  customerName: string;
  customerAddress: string;
  soldDate: string;
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
  /** Shared by Schedule step, Assign (optional dates), production dates, and calendar. */
  scheduleStart: string;
  scheduleEnd: string;
  scheduleCalendarEntries: ScheduleCalendarEntry[];
};

const initialDetails: ProjectDetails = {
  customerName: "Valerie Chen",
  customerAddress: "4521 Maple Ave, Chicago, IL 60640",
  soldDate: "Feb 10, 2025",
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
  scheduleStart: "",
  scheduleEnd: "",
  scheduleCalendarEntries: [],
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
