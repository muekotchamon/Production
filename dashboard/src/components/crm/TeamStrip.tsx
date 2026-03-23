"use client";

const MEMBERS = [
  { id: "1", initials: "AK", name: "Alex K." },
  { id: "2", initials: "MN", name: "Morgan N." },
  { id: "3", initials: "PT", name: "Pat T." },
  { id: "4", initials: "SR", name: "Sam R." },
  { id: "5", initials: "VC", name: "Vic C." },
];

const COLORS = [
  "linear-gradient(135deg,#f83b3b,#d32f2f)",
  "linear-gradient(135deg,#ff5252,#f83b3b)",
  "linear-gradient(135deg,#ff6b6b,#f83b3b)",
  "linear-gradient(135deg,#f83b3b,#c62828)",
  "linear-gradient(135deg,#ff4444,#d32f2f)",
];

type TeamStripProps = {
  className?: string;
  embedded?: boolean;
};

export default function TeamStrip({
  className = "",
  embedded = false,
}: TeamStripProps) {
  const body = (
    <>
      <p className="app-section-title">Crew &amp; subs</p>
      <div className="app-team-row">
        <div className="app-avatar-stack">
          {MEMBERS.map((m, i) => (
            <span
              key={m.id}
              className="app-avatar"
              style={{ background: COLORS[i % COLORS.length] }}
              title={m.name}
            >
              {m.initials}
            </span>
          ))}
        </div>
        <button type="button" className="btn btn-sm btn-outline-secondary">
          + Add people
        </button>
      </div>
      {!embedded && (
        <p className="app-subtle small mb-0 mt-2">
          Who is tied to this job on the schedule (foreman, gutter/siding subs,
          etc.).
        </p>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className={`pt-3 mt-2 border-top ${className}`.trim()}>{body}</div>
    );
  }

  return <div className={`app-card ${className}`.trim()}>{body}</div>;
}
