import { Card, Pill, SectionHead, fmt$ } from "../design/ui";
import { GoalArc } from "../design/charts";
import { useGoals } from "../lib/queries";

export function Goals() {
  const { data, isLoading } = useGoals();
  if (isLoading || !data) return <div style={{ color: "var(--ink-3)" }}>loading…</div>;

  return (
    <>
      <SectionHead
        kicker="Goals"
        title="Things you're working toward"
        subtitle="Each card shows progress and the projected completion date."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 16 }}>
        {data.goals.map((g) => {
          // For debt goals, current is negative; compute progress as fraction
          // of debt paid down vs. the goal's original target of 0.
          const progress =
            g.kind === "debt"
              ? 1 - Math.abs(g.current) / (Math.abs(g.current) + Math.abs(g.monthly) * 12 || 1)
              : Math.min(1, g.current / (g.target || 1));
          return (
            <Card key={g.id}>
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <GoalArc progress={progress} />
                <div style={{ flex: 1 }}>
                  <div className="label-kicker">{g.kind === "debt" ? "Pay off" : "Save for"}</div>
                  <div style={{ fontFamily: "var(--serif-display)", fontSize: 20, marginTop: 4 }}>
                    {g.name}
                  </div>
                  <div className="num" style={{ fontSize: 14, marginTop: 6 }}>
                    {fmt$(g.current)} / {fmt$(g.target)}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <Pill tone={g.onTrack ? "positive" : "negative"}>
                      {g.onTrack ? "on track" : "behind"}
                    </Pill>
                    <Pill tone="neutral">est. {g.projected}</Pill>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
