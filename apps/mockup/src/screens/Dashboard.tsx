/**
 * Dashboard — serves the three design variants (editorial/timeline/grid)
 * off the zustand `layout` setting. The masthead/lead grid is adapted from
 * design/dashboard.jsx.
 */
import type { DashboardSummary } from "@ledger/shared";
import { BigNumber, Card, Pill, SectionHead, fmt$ } from "../design/ui";
import { LineChart, MilestoneTimeline, Sparkline, StackedBar } from "../design/charts";
import { useAppStore } from "../state/app";
import { useSummary } from "../lib/queries";

export function Dashboard() {
  const layout = useAppStore((s) => s.layout);
  const { data, isLoading, error } = useSummary();

  if (isLoading) return <Skeleton label="loading your ledger…" />;
  if (error || !data) return <Skeleton label="couldn't reach the API (is it running on :8787?)" />;

  if (layout === "timeline") return <DashboardTimeline s={data} />;
  if (layout === "grid") return <DashboardGrid s={data} />;
  return <DashboardEditorial s={data} />;
}

function Skeleton({ label }: { label: string }) {
  return (
    <div style={{ padding: 40, fontFamily: "var(--sans)", color: "var(--ink-3)" }}>{label}</div>
  );
}

function Masthead({ s }: { s: DashboardSummary }) {
  return (
    <header className="masthead-row">
      <div>
        <div className="label-kicker">Issue · {s.asOf}</div>
        <div
          className="display"
          style={{ fontSize: "clamp(44px, 6vw, 68px)", marginTop: 4 }}
        >
          {s.user.name.split(" ")[0]}'s ledger
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="label-mono">established {s.user.joinedYear}</div>
        <div
          style={{
            fontFamily: "var(--serif-text)",
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--ink-2)",
            marginTop: 6,
          }}
        >
          a quiet record of where you're going
        </div>
      </div>
    </header>
  );
}

function DashboardEditorial({ s }: { s: DashboardSummary }) {
  const allocation = [
    { value: Math.max(0, s.cash), color: "var(--chart-1)" },
    { value: Math.max(0, s.invest), color: "var(--chart-3)" },
    { value: Math.max(0, Math.abs(s.debt)), color: "var(--accent)" },
  ];

  const assets = s.accounts.filter((a) => a.type !== "debt");
  const debts = s.accounts.filter((a) => a.type === "debt");

  return (
    <>
      <Masthead s={s} />

      <div className="lead-grid" style={{ marginTop: 32 }}>
        <div>
          <div className="label-kicker">Net worth · today</div>
          <div className="display num hero-number" style={{ marginTop: 8 }}>
            {fmt$(s.netWorth)}
          </div>
          <div className="stats-row" style={{ marginTop: 18 }}>
            <Pill tone={s.netWorthTrend >= 0 ? "positive" : "negative"}>
              {s.netWorthTrend >= 0 ? "↑" : "↓"} {fmt$(Math.abs(s.netWorthTrend))} · 30d
            </Pill>
            <span
              style={{ color: "var(--ink-3)", fontFamily: "var(--sans)", fontSize: 12 }}
            >
              saving rate {(s.savingsRate * 100).toFixed(0)}%
            </span>
          </div>

          <FlowStrip s={s} />

          <div style={{ marginTop: 32, maxWidth: 360 }}>
            <div className="label-kicker" style={{ marginBottom: 10 }}>
              Allocation
            </div>
            <StackedBar segments={allocation} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--ink-3)",
              }}
            >
              <span>cash {fmt$(s.cash, { compact: true })}</span>
              <span>invest {fmt$(s.invest, { compact: true })}</span>
              <span>debt {fmt$(s.debt, { compact: true })}</span>
            </div>
          </div>
        </div>

        <Card kicker="The arc" title="Projection, 30 years">
          <LineChart
            data={[
              { year: new Date().getFullYear(), value: s.netWorth },
              ...s.milestones.map((m) => ({ year: m.year, value: m.value })),
            ]}
            height={260}
            showBand
          />
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          marginTop: 48,
          paddingTop: 32,
          borderTop: "1px solid var(--rule)",
        }}
      >
        <div>
          <SectionHead kicker="Assets" title="Liquid & Invested" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {assets.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: "var(--serif-text)", fontSize: 16 }}>{a.name}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--sans)" }}>
                    {a.institution}
                  </span>
                </div>
                <div className="num" style={{ fontSize: 16 }}>
                  {fmt$(a.balance)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHead kicker="Debts" title="Liabilities" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {debts.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "var(--serif-text)", fontSize: 16 }}>{a.name}</span>
                    {a.name.includes("Best Buy") && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--amber, #B8863A)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--sans)" }}>
                      {a.institution}
                    </span>
                    {a.name.includes("Best Buy") && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--amber, #B8863A)",
                          fontFamily: "var(--mono)",
                          fontWeight: 500,
                        }}
                      >
                        PROMO ENDS MAR 12
                      </span>
                    )}
                  </div>
                </div>
                <div className="num" style={{ fontSize: 16 }}>
                  {fmt$(a.balance)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 64 }}>
        <SectionHead
          kicker="Upcoming"
          title="Milestones"
          subtitle="the rhythm of the years to come"
        />
        <MilestoneTimeline milestones={s.milestones} />
      </div>
    </>
  );
}

