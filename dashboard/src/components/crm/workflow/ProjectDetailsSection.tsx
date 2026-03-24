"use client";

import type { ProjectDetails } from "@/hooks/useProjectDetails";

/** DD/MM/BBBB (พ.ศ.) — สอดคล้อง placeholder วว/ดด/ปปปป */
function formatThaiDateAuto(d = new Date()): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const beYear = d.getFullYear() + 543;
  return `${day}/${month}/${beYear}`;
}

function PermitStageCheckbox({
  id,
  checked,
  disabled,
  onChange,
  ariaLabel,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <div className="form-check rj-d5-permit-checkbox mb-0">
      <input
        id={id}
        className="form-check-input"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
    </div>
  );
}

type Props = {
  details: ProjectDetails;
  updateDetail: <K extends keyof ProjectDetails>(
    key: K,
    value: ProjectDetails[K],
  ) => void;
  variant?: "compact" | "full";
  designVariant?: "d1" | "d2" | "d3" | "d4" | "d5";
};

function GreenSwitch({
  id,
  checked,
  onChange,
  ariaLabel,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="form-check form-switch rj-d5-switch rj-d5-switch--green mb-0">
      <input
        id={id}
        className="form-check-input"
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
    </div>
  );
}

function SlateSwitch({
  id,
  checked,
  onChange,
  ariaLabel,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="form-check form-switch rj-d5-switch rj-d5-switch--slate mb-0">
      <input
        id={id}
        className="form-check-input"
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
    </div>
  );
}

const PERMIT_STAGE_DEFS = [
  {
    id: "rj-permit-applied",
    label: "Applied",
    ariaLabel: "Applied",
    flag: "permitApplied" as const,
    dateKey: "permitAppliedDate" as const,
  },
  {
    id: "rj-permit-obtain",
    label: "Obtain",
    ariaLabel: "Obtain",
    flag: "permitObtain" as const,
    dateKey: "permitObtainDate" as const,
  },
  {
    id: "rj-permit-expiration",
    label: "Expiration",
    ariaLabel: "Expiration",
    flag: "permitExpiration" as const,
    dateKey: "permitExpirationDate" as const,
  },
  {
    id: "rj-permit-finalized",
    label: "Finalized",
    ariaLabel: "Finalized",
    flag: "permitFinalized" as const,
    dateKey: "permitFinalizedDate" as const,
  },
];

