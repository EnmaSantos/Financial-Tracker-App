import { Card, SectionHead, fmt$ } from "../design/ui";
import { MilestoneTimeline } from "../design/charts";
import { useMilestones } from "../lib/queries";

export function Timeline() {
  const { data, isLoading } = useMilestones();
  if (isLoading || !data) return <div style={{ color: "var(--ink-3)" }}>loading…</div>;

  return (
    <>
      <SectionHead
        kicker="Timeline"
        title="Chapters"
        subtitle="Every milestone is a comma, not a full stop."
      />
      <Card>
        <MilestoneTimeline milestones={data.milestones} />
      </Card>

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
        {data.milestones.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "16px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div>
              <div className="label-mono">{m.year}</div>
              <div style={{ fontFamily: "var(--serif-display)", fontSize: 20, marginTop: 4 }}>
                {m.label}
              </div>
            </div>
            <div className="num" style={{ fontSize: 18 }}>
              {fmt$(m.value)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
