"use client";

import type { ProjectDetails } from "@/hooks/useProjectDetails";

type Props = {
  details: ProjectDetails;
  updateDetail: <K extends keyof ProjectDetails>(
    key: K,
    value: ProjectDetails[K],
  ) => void;
  variant?: "compact" | "full";
  designVariant?: "d1" | "d2" | "d3" | "d4" | "d5";
};

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
          <p className={`rj-details-title rj-details-title--${designVariant}`}>Project Details</p>
          <div className={`rj-details-row rj-details-row--${designVariant}`}>
            <div className={`rj-details-field rj-details-field--${designVariant}`}>
              <label className={`rj-details-label rj-details-label--${designVariant}`}>
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
              <label className={`rj-details-label rj-details-label--${designVariant}`}>
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
          <div className={`rj-details-row rj-details-row--${designVariant} rj-details-row--three`}>
            <div className={`rj-details-field rj-details-field--${designVariant}`}>
              <label className={`rj-details-label rj-details-label--${designVariant}`}>
                Permit ($)
              </label>
              <input
                type="text"
                className={`rj-details-input rj-details-input--${designVariant}`}
                value={details.permitAllocation}
                onChange={(e) => updateDetail("permitAllocation", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={`rj-details-field rj-details-field--${designVariant}`}>
              <label className={`rj-details-label rj-details-label--${designVariant}`}>
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
              <label className={`rj-details-label rj-details-label--${designVariant}`}>
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
            <label className={`rj-details-label rj-details-label--${designVariant}`}>
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
      <div className="rj-d5-details-row">
        <div className="rj-d5-details-col">
          <div className="rj-d5-detail-card">
            <div className="rj-d5-detail-header">
              <i className="bi bi-file-text rj-d5-detail-icon rj-d5-detail-icon--blue" />
              <h3 className="rj-d5-detail-title">INTERNAL PRODUCTION NOTES</h3>
            </div>
            <textarea
              className="rj-d5-detail-textarea"
              rows={4}
              placeholder="Enter detailed site survey or crew instructions..."
              value={details.internalNotes}
              onChange={(e) => updateDetail("internalNotes", e.target.value)}
            />
          </div>
        </div>
        <div className="rj-d5-details-col">
          <div className="rj-d5-detail-card">
            <div className="rj-d5-detail-header">
              <i className="bi bi-truck rj-d5-detail-icon rj-d5-detail-icon--green" />
              <h3 className="rj-d5-detail-title">MATERIAL & LOGISTICS</h3>
            </div>
            <textarea
              className="rj-d5-detail-textarea"
              rows={4}
              placeholder="Special handling, delivery access, or fastener requirements..."
              value={details.materialLogistics}
              onChange={(e) =>
                updateDetail("materialLogistics", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="rj-d5-detail-card">
        <div className="rj-d5-detail-header">
          <i className="bi bi-shield-check rj-d5-detail-icon" />
          <h3 className="rj-d5-detail-title">REGULATORY & COMPLIANCE</h3>
        </div>
        <div className="rj-d5-details-row">
          <div className="rj-d5-details-col-half">
            <label className="rj-d5-detail-label">Permit Allocation</label>
            <div className="rj-d5-currency-input">
              <span className="rj-d5-currency-symbol">$</span>
              <input
                type="text"
                className="rj-d5-currency-field"
                value={details.permitAllocation}
                onChange={(e) => updateDetail("permitAllocation", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="rj-d5-details-col-half">
            <label className="rj-d5-detail-label">Requirement Details</label>
            <textarea
              className="rj-d5-detail-textarea"
              rows={3}
              placeholder="Jurisdiction permits, HOA codes..."
              value={details.requirementDetails}
              onChange={(e) =>
                updateDetail("requirementDetails", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="rj-d5-detail-card">
        <div className="rj-d5-detail-header">
          <i className="bi bi-box-seam rj-d5-detail-icon" />
          <h3 className="rj-d5-detail-title">SUPPLY CHAIN</h3>
        </div>
        <div className="rj-d5-details-row">
          <div className="rj-d5-details-col-half">
            <label className="rj-d5-detail-label">Order Placed</label>
            <div className="rj-d5-date-input">
              <input
                type="text"
                className="rj-d5-date-field"
                value={details.orderPlaced}
                onChange={(e) => updateDetail("orderPlaced", e.target.value)}
                placeholder="วว/ดด/ปปปป"
              />
              <i className="bi bi-calendar3 rj-d5-date-icon" />
            </div>
          </div>
          <div className="rj-d5-details-col-half">
            <label className="rj-d5-detail-label">Expected Delivery</label>
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
      </div>
    </div>
  );
}