export default function ProjectDetailsSection({
  details,
  updateDetail,
  variant = "full",
  designVariant = "d1",
}: Props) {
  if (variant === "compact") {
    const containerClass = `rj-details-${designVariant}`;

    return (
      <div className={`mt-3 ${containerClass}`}>
        <div className={`rj-details-card rj-details-card--${designVariant}`}>
          <p className={`rj-details-title rj-details-title--${designVariant}`}>
            Project Details
          </p>
          <div className={`rj-details-row rj-details-row--${designVariant}`}>
            <div className={`rj-details-field rj-details-field--${designVariant}`}>
              <label
                className={`rj-details-label rj-details-label--${designVariant}`}
              >
                Internal Notes
              </label>
              <textarea
                className={`rj-details-input rj-details-input--${designVariant}`}
                rows={2}
                placeholder="Site survey, crew instructions..."
                value={details.internalNotes}
                onChange={(e) => updateDetail("internalNotes", e.target.value)}
              />
            </div>
            <div className={`rj-details-field rj-details-field--${designVariant}`}>
              <label
                className={`rj-details-label rj-details-label--${designVariant}`}
              >
                Material & Logistics
              </label>
              <textarea
                className={`rj-details-input rj-details-input--${designVariant}`}
                rows={2}
                placeholder="Delivery access, requirements..."
                value={details.materialLogistics}
                onChange={(e) =>
                  updateDetail("materialLogistics", e.target.value)
                }
              />
            </div>
          </div>
          <div
            className={`rj-details-row rj-details-row--${designVariant} rj-details-row--three`}
          >
            <div className={`rj-details-field rj-details-field--${designVariant}`}>
              <label
                className={`rj-details-label rj-details-label--${designVariant}`}
              >
                Permit ($)
              </label>
              <input
                type="text"
                className={`rj-details-input rj-details-input--${designVariant}`}
                value={details.permitAllocation}
                onChange={(e) =>
                  updateDetail("permitAllocation", e.target.value)
                }
                placeholder="0.00"
              />
            </div>
            <div className={`rj-details-field rj-details-field--${designVariant}`}>
              <label
                className={`rj-details-label rj-details-label--${designVariant}`}
              >
                Order Date
              </label>
              <input
                type="text"
                className={`rj-details-input rj-details-input--${designVariant}`}
                value={details.orderPlaced}
                onChange={(e) => updateDetail("orderPlaced", e.target.value)}
                placeholder="วว/ดด/ปปปป"
              />
            </div>
            <div className={`rj-details-field rj-details-field--${designVariant}`}>
              <label
                className={`rj-details-label rj-details-label--${designVariant}`}
              >
                Delivery
              </label>
              <input
                type="text"
                className={`rj-details-input rj-details-input--${designVariant}`}
                value={details.expectedDelivery}
                onChange={(e) =>
                  updateDetail("expectedDelivery", e.target.value)
                }
                placeholder="วว/ดด/ปปปป"
              />
            </div>
          </div>
          <div className={`rj-details-field rj-details-field--${designVariant}`}>
            <label
              className={`rj-details-label rj-details-label--${designVariant}`}
            >
              Compliance Details
            </label>
            <textarea
              className={`rj-details-input rj-details-input--${designVariant}`}
              rows={2}
              placeholder="Jurisdiction permits, HOA codes..."
              value={details.requirementDetails}
              onChange={(e) =>
                updateDetail("requirementDetails", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rj-d5-details mt-3">
      <div className="rj-d5-details-row rj-d5-details-row--balanced">
        <div className="rj-d5-details-col">
          <div className="rj-d5-detail-card rj-d5-detail-card--stretch">
            <div className="rj-d5-detail-header">
              <i className="bi bi-file-text rj-d5-detail-icon rj-d5-detail-icon--blue" />
              <h3 className="rj-d5-detail-title">INTERNAL PRODUCTION NOTES</h3>
            </div>
            <textarea
              className="rj-d5-detail-textarea rj-d5-detail-textarea--fill"
              rows={4}
              placeholder="Enter detailed site survey or crew instructions..."
              value={details.internalNotes}
              onChange={(e) => updateDetail("internalNotes", e.target.value)}
            />
          </div>
        </div>
        <div className="rj-d5-details-col">
          <div className="rj-d5-detail-card rj-d5-detail-card--stretch rj-d5-detail-card--material">
            <div className="rj-d5-detail-header">
              <i className="bi bi-truck rj-d5-detail-icon rj-d5-detail-icon--green" />
              <h3 className="rj-d5-detail-title">MATERIAL ORDERING</h3>
            </div>
            <div className="rj-d5-material-card-body">
              <div className="rj-d5-details-row mb-3">
              <div className="rj-d5-details-col-half">
                <label className="rj-d5-detail-label">Ordered</label>
                <div className="rj-d5-date-input">
                  <input
                    type="text"
                    className="rj-d5-date-field"
                    value={details.orderPlaced}
                    onChange={(e) =>
                      updateDetail("orderPlaced", e.target.value)
                    }
                    placeholder="วว/ดด/ปปปป"
                  />
                  <i className="bi bi-calendar3 rj-d5-date-icon" />
                </div>
              </div>
              <div className="rj-d5-details-col-half">
                <label className="rj-d5-detail-label">Delivery</label>
                <div className="rj-d5-date-input">
                  <input
                    type="text"
                    className="rj-d5-date-field"
                    value={details.expectedDelivery}
                    onChange={(e) =>
                      updateDetail("expectedDelivery", e.target.value)
                    }
                    placeholder="วว/ดด/ปปปป"
                  />
                  <i className="bi bi-calendar3 rj-d5-date-icon" />
                </div>
              </div>
              </div>
              <div className="rj-d5-toggle-row mb-3">
                <span className="rj-d5-toggle-row-label">Special Order</span>
                <GreenSwitch
                  id="rj-special-order"
                  checked={details.specialOrder}
                  onChange={(v) => updateDetail("specialOrder", v)}
                  ariaLabel="Special order"
                />
              </div>
              {details.specialOrder && (
                <div className="rj-d5-details-row mb-3">
                  <div className="rj-d5-details-col-half">
                    <label className="rj-d5-detail-label">Ordered</label>
                    <div className="rj-d5-date-input">
                      <input
                        type="text"
                        className="rj-d5-date-field"
                        value={details.specialOrderOrdered}
                        onChange={(e) =>
                          updateDetail("specialOrderOrdered", e.target.value)
                        }
                        placeholder="วว/ดด/ปปปป"
                      />
                      <i className="bi bi-calendar3 rj-d5-date-icon" />
                    </div>
                  </div>
                  <div className="rj-d5-details-col-half">
                    <label className="rj-d5-detail-label">Delivery</label>
                    <div className="rj-d5-date-input">
                      <input
                        type="text"
                        className="rj-d5-date-field"
                        value={details.specialOrderDelivery}
                        onChange={(e) =>
                          updateDetail("specialOrderDelivery", e.target.value)
                        }
                        placeholder="วว/ดด/ปปปป"
                      />
                      <i className="bi bi-calendar3 rj-d5-date-icon" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="rj-d5-note-line rj-d5-note-line--material-footer">
              <label className="rj-d5-detail-label mb-2" htmlFor="rj-material-note">
                Note
              </label>
              <input
                id="rj-material-note"
                type="text"
                className="rj-d5-line-field"
                placeholder="Add a short note…"
                value={details.materialOrderingNote}
                onChange={(e) =>
                  updateDetail("materialOrderingNote", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rj-d5-detail-card rj-d5-detail-card--permit">
        <div className="rj-d5-detail-header rj-d5-detail-header--spread">
          <div className="rj-d5-detail-header-title">
            <i className="bi bi-shield-check rj-d5-detail-icon" />
            <div>
              <h3 className="rj-d5-detail-title mb-0">PERMIT</h3>
              <p className="rj-d5-permit-subtitle mb-0">
                Milestones and jurisdiction notes
              </p>
            </div>
          </div>
          <div className="rj-d5-inline-toggle">
            <span className="rj-d5-inline-toggle-label">Require</span>
            <GreenSwitch
              id="rj-permit-required"
              checked={details.permitRequired}
              onChange={(v) => updateDetail("permitRequired", v)}
              ariaLabel="Permit required"
            />
          </div>
        </div>

        <div className="rj-d5-permit-meta">
          <div className="rj-d5-permit-meta-cost">
            <label className="rj-d5-detail-label" htmlFor="rj-permit-cost">
              Permit cost
            </label>
            <div className="rj-d5-currency-input">
              <span className="rj-d5-currency-symbol">$</span>
              <input
                id="rj-permit-cost"
                type="text"
                className="rj-d5-currency-field"
                value={details.permitAllocation}
                disabled={!details.permitRequired}
                onChange={(e) =>
                  updateDetail("permitAllocation", e.target.value)
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="rj-d5-permit-meta-ipi">
            <span className="rj-d5-permit-meta-ipi-label">IPI required</span>
            <SlateSwitch
              id="rj-permit-ipi"
              checked={details.permitIpiRequired}
              disabled={!details.permitRequired}
              onChange={(v) => updateDetail("permitIpiRequired", v)}
              ariaLabel="IPI required"
            />
          </div>
        </div>

        <p className="rj-d5-permit-section-label">Status by stage</p>
        <div className="rj-d5-permit-stages-grid">
          {PERMIT_STAGE_DEFS.map((s) => (
            <div key={s.id} className="rj-d5-permit-cell">
              <div className="rj-d5-permit-cell-title">{s.label}</div>
              <div className="rj-d5-permit-cell-controls">
                <PermitStageCheckbox
                  id={s.id}
                  checked={details[s.flag]}
                  disabled={!details.permitRequired}
                  onChange={(v) => {
                    updateDetail(s.flag, v);
                    updateDetail(s.dateKey, v ? formatThaiDateAuto() : "");
                  }}
                  ariaLabel={s.ariaLabel}
                />
                <div className="rj-d5-date-input rj-d5-permit-cell-date">
                  <input
                    type="text"
                    className="rj-d5-date-field"
                    value={details[s.dateKey]}
                    disabled={
                      !details.permitRequired || !details[s.flag]
                    }
                    onChange={(e) =>
                      updateDetail(s.dateKey, e.target.value)
                    }
                    placeholder="วว/ดด/ปปปป"
                    aria-label={`${s.label} date`}
                  />
                  <i className="bi bi-calendar3 rj-d5-date-icon" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rj-d5-permit-comment">
          <label className="rj-d5-detail-label" htmlFor="rj-permit-comment">
            Comment
          </label>
          <textarea
            id="rj-permit-comment"
            className="rj-d5-detail-textarea rj-d5-permit-comment-textarea"
            rows={3}
            placeholder="Jurisdiction permits, HOA codes…"
            value={details.requirementDetails}
            disabled={!details.permitRequired}
            onChange={(e) =>
              updateDetail("requirementDetails", e.target.value)
            }
          />
        </div>
      </div>

      <div className="rj-d5-detail-card">
        <div className="rj-d5-detail-header rj-d5-detail-header--spread">
          <div className="rj-d5-detail-header-title">
            <h3 className="rj-d5-detail-title mb-0">DUMPSTER</h3>
          </div>
          <div className="rj-d5-inline-toggle">
            <i className="bi bi-calendar3 rj-d5-detail-icon me-1" aria-hidden />
            <GreenSwitch
              id="rj-dumpster-enabled"
              checked={details.dumpsterEnabled}
              onChange={(v) => updateDetail("dumpsterEnabled", v)}
              ariaLabel="Dumpster enabled"
            />
          </div>
        </div>
        <div className="rj-d5-details-row">
          <div className="rj-d5-details-col-half">
            <label className="rj-d5-detail-label">Ordered</label>
            <div className="rj-d5-date-input">
              <input
                type="text"
                className="rj-d5-date-field"
                value={details.dumpsterOrdered}
                disabled={!details.dumpsterEnabled}
                onChange={(e) =>
                  updateDetail("dumpsterOrdered", e.target.value)
                }
                placeholder="วว/ดด/ปปปป"
              />
              <i className="bi bi-calendar3 rj-d5-date-icon" />
            </div>
          </div>
          <div className="rj-d5-details-col-half">
            <label className="rj-d5-detail-label">Cost</label>
            <input
              type="text"
              className="rj-d5-line-field"
              value={details.dumpsterCost}
              disabled={!details.dumpsterEnabled}
              onChange={(e) => updateDetail("dumpsterCost", e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
