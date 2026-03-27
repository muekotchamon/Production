"use client";

import type { ReactNode } from "react";

type Props = {
  canvas: ReactNode;
  calendar: ReactNode;
  calendarAriaLabel?: string;
};

export default function ProductionFlowDesign2Layout({
  canvas,
  calendar,
  calendarAriaLabel = "Production schedule calendar",
}: Props): ReactNode {
  return (
    <div className="rj-pf-d2-flow-layout">
      <div className="rj-pf-d2-split rj-pf-d2-canvas-wrap rj-pf-d2-canvas--modern rj-pf-d2-split--flow-calendar">
        <div className="rj-pf-d2-canvas-scroll">
          <div className="rj-pf-d2-canvas-inner">{canvas}</div>
        </div>
        <aside
          className="rj-pf-d2-d1-calendar-rail"
          aria-label={calendarAriaLabel}
        >
          <div className="rj-pf-d2-flow-cal-wrap">{calendar}</div>
        </aside>
      </div>
    </div>
  );
}
