"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProjectDetails } from "@/hooks/useProjectDetails";
import { ASSIGN_CREW_DROPDOWN, crewAssignLabel } from "@/lib/production-crew";
import ProductionFlowCalendar, {
  type FlowCalendarMilestone,
} from "./ProductionFlowCalendar";
import ProductionFlowDesign2Layout from "./ProductionFlowDesign2Layout";

type MainNodeId =
  | "sold"
  | "contracted"
  | "assign"
  | "first-call"
  | "schedule"
  | "permit"
  | "material"
  | "waste"
  | "prod-start"
  | "prod-end"
  | "completion"
  | "closed";

type ChildKey =
  | "permit-applied"
  | "permit-obtained"
  | "permit-expire"
  | "permit-finalized"
  | "material-ordered"
  | "material-delivery"
  | "waste-ordered"
  | "waste-delivery";

type SelectedId = MainNodeId | ChildKey;

const MAIN_ORDER: MainNodeId[] = [
  "sold",
  "contracted",
  "assign",
  "first-call",
  "schedule",
  "permit",
  "material",
  "waste",
  "prod-start",
  "prod-end",
  "completion",
  "closed",
];

const MAIN_LABELS: Record<MainNodeId, { title: string; subtitle: string }> = {
  sold: { title: "Sold", subtitle: "Sale / close date" },
  contracted: { title: "Contracted", subtitle: "Agreement executed" },
  assign: {
    title: "Assign",
    subtitle: "Choose who is on the job",
  },
  "first-call": {
    title: "First Call",
    subtitle: "Mark done to log contact date",
  },
  schedule: { title: "Schedule", subtitle: "Start and end dates" },
  permit: { title: "Permit", subtitle: "Jurisdiction & compliance" },
  material: { title: "Material", subtitle: "Order & delivery" },
  waste: { title: "Waste hauling", subtitle: "Order & delivery" },
  "prod-start": {
    title: "Production start",
    subtitle: "Uses Schedule start when set; otherwise enter here",
  },
  "prod-end": {
    title: "Production end",
    subtitle: "Uses Schedule end when set; otherwise enter here",
  },
  completion: { title: "Completion", subtitle: "Walkthrough & sign-off" },
  closed: { title: "Closed", subtitle: "Archived in CRM" },
};

const ASSIGN_PERSON_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Select person" },
  ...ASSIGN_CREW_DROPDOWN,
];

function assignPersonLabel(personId: string): string {
  if (!personId.trim()) return "";
  return crewAssignLabel(personId);
}

function assignPersonSummary(personIds: string[]): string {
  const labels = personIds.map(assignPersonLabel).filter(Boolean);
  return labels.length ? labels.join(", ") : "";
}

const ASSIGN_PERSON_CHOICES = ASSIGN_CREW_DROPDOWN;

