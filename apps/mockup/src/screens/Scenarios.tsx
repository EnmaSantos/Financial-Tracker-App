import { useEffect, useState } from "react";
import { Card, SectionHead, Slider, fmt$ } from "../design/ui";
import { LineChart } from "../design/charts";
import { useProjection } from "../lib/queries";

const PRESETS = [
  { label: "Default",          extraSavings:   0, jobChange:     0, bigExpense:      0, returnRate: 6.5 },
  { label: "Big raise",        extraSavings: 500, jobChange:  1200, bigExpense:      0, returnRate: 6.5 },
  { label: "Sabbatical",       extraSavings:   0, jobChange: -3000, bigExpense:      0, returnRate: 5.0 },
  { label: "House downpayment",extraSavings: 200, jobChange:     0, bigExpense: 60_000, returnRate: 6.5 },
  { label: "Early retire",     extraSavings: 800, jobChange:     0, bigExpense:      0, returnRate: 5.5 },
  { label: "Bear market",      extraSavings:   0, jobChange:     0, bigExpense:      0, returnRate: 2.0 },
];

export function Scenarios() {
  const [extraSavings, setExtra] = useState(0);
  const [jobChange, setJob] = useState(0);
  const [bigExpense, setBig] = useState(0);
  const [returnRate, setRate] = useState(6.5);
  const years = 30;

  const projection = useProjection();
  useEffect(() => {
    projection.mutate({ extraSavings, jobChange, bigExpense, returnRate, years });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraSavings, jobChange, bigExpense, returnRate]);

  const data = projection.data;

  return (
    <>
      <SectionHead
        kicker="Scenarios"
        title="Let's play with time"
        subtitle="Slide the dials — the dashed ghost line is your current path."
      />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setExtra(p.extraSavings);
                  setJob(p.jobChange);
                  setBig(p.bigExpense);
                  setRate(p.returnRate);
                }}
                className="btn btn-ghost"
                style={{ padding: "6px 10px", fontSize: 11 }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Slider
            label="Extra monthly savings"
            min={0}
            max={2000}
            step={50}
            value={extraSavings}
            onChange={setExtra}
            format={(v) => fmt$(v)}
          />
          <Slider
            label="Job / income change"
            min={-5000}
            max={5000}
            step={100}
            value={jobChange}
            onChange={setJob}
            format={(v) => fmt$(v, { signed: true })}
          />
          <Slider
            label="One-time big expense"
            min={0}
            max={150_000}
            step={1000}
            value={bigExpense}
            onChange={setBig}
            format={(v) => fmt$(v)}
          />
          <Slider
            label="Return rate"
            min={0}
            max={12}
            step={0.1}
            value={returnRate}
            onChange={setRate}
            format={(v) => `${v.toFixed(1)}%`}
          />
        </div>

        <Card kicker="Projection" title={`${years}-year outlook`}>
          {data ? (
            <>
              <LineChart data={data.adjusted} compareData={data.base} showBand height={320} />
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  marginTop: 16,
                  fontFamily: "var(--sans)",
                  fontSize: 12,
                  color: "var(--ink-2)",
                }}
              >
                <span>
                  base ending:{" "}
                  <b className="num">{fmt$(data.base[data.base.length - 1]?.value ?? 0, { compact: true })}</b>
                </span>
                <span>
                  scenario ending:{" "}
                  <b className="num">
                    {fmt$(data.adjusted[data.adjusted.length - 1]?.value ?? 0, { compact: true })}
                  </b>
                </span>
              </div>
            </>
          ) : (
            <div style={{ color: "var(--ink-3)" }}>running numbers…</div>
          )}
        </Card>
      </div>
    </>
  );
}