function FlowStrip({ s }: { s: DashboardSummary }) {
  const itemStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 24,
        marginTop: 32,
        padding: "20px 0",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div style={itemStyle}>
        <div className="label-mono">In</div>
        <div className="num" style={{ fontSize: 20 }}>
          {fmt$(s.incomeNet)}
        </div>
      </div>
      <div style={itemStyle}>
        <div className="label-mono">Out</div>
        <div className="num" style={{ fontSize: 20 }}>
          {fmt$(Math.abs(s.expensesMonthly))}
        </div>
      </div>
      <div style={itemStyle}>
        <div className="label-mono">Saved</div>
        <div className="num" style={{ fontSize: 20, color: "var(--positive)" }}>
          {fmt$(s.incomeNet - Math.abs(s.expensesMonthly))}
        </div>
      </div>
    </div>
  );
}

function DashboardTimeline({ s }: { s: DashboardSummary }) {
  return (
    <>
      <Masthead s={s} />
      <Card kicker="Timeline view" title="Scrub through the plan" style={{ marginTop: 32 }}>
        <LineChart
          data={[
            { year: new Date().getFullYear(), value: s.netWorth },
            ...s.milestones.map((m) => ({ year: m.year, value: m.value })),
          ]}
          showBand
          showHandle
          handleYear={s.milestones[0]?.year ?? new Date().getFullYear()}
          onHandleChange={() => {
            /* demo only */
          }}
          height={320}
        />
      </Card>
      <MilestoneTimeline milestones={s.milestones} />
    </>
  );
}

function DashboardGrid({ s }: { s: DashboardSummary }) {
  return (
    <>
      <Masthead s={s} />
      <div className="cols-4" style={{ gap: 16, marginTop: 32 }}>
        {[
          { label: "Net worth", value: s.netWorth, sub: "today" },
          { label: "Cash", value: s.cash },
          { label: "Invested", value: s.invest },
          { label: "Debt", value: s.debt },
        ].map((k) => (
          <Card key={k.label}>
            <BigNumber size={28} value={k.value} label={k.label} sub={k.sub} />
          </Card>
        ))}
      </div>
      <SectionHead kicker="Accounts" title={`${s.accounts.length} live accounts`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16 }}>
        {s.accounts.map((a) => (
          <Card key={a.id}>
            <div className="label-kicker">{a.institution}</div>
            <div style={{ fontFamily: "var(--serif-display)", fontSize: 18, marginTop: 4 }}>
              {a.name}
            </div>
            <div className="num" style={{ marginTop: 8, fontSize: 22 }}>
              {fmt$(a.balance)}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
