import { Card, SectionHead } from "../design/ui";
import { useAppStore } from "../state/app";
import { useSummary } from "../lib/queries";

export function Settings() {
  const { theme, accent, layout } = useAppStore();
  const { data } = useSummary();

  return (
    <>
      <SectionHead
        kicker="Settings"
        title="House rules"
        subtitle="Your preferences live in localStorage. Profile edits persist to the API (soon)."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card kicker="Profile" title={data?.user.name ?? "…"}>
          {data && (
            <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 24px" }}>
              <dt className="label-mono">email</dt>
              <dd style={{ fontFamily: "var(--sans)" }}>{data.user.email ?? "—"}</dd>
              <dt className="label-mono">age</dt>
              <dd style={{ fontFamily: "var(--sans)" }}>{data.user.age}</dd>
              <dt className="label-mono">retire at</dt>
              <dd style={{ fontFamily: "var(--sans)" }}>{data.user.retireAge}</dd>
              <dt className="label-mono">return rate</dt>
              <dd style={{ fontFamily: "var(--sans)" }}>{data.user.returnRate}%</dd>
            </dl>
          )}
        </Card>

        <Card kicker="Appearance" title="Visual tone">
          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 24px" }}>
            <dt className="label-mono">theme</dt>
            <dd style={{ fontFamily: "var(--sans)" }}>{theme}</dd>
            <dt className="label-mono">accent</dt>
            <dd style={{ fontFamily: "var(--sans)" }}>{accent}</dd>
            <dt className="label-mono">layout</dt>
            <dd style={{ fontFamily: "var(--sans)" }}>{layout}</dd>
          </dl>
          <div style={{ marginTop: 14, fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink-3)" }}>
            Change these in the Tweak panel.
          </div>
        </Card>
      </div>
    </>
  );
}