function AssignPersonMultiSelect({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (next: string[]) => void;
}): ReactNode {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const n = selectedIds.length;
  const summaryText =
    n === 0
      ? "Select person"
      : n === 1
        ? assignPersonLabel(selectedIds[0]!)
        : `${n} selected`;

  const togglePerson = (value: string) => {
    const has = selectedIds.includes(value);
    onChange(
      has ? selectedIds.filter((x) => x !== value) : [...selectedIds, value],
    );
  };

  return (
    <div
      className="rj-pf-d2-assign-multiselect"
      ref={rootRef}
      data-open={open ? "true" : "false"}
    >
      <button
        type="button"
        className="rj-pf-d2-assign-multiselect-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={panelId}
        aria-label={`Assign to people. ${summaryText}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rj-pf-d2-assign-multiselect-summary">{summaryText}</span>
        <span className="rj-pf-d2-assign-multiselect-chevron" aria-hidden>
          <i className={`bi bi-chevron-${open ? "up" : "down"}`} />
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          className="rj-pf-d2-assign-multiselect-panel"
          role="listbox"
          aria-multiselectable="true"
        >
          {ASSIGN_PERSON_CHOICES.map((o) => {
            const inputId = `rj-pf-d2-assign-ms-${o.value}`;
            const checked = selectedIds.includes(o.value);
            return (
              <label
                key={o.value}
                className="rj-pf-d2-assign-multiselect-item"
                role="option"
                aria-selected={checked}
              >
                <input
                  type="checkbox"
                  className="rj-pf-d2-assign-multiselect-checkbox form-check-input"
                  id={inputId}
                  checked={checked}
                  onChange={() => togglePerson(o.value)}
                />
                <span className="rj-pf-d2-assign-multiselect-option-label">
                  {o.label}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const PERMIT_CHILDREN: {
  key: ChildKey;
  label: string;
  flag: keyof ProjectDetails;
  dateKey: keyof ProjectDetails;
}[] = [
  {
    key: "permit-applied",
    label: "Applied",
    flag: "permitApplied",
    dateKey: "permitAppliedDate",
  },
  {
    key: "permit-obtained",
    label: "Obtained",
    flag: "permitObtain",
    dateKey: "permitObtainDate",
  },
  {
    key: "permit-expire",
    label: "Expire",
    flag: "permitExpiration",
    dateKey: "permitExpirationDate",
  },
  {
    key: "permit-finalized",
    label: "Finalized",
    flag: "permitFinalized",
    dateKey: "permitFinalizedDate",
  },
];

type Props = {
  details: ProjectDetails;
  updateDetail: <K extends keyof ProjectDetails>(
    key: K,
    value: ProjectDetails[K],
  ) => void;
};

/** Shown when a manual check step logs completion (first call, assign, closed, …). */
function formatFirstCallCheckDate(d = new Date()): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Parse stored date string (ISO, US slash, or locale short) for picker round-trip. */
function parseStoredDate(stored: string): Date | null {
  const t = stored.trim();
  if (!t) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (iso) {
    const y = Number(iso[1]);
    const mo = Number(iso[2]) - 1;
    const day = Number(iso[3]);
    const d = new Date(y, mo, day);
    if (
      d.getFullYear() === y &&
      d.getMonth() === mo &&
      d.getDate() === day
    ) {
      return d;
    }
  }
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  if (us) {
    const mo = Number(us[1]) - 1;
    const day = Number(us[2]);
    const y = Number(us[3]);
    const d = new Date(y, mo, day);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const parsed = new Date(t);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dateToIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function parseStoredDateToIso(stored: string): string {
  const d = parseStoredDate(stored);
  return d ? dateToIsoLocal(d) : "";
}

function formatStoredFromIsoPicker(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FlowDateInput({
  value,
  onChange,
  disabled,
  ariaLabel = "Select date",
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}): ReactNode {
  const isoValue = parseStoredDateToIso(value);
  return (
    <div className="rj-pf-d2-date-input-wrap">
      <input
        type="date"
        className="form-control form-control-sm rj-pf-d2-input rj-pf-d2-date-native"
        value={isoValue}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) onChange("");
          else onChange(formatStoredFromIsoPicker(v));
        }}
        disabled={disabled}
        aria-label={ariaLabel}
      />
    </div>
  );
}

const AUTO_DATE_STEP_IDS = new Set<MainNodeId>([
  "sold",
  "contracted",
  "prod-start",
  "prod-end",
]);

function stopPfD2ExpandPointer(e: { stopPropagation: () => void }) {
  e.stopPropagation();
}

/** Schedule dates take precedence; otherwise production-specific dates apply. */
type FlowLocalProdScheduleSlice = {
  scheduleStart: string;
  scheduleEnd: string;
  productionStart: string;
  productionEnd: string;
};

function effectiveProductionStart(fl: FlowLocalProdScheduleSlice): string {
  return fl.scheduleStart.trim() ? fl.scheduleStart : fl.productionStart;
}

function effectiveProductionEnd(fl: FlowLocalProdScheduleSlice): string {
  return fl.scheduleEnd.trim() ? fl.scheduleEnd : fl.productionEnd;
}

/** Production dates stay hidden / unlinked until Schedule has both start and end. */
function scheduleFlowDatesReady(fl: FlowLocalProdScheduleSlice): boolean {
  return (
    fl.scheduleStart.trim().length > 0 && fl.scheduleEnd.trim().length > 0
  );
}

function primaryDateForAutoStep(
  id: MainNodeId,
  details: ProjectDetails,
  flowLocal: FlowLocalProdScheduleSlice & { contractedDate: string },
): string {
  switch (id) {
    case "sold":
      return details.soldDate;
    case "contracted":
      return flowLocal.contractedDate;
    case "prod-start":
      if (!scheduleFlowDatesReady(flowLocal)) return "";
      return effectiveProductionStart(flowLocal);
    case "prod-end":
      if (!scheduleFlowDatesReady(flowLocal)) return "";
      return effectiveProductionEnd(flowLocal);
    default:
      return "";
  }
}

function isStepDone(
  id: MainNodeId,
  details: ProjectDetails,
  flowLocal: FlowLocalProdScheduleSlice & { contractedDate: string },
  mainDone: Record<MainNodeId, boolean>,
): boolean {
  if (AUTO_DATE_STEP_IDS.has(id)) {
    return primaryDateForAutoStep(id, details, flowLocal).trim().length > 0;
  }
  return mainDone[id];
}

function nodeStatus(
  id: MainNodeId,
  active: MainNodeId[],
  details: ProjectDetails,
  flowLocal: FlowLocalProdScheduleSlice & { contractedDate: string },
  mainDone: Record<MainNodeId, boolean>,
): "done" | "current" | "upcoming" {
  if (isStepDone(id, details, flowLocal, mainDone)) return "done";
  const firstOpen = active.find(
    (n) => !isStepDone(n, details, flowLocal, mainDone),
  );
  if (firstOpen === id) return "current";
  return "upcoming";
}

function stepFormsAttachToNode(
  nodeId: MainNodeId,
  selected: SelectedId,
): boolean {
  if (selected === nodeId) return true;
  if (
    nodeId === "permit" &&
    (selected === "permit" ||
      (typeof selected === "string" && selected.startsWith("permit-")))
  ) {
    return true;
  }
  if (
    nodeId === "material" &&
    (selected === "material" ||
      (typeof selected === "string" && selected.startsWith("material-")))
  ) {
    return true;
  }
  if (
    nodeId === "waste" &&
    (selected === "waste" ||
      (typeof selected === "string" && selected.startsWith("waste-")))
  ) {
    return true;
  }
  return false;
}

export default function ProductionFlowDesign2({
  details,
  updateDetail,
}: Props) {
  const [selectedId, setSelectedId] = useState<SelectedId>("sold");
  const [permitExpanded, setPermitExpanded] = useState(true);
  const [materialExpanded, setMaterialExpanded] = useState(true);
  const [wasteExpanded, setWasteExpanded] = useState(true);
  const [scheduleFieldsExpanded, setScheduleFieldsExpanded] = useState(false);
  const [completionChecklistExpanded, setCompletionChecklistExpanded] =
    useState(true);
  const [assignFieldsExpanded, setAssignFieldsExpanded] = useState(false);
  const [prodStartFieldsExpanded, setProdStartFieldsExpanded] =
    useState(false);
  const [prodEndFieldsExpanded, setProdEndFieldsExpanded] = useState(false);
  const [mainDone, setMainDone] = useState<Record<MainNodeId, boolean>>(() => {
    const init = {} as Record<MainNodeId, boolean>;
    MAIN_ORDER.forEach((id) => {
      init[id] = false;
    });
    return init;
  });

  const [flowLocal, setFlowLocal] = useState({
    contractedDate: "Feb 24, 2025",
    assignPersonIds: [] as string[],
    assignCheckedAt: "",
    firstCallCheckedAt: "",
    productionStart: "Apr 08, 2025",
    productionEnd: "Apr 14, 2025",
    wasteDelivery: "",
    completionFinalPayment: false,
    completionSigned: false,
    completionPhotoUploaded: false,
    closedCheckedAt: "",
  });

  const flowWithSchedule = useMemo(
    () => ({
      ...flowLocal,
      scheduleStart: details.scheduleStart,
      scheduleEnd: details.scheduleEnd,
    }),
    [flowLocal, details.scheduleStart, details.scheduleEnd],
  );

  const activeNodes = MAIN_ORDER;

  const setLocal = useCallback(
    <K extends keyof typeof flowLocal>(key: K, value: (typeof flowLocal)[K]) => {
      setFlowLocal((p) => ({ ...p, [key]: value }));
    },
    [],
  );

  const toggleMainDone = useCallback((id: MainNodeId) => {
    setMainDone((p) => {
      const nextDone = !p[id];
      if (id === "first-call") {
        setFlowLocal((fl) => ({
          ...fl,
          firstCallCheckedAt: nextDone ? formatFirstCallCheckDate() : "",
        }));
      }
      if (id === "closed") {
        setFlowLocal((fl) => ({
          ...fl,
          closedCheckedAt: nextDone ? formatFirstCallCheckDate() : "",
        }));
      }
      if (id === "schedule") {
        if (nextDone) {
          setScheduleFieldsExpanded(true);
          setSelectedId("schedule");
        } else {
          setScheduleFieldsExpanded(false);
        }
      }
      if (id === "assign") {
        setFlowLocal((fl) => ({
          ...fl,
          assignCheckedAt: nextDone ? formatFirstCallCheckDate() : "",
        }));
        if (nextDone) {
          setAssignFieldsExpanded(true);
          setSelectedId("assign");
        } else {
          setAssignFieldsExpanded(false);
        }
      }
      if (id === "completion") {
        if (nextDone) {
          setCompletionChecklistExpanded(true);
          setSelectedId("completion");
        } else {
          setCompletionChecklistExpanded(true);
        }
      }
      return { ...p, [id]: nextDone };
    });
  }, []);

  const markScheduleCompleteFromCalendar = useCallback(() => {
    setMainDone((p) => ({ ...p, schedule: true }));
    setScheduleFieldsExpanded(true);
    setSelectedId("schedule");
  }, []);

  const flowCalendarMilestones = useMemo((): FlowCalendarMilestone[] => {
    const m: FlowCalendarMilestone[] = [];
    const add = (id: string, title: string, date: string) => {
      const t = date.trim();
      if (!t) return;
      m.push({ id, title, dateStored: t });
    };
    if (mainDone.assign) {
      add("flow-ms-assign", "Assign", flowLocal.assignCheckedAt);
    }
    if (mainDone["first-call"]) {
      add("flow-ms-first-call", "First call", flowLocal.firstCallCheckedAt);
    }
    if (mainDone.closed) {
      add("flow-ms-closed", "Closed", flowLocal.closedCheckedAt);
    }
    if (details.permitApplied && details.permitAppliedDate.trim()) {
      add("flow-ms-permit-applied", "Permit applied", details.permitAppliedDate);
    }
    if (details.permitObtain && details.permitObtainDate.trim()) {
      add("flow-ms-permit-obtained", "Permit obtained", details.permitObtainDate);
    }
    if (details.permitExpiration && details.permitExpirationDate.trim()) {
      add(
        "flow-ms-permit-expiration",
        "Permit expiration",
        details.permitExpirationDate,
      );
    }
    if (details.permitFinalized && details.permitFinalizedDate.trim()) {
      add("flow-ms-permit-finalized", "Permit finalized", details.permitFinalizedDate);
    }
    if (details.orderPlaced.trim()) {
      add("flow-ms-material-ordered", "Material ordered", details.orderPlaced);
    }
    if (details.expectedDelivery.trim()) {
      add("flow-ms-material-delivery", "Material delivery", details.expectedDelivery);
    }
    if (details.dumpsterOrdered.trim()) {
      add("flow-ms-waste-ordered", "Waste ordered", details.dumpsterOrdered);
    }
    if (flowLocal.wasteDelivery.trim()) {
      add("flow-ms-waste-delivery", "Waste delivery", flowLocal.wasteDelivery);
    }
    return m;
  }, [mainDone, flowLocal, details]);

  const renderConnector = (isLast: boolean, lineClass: string) => {
    if (isLast) return null;
    return (
      <div className="rj-pf-d2-connector" aria-hidden>
        <span className={`rj-pf-d2-connector-line ${lineClass}`} />
      </div>
    );
  };

  const childStatus = (
    childComplete: boolean,
    siblingIndex: number,
    siblings: { complete: boolean }[],
  ): "done" | "current" | "upcoming" => {
    if (childComplete) return "done";
    const firstOpen = siblings.findIndex((s) => !s.complete);
    if (firstOpen === siblingIndex) return "current";
    if (firstOpen >= 0 && siblingIndex < firstOpen) return "done";
    return "upcoming";
  };

  const renderPermitChildren = () => {
    const sibs = PERMIT_CHILDREN.map((c) => ({
      complete: Boolean(details[c.flag]),
    }));
    return PERMIT_CHILDREN.map((c, i) => {
      const st = childStatus(Boolean(details[c.flag]), i, sibs);
      return (
        <button
          key={c.key}
          type="button"
          className={`rj-pf-d2-child rj-pf-d2-child--${st} ${
            selectedId === c.key ? "is-selected" : ""
          }`}
          onClick={() => setSelectedId(c.key)}
        >
          <span className="rj-pf-d2-child-dot" />
          <span className="rj-pf-d2-child-label">{c.label}</span>
          {(() => {
            const v = details[c.dateKey];
            return typeof v === "string" && v.trim() ? (
              <span className="rj-pf-d2-child-date">{v}</span>
            ) : null;
          })()}
        </button>
      );
    });
  };

  const renderMaterialChildren = () => {
    const sibs = [
      { complete: Boolean(details.orderPlaced.trim()) },
      { complete: Boolean(details.expectedDelivery.trim()) },
    ];
    const defs = [
      { key: "material-ordered" as const, label: "Ordered" },
      { key: "material-delivery" as const, label: "Delivery" },
    ];
    return defs.map((d, i) => {
      const st = childStatus(sibs[i].complete, i, sibs);
      return (
        <button
          key={d.key}
          type="button"
          className={`rj-pf-d2-child rj-pf-d2-child--${st} ${
            selectedId === d.key ? "is-selected" : ""
          }`}
          onClick={() => setSelectedId(d.key)}
        >
          <span className="rj-pf-d2-child-dot" />
          <span className="rj-pf-d2-child-label">{d.label}</span>
        </button>
      );
    });
  };

  const renderWasteChildren = () => {
    const sibs = [
      { complete: Boolean(details.dumpsterOrdered.trim()) },
      { complete: Boolean(flowLocal.wasteDelivery.trim()) },
    ];
    const defs = [
      { key: "waste-ordered" as const, label: "Ordered" },
      { key: "waste-delivery" as const, label: "Delivery" },
    ];
    return defs.map((d, i) => {
      const st = childStatus(sibs[i].complete, i, sibs);
      return (
        <button
          key={d.key}
          type="button"
          className={`rj-pf-d2-child rj-pf-d2-child--${st} ${
            selectedId === d.key ? "is-selected" : ""
          }`}
          onClick={() => setSelectedId(d.key)}
        >
          <span className="rj-pf-d2-child-dot" />
          <span className="rj-pf-d2-child-label">{d.label}</span>
        </button>
      );
    });
  };

  const renderMainNode = (id: MainNodeId, index: number) => {
    const isLast = index === MAIN_ORDER.length - 1;
    const st = nodeStatus(id, activeNodes, details, flowWithSchedule, mainDone);
    const { title, subtitle } = MAIN_LABELS[id];
    const rowActive = stepFormsAttachToNode(id, selectedId);

    const expandSchedule =
      id === "schedule" && mainDone.schedule ? (
        <button
          type="button"
          className="rj-pf-d2-expand"
          aria-expanded={scheduleFieldsExpanded}
          onPointerDown={stopPfD2ExpandPointer}
          onClick={(e) => {
            e.stopPropagation();
            setScheduleFieldsExpanded((v) => !v);
          }}
        >
          <i
            className={`bi bi-chevron-${scheduleFieldsExpanded ? "up" : "down"}`}
          />
        </button>
      ) : null;

    const expandAssign =
      id === "assign" && mainDone.assign ? (
        <button
          type="button"
          className="rj-pf-d2-expand"
          aria-expanded={assignFieldsExpanded}
          aria-label={
            assignFieldsExpanded ? "Hide assign form" : "Show assign form"
          }
          onPointerDown={stopPfD2ExpandPointer}
          onClick={(e) => {
            e.stopPropagation();
            setAssignFieldsExpanded((v) => !v);
          }}
        >
          <i
            className={`bi bi-chevron-${assignFieldsExpanded ? "up" : "down"}`}
          />
        </button>
      ) : null;

    const expandProdStart =
      id === "prod-start" ? (
        <button
          type="button"
          className="rj-pf-d2-expand"
          aria-expanded={prodStartFieldsExpanded}
          aria-label={
            prodStartFieldsExpanded
              ? "Hide production start form"
              : "Show production start form"
          }
          onPointerDown={stopPfD2ExpandPointer}
          onClick={(e) => {
            e.stopPropagation();
            setProdStartFieldsExpanded((v) => !v);
          }}
        >
          <i
            className={`bi bi-chevron-${prodStartFieldsExpanded ? "up" : "down"}`}
          />
        </button>
      ) : null;

    const expandProdEnd =
      id === "prod-end" ? (
        <button
          type="button"
          className="rj-pf-d2-expand"
          aria-expanded={prodEndFieldsExpanded}
          aria-label={
            prodEndFieldsExpanded
              ? "Hide production end form"
              : "Show production end form"
          }
          onPointerDown={stopPfD2ExpandPointer}
          onClick={(e) => {
            e.stopPropagation();
            setProdEndFieldsExpanded((v) => !v);
          }}
        >
          <i
            className={`bi bi-chevron-${prodEndFieldsExpanded ? "up" : "down"}`}
          />
        </button>
      ) : null;

    const expandPermit =
      id === "permit" ? (
        <button
          type="button"
          className="rj-pf-d2-expand"
          aria-expanded={permitExpanded}
          onPointerDown={stopPfD2ExpandPointer}
          onClick={(e) => {
            e.stopPropagation();
            setPermitExpanded((v) => !v);
          }}
        >
          <i className={`bi bi-chevron-${permitExpanded ? "up" : "down"}`} />
        </button>
      ) : null;

    const expandMaterial =
      id === "material" ? (
        <button
          type="button"
          className="rj-pf-d2-expand"
          aria-expanded={materialExpanded}
          onPointerDown={stopPfD2ExpandPointer}
          onClick={(e) => {
            e.stopPropagation();
            setMaterialExpanded((v) => !v);
          }}
        >
          <i className={`bi bi-chevron-${materialExpanded ? "up" : "down"}`} />
        </button>
      ) : null;

    const expandWaste =
      id === "waste" ? (
        <button
          type="button"
          className="rj-pf-d2-expand"
          aria-expanded={wasteExpanded}
          onPointerDown={stopPfD2ExpandPointer}
          onClick={(e) => {
            e.stopPropagation();
            setWasteExpanded((v) => !v);
          }}
        >
          <i className={`bi bi-chevron-${wasteExpanded ? "up" : "down"}`} />
        </button>
      ) : null;

    const expandCompletion =
      id === "completion" && mainDone.completion ? (
        <button
          type="button"
          className="rj-pf-d2-expand"
          aria-expanded={completionChecklistExpanded}
          aria-label={
            completionChecklistExpanded
              ? "Hide completion checklist"
              : "Show completion checklist"
          }
          onPointerDown={stopPfD2ExpandPointer}
          onClick={(e) => {
            e.stopPropagation();
            setCompletionChecklistExpanded((v) => !v);
          }}
        >
          <i
            className={`bi bi-chevron-${completionChecklistExpanded ? "up" : "down"}`}
          />
        </button>
      ) : null;

    const statusLabel =
      st === "done"
        ? "Completed"
        : st === "current"
          ? "Current step"
          : "Upcoming";

    const flowCardAriaLabel =
      id === "prod-start" || id === "prod-end"
        ? `${title}: ${statusLabel}. Select to focus this step. Use the chevron to show or hide the date form.`
        : `${title}: ${statusLabel}. Select to edit in card.`;

    let connectorLineClass = "rj-pf-d2-connector-line--neutral";
    if (!isLast) {
      const nextId = MAIN_ORDER[index + 1];
      const nextSt = nodeStatus(
        nextId,
        activeNodes,
        details,
        flowWithSchedule,
        mainDone,
      );
      if (st === "done" && nextSt === "done") {
        connectorLineClass = "rj-pf-d2-connector-line--done";
      } else if (st === "done" && nextSt === "current") {
        connectorLineClass = "rj-pf-d2-connector-line--to-current";
      } else if (st === "upcoming" && nextSt === "current") {
        connectorLineClass = "rj-pf-d2-connector-line--upcoming-to-current";
      }
    }

    const markerInteractive = !AUTO_DATE_STEP_IDS.has(id);

    const nodeMarker = markerInteractive ? (
      <button
        type="button"
        className={`rj-pf-d2-node-marker rj-pf-d2-node-marker--${st}`}
        aria-pressed={mainDone[id]}
        aria-label={
          id === "first-call"
            ? mainDone[id]
              ? "Clear first call; remove logged date"
              : "Mark first call done and log today’s date"
            : id === "assign"
              ? mainDone[id]
                ? "Mark Assign as not complete; clear recorded date"
                : "Mark Assign as complete; record assignment date. Form opens automatically. Use chevron to hide or show later."
              : id === "completion"
                ? mainDone[id]
                  ? "Mark Completion as not complete"
                  : "Mark Completion as complete; use chevron to show or hide checklist"
                  : id === "closed"
                    ? mainDone[id]
                      ? "Mark Closed as not complete; clear recorded date"
                      : "Mark Closed as complete and record close date"
                    : mainDone[id]
                      ? `Mark ${title} as not complete`
                      : `Mark ${title} as complete`
        }
        onClick={(e) => {
          e.stopPropagation();
          toggleMainDone(id);
        }}
      >
        {st === "done" ? <i className="bi bi-check-lg" aria-hidden /> : null}
        {st === "current" ? (
          <span className="rj-pf-d2-node-marker-dot" aria-hidden />
        ) : null}
      </button>
    ) : (
      <span
        className={`rj-pf-d2-node-marker rj-pf-d2-node-marker--${st}`}
        aria-hidden
      >
        {st === "done" ? <i className="bi bi-check-lg" /> : null}
        {st === "current" ? <span className="rj-pf-d2-node-marker-dot" /> : null}
      </span>
    );

    const dateLine = (value: string) => (
      <>
        <span className="rj-pf-d2-node-flow-inline-label">Date</span>
        <span className="rj-pf-d2-node-flow-inline-main">
          {value.trim() ? value : "—"}
        </span>
      </>
    );

    const labeledDateLine = (label: string, value: string) => (
      <>
        <span className="rj-pf-d2-node-flow-inline-label">{label}</span>
        <span className="rj-pf-d2-node-flow-inline-main">
          {value.trim() ? value : "—"}
        </span>
      </>
    );

    const flowInlineValues =
      id === "sold" ? (
        <div className="rj-pf-d2-node-flow-inline">
          <div className="rj-pf-d2-node-flow-inline-date-row">
            {dateLine(details.soldDate)}
          </div>
        </div>
      ) : id === "first-call" ? (
        <div className="rj-pf-d2-node-flow-inline">
          <div className="rj-pf-d2-node-flow-inline-date-row">
            {dateLine(flowLocal.firstCallCheckedAt)}
          </div>
        </div>
      ) : id === "contracted" ? (
        <div className="rj-pf-d2-node-flow-inline">
          <div className="rj-pf-d2-node-flow-inline-date-row">
            {dateLine(flowLocal.contractedDate)}
          </div>
        </div>
      ) : id === "schedule" ? (
        <div className="rj-pf-d2-node-flow-inline">
          <div className="rj-pf-d2-node-flow-inline-date-pair">
            <div className="rj-pf-d2-node-flow-inline-date-row">
              {labeledDateLine("Start date", details.scheduleStart)}
            </div>
            <div className="rj-pf-d2-node-flow-inline-date-row">
              {labeledDateLine("End date", details.scheduleEnd)}
            </div>
          </div>
        </div>
      ) : id === "assign" ? (
        <div className="rj-pf-d2-node-flow-inline">
          <div className="rj-pf-d2-node-flow-inline-date-row">
            {labeledDateLine(
              "Assigned",
              assignPersonSummary(flowLocal.assignPersonIds),
            )}
          </div>
          {mainDone.assign ? (
            <div className="rj-pf-d2-node-flow-inline-date-row">
              {dateLine(flowLocal.assignCheckedAt)}
            </div>
          ) : null}
        </div>
      ) : id === "prod-start" ? (
        <div className="rj-pf-d2-node-flow-inline">
          <div className="rj-pf-d2-node-flow-inline-date-row">
            {dateLine(
              scheduleFlowDatesReady(flowWithSchedule)
                ? effectiveProductionStart(flowWithSchedule)
                : "",
            )}
          </div>
        </div>
      ) : id === "prod-end" ? (
        <div className="rj-pf-d2-node-flow-inline">
          <div className="rj-pf-d2-node-flow-inline-date-row">
            {dateLine(
              scheduleFlowDatesReady(flowWithSchedule)
                ? effectiveProductionEnd(flowWithSchedule)
                : "",
            )}
          </div>
        </div>
      ) : id === "closed" ? (
        <div className="rj-pf-d2-node-flow-inline">
          <div className="rj-pf-d2-node-flow-inline-date-row">
            {dateLine(flowLocal.closedCheckedAt)}
          </div>
        </div>
      ) : null;

    return (
      <div key={id} className="rj-pf-d2-node-column">
        <div className="rj-pf-d2-node-wrap">
          <div
            className={`rj-pf-d2-node rj-pf-d2-node--flow-card rj-pf-d2-node--${st}${
              AUTO_DATE_STEP_IDS.has(id) ? " rj-pf-d2-node--flow-neutral" : ""
            }${rowActive ? " is-selected" : ""}`}
          >
            <div className="rj-pf-d2-node-flow-row">
              {nodeMarker}
              <div className="rj-pf-d2-node-flow-stack">
                <div className="rj-pf-d2-node-top">
                  <div className="rj-pf-d2-node-tools">
                    {expandSchedule}
                    {expandAssign}
                    {expandProdStart}
                    {expandProdEnd}
                    {expandPermit}
                    {expandMaterial}
                    {expandWaste}
                    {expandCompletion}
                  </div>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  aria-current={rowActive ? "step" : undefined}
                  aria-label={flowCardAriaLabel}
                  className="rj-pf-d2-node-flow-body"
                  onClick={() => setSelectedId(id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(id);
                    }
                  }}
                >
                  <h3 className="rj-pf-d2-node-title">{title}</h3>
                  <p className="rj-pf-d2-node-sub">{subtitle}</p>
                  {flowInlineValues}
                </div>
              </div>
            </div>
            {rowActive ||
            (id === "prod-start" && prodStartFieldsExpanded) ||
            (id === "prod-end" && prodEndFieldsExpanded) ? (
              id === "schedule" ? (
                (mainDone.schedule && scheduleFieldsExpanded) ||
                !mainDone.schedule ? (
                  <div
                    className="rj-pf-d2-node-flow-fields"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {mainDone.schedule && scheduleFieldsExpanded ? (
                      renderStepFields(selectedId)
                    ) : !mainDone.schedule ? (
                      <p className="rj-pf-d2-schedule-hint text-muted small mb-0">
                        Mark the step complete (circle) to enter start and end
                        dates.
                      </p>
                    ) : null}
                  </div>
                ) : null
              ) : id === "completion" ? (
                !mainDone.completion || completionChecklistExpanded ? (
                  <div
                    className="rj-pf-d2-node-flow-fields"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderStepFields(selectedId)}
                  </div>
                ) : null
              ) : id === "assign" ? (
                !mainDone.assign || assignFieldsExpanded ? (
                  <div
                    className="rj-pf-d2-node-flow-fields"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderStepFields(selectedId)}
                  </div>
                ) : null
              ) : id === "prod-start" ? (
                prodStartFieldsExpanded ? (
                  <div
                    className="rj-pf-d2-node-flow-fields"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderStepFields("prod-start")}
                  </div>
                ) : null
              ) : id === "prod-end" ? (
                prodEndFieldsExpanded ? (
                  <div
                    className="rj-pf-d2-node-flow-fields"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderStepFields("prod-end")}
                  </div>
                ) : null
              ) : id === "first-call" ||
                id === "sold" ||
                id === "contracted" ||
                id === "closed" ? null : (
                <div
                  className="rj-pf-d2-node-flow-fields"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderStepFields(selectedId)}
                </div>
              )
            ) : null}
          </div>
        </div>
        {id === "permit" && permitExpanded ? (
          <div className="rj-pf-d2-children">{renderPermitChildren()}</div>
        ) : null}
        {id === "material" && materialExpanded ? (
          <div className="rj-pf-d2-children">{renderMaterialChildren()}</div>
        ) : null}
        {id === "waste" && wasteExpanded ? (
          <div className="rj-pf-d2-children">{renderWasteChildren()}</div>
        ) : null}
        {renderConnector(isLast, connectorLineClass)}
      </div>
    );
  };

  const renderStepFields = (sid: SelectedId): ReactNode => {
    const field = (
      label: string,
      el: React.ReactNode,
    ) => (
      <div className="rj-pf-d2-field rj-pf-d2-field--inline">
        <label className="rj-pf-d2-field-label">{label}</label>
        {el}
      </div>
    );

    if (sid === "sold" || sid === "contracted") {
      return null;
    }
    if (sid === "assign") {
      return field(
        "Assign to",
        <AssignPersonMultiSelect
          selectedIds={flowLocal.assignPersonIds}
          onChange={(next) => setLocal("assignPersonIds", next)}
        />,
      );
    }
    if (sid === "first-call") {
      return null;
    }
    if (sid === "schedule") {
      return (
        <>
          <div className="rj-pf-d2-field-pair">
            {field(
              "Start date",
              <FlowDateInput
                value={details.scheduleStart}
                onChange={(v) => updateDetail("scheduleStart", v)}
                ariaLabel="Schedule start date"
              />,
            )}
            {field(
              "End date",
              <FlowDateInput
                value={details.scheduleEnd}
                onChange={(v) => updateDetail("scheduleEnd", v)}
                ariaLabel="Schedule end date"
              />,
            )}
          </div>
        </>
      );
    }
    if (sid === "permit" || sid.startsWith("permit-")) {
      const child = PERMIT_CHILDREN.find((c) => c.key === sid);
      return (
        <>
          <div className="rj-pf-d2-toggle-row rj-pf-d2-toggle-row--no-line">
            <span>IPI Required</span>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={details.permitIpiRequired}
                onChange={(e) =>
                  updateDetail("permitIpiRequired", e.target.checked)
                }
              />
            </div>
          </div>
          {child ? (
            <>
              {field(
                "Date",
                <FlowDateInput
                  value={String(details[child.dateKey] ?? "")}
                  onChange={(v) => {
                    updateDetail(child.dateKey, v);
                    updateDetail(child.flag, v.trim().length > 0);
                  }}
                  ariaLabel={`${child.label} date`}
                />,
              )}
            </>
          ) : null}
        </>
      );
    }
    if (
      sid === "material" ||
      sid === "material-ordered" ||
      sid === "material-delivery"
    ) {
      return (
        <>
          {field(
            "Ordered",
            <FlowDateInput
              value={details.orderPlaced}
              onChange={(v) => updateDetail("orderPlaced", v)}
              ariaLabel="Material ordered date"
            />,
          )}
          {field(
            "Delivery",
            <FlowDateInput
              value={details.expectedDelivery}
              onChange={(v) => updateDetail("expectedDelivery", v)}
              ariaLabel="Expected delivery date"
            />,
          )}
        </>
      );
    }
    if (
      sid === "waste" ||
      sid === "waste-ordered" ||
      sid === "waste-delivery"
    ) {
      return (
        <>
          {field(
            "Ordered",
            <FlowDateInput
              value={details.dumpsterOrdered}
              onChange={(v) => updateDetail("dumpsterOrdered", v)}
              ariaLabel="Waste ordered date"
            />,
          )}
          {field(
            "Delivery",
            <FlowDateInput
              value={flowLocal.wasteDelivery}
              onChange={(v) => setLocal("wasteDelivery", v)}
              ariaLabel="Waste delivery date"
            />,
          )}
        </>
      );
    }
    if (sid === "prod-start") {
      if (!scheduleFlowDatesReady(flowWithSchedule)) {
        return (
          <p className="rj-pf-d2-prod-date-hint text-muted small mb-0">
            Set both start and end in the <strong>Schedule</strong> step first.
            Then production start will show here and stay in sync with schedule
            start.
          </p>
        );
      }
      return (
        <>
          <p className="rj-pf-d2-prod-date-hint text-muted small mb-0">
            Showing <strong>Schedule</strong> start — change it here or in
            Schedule; both stay in sync.
          </p>
          {field(
            "Production start date",
            <FlowDateInput
              value={effectiveProductionStart(flowWithSchedule)}
              onChange={(v) => updateDetail("scheduleStart", v)}
              ariaLabel="Production start date"
            />,
          )}
        </>
      );
    }
    if (sid === "prod-end") {
      if (!scheduleFlowDatesReady(flowWithSchedule)) {
        return (
          <p className="rj-pf-d2-prod-date-hint text-muted small mb-0">
            Set both start and end in the <strong>Schedule</strong> step first.
            Then production end will show here and stay in sync with schedule
            end.
          </p>
        );
      }
      return (
        <>
          <p className="rj-pf-d2-prod-date-hint text-muted small mb-0">
            Showing <strong>Schedule</strong> end — change it here or in
            Schedule; both stay in sync.
          </p>
          {field(
            "Production end date",
            <FlowDateInput
              value={effectiveProductionEnd(flowWithSchedule)}
              onChange={(v) => updateDetail("scheduleEnd", v)}
              ariaLabel="Production end date"
            />,
          )}
        </>
      );
    }
    if (sid === "completion") {
      const completionCheckRow = (
        label: string,
        flowKey:
          | "completionFinalPayment"
          | "completionSigned"
          | "completionPhotoUploaded",
      ) => (
        <div key={flowKey} className="rj-pf-d2-toggle-row">
          <span>{label}</span>
          <div className="form-check mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              checked={flowLocal[flowKey]}
              onChange={(e) => setLocal(flowKey, e.target.checked)}
              aria-label={label}
            />
          </div>
        </div>
      );
      return (
        <div className="rj-pf-d2-completion-checklist">
          <span className="rj-pf-d2-field-label rj-pf-d2-completion-checklist-heading">
            Checklist
          </span>
          {completionCheckRow("Final Payment", "completionFinalPayment")}
          {completionCheckRow("Signed", "completionSigned")}
          {completionCheckRow("Photo uploaded", "completionPhotoUploaded")}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rj-pf-d2">
      <ProductionFlowDesign2Layout
        canvas={MAIN_ORDER.map((id, i) => renderMainNode(id, i))}
        calendar={
          <ProductionFlowCalendar
            details={details}
            updateDetail={updateDetail}
            assignPersonIds={flowLocal.assignPersonIds}
            flowMilestones={flowCalendarMilestones}
            onScheduleDatesSaved={markScheduleCompleteFromCalendar}
          />
        }
      />
    </div>
  );
}
