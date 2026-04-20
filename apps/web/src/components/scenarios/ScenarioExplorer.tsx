"use client";

import { useMemo, useState } from "react";
import { LineChart } from "@/components/charts/LineChart";
import { makeScenario } from "@/lib/finance";
import { fmt$ } from "@/lib/money";

type Preset = {
  label: string;
  extraSavings: number;
  jobChange: number;
  bigExpense: number;
  returnRate: number; // percent
};

const PRESETS: Preset[] = [
  { label: "Default", extraSavings: 0, jobChange: 0, bigExpense: 0, returnRate: 6.5 },
  { label: "Big raise", extraSavings: 500, jobChange: 1200, bigExpense: 0, returnRate: 6.5 },
  { label: "Sabbatical", extraSavings: 0, jobChange: -3000, bigExpense: 0, returnRate: 5.0 },
  { label: "House downpayment", extraSavings: 200, jobChange: 0, bigExpense: 60_000, returnRate: 6.5 },
  { label: "Early retire", extraSavings: 800, jobChange: 0, bigExpense: 0, returnRate: 5.5 },
  { label: "Bear market", extraSavings: 0, jobChange: 0, bigExpense: 0, returnRate: 2.0 },
];

type Props = {
  startingNetWorth: number;
  /** User's own configured return rate (%). */
  baselineReturnRate: number;
  /** What the user nets each month today. */
  baselineMonthlyContribution: number;
  startYear: number;
  years: number;
};

export function ScenarioExplorer({
  startingNetWorth,
  baselineReturnRate,
  baselineMonthlyContribution,
  startYear,
  years,
}: Props) {
  const [extraSavings, setExtra] = useState(0);
  const [jobChange, setJob] = useState(0);
  const [bigExpense, setBig] = useState(0);
  const [returnRate, setRate] = useState(baselineReturnRate);

  const { base, adjusted } = useMemo(
    () =>
      makeScenario({
        startingNetWorth,
        baseMonthlyContribution: baselineMonthlyContribution,
        extraSavings,
        jobChange,
        bigExpense,
        baseReturnRate: baselineReturnRate / 100,
        scenarioReturnRate: returnRate / 100,
        years,
        startYear,
      }),
    [
      startingNetWorth,
      baselineMonthlyContribution,
      extraSavings,
      jobChange,
      bigExpense,
      baselineReturnRate,
      returnRate,
      years,
      startYear,
    ],
  );

  const baseEnd = base[base.length - 1]?.value ?? 0;
  const adjEnd = adjusted[adjusted.length - 1]?.value ?? 0;
  const delta = adjEnd - baseEnd;

  function applyPreset(p: Preset) {
    setExtra(p.extraSavings);
    setJob(p.jobChange);
    setBig(p.bigExpense);
    setRate(p.returnRate);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
      <aside className="flex flex-col gap-6">
        <div>
          <div className="label-kicker mb-2">Presets</div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className="btn btn-ghost"
                style={{ padding: "5px 9px", fontSize: 11 }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <Dial
          label="Extra monthly savings"
          min={0}
          max={2000}
          step={50}
          value={extraSavings}
          onChange={setExtra}
          format={(v) => fmt$(v)}
        />
        <Dial
          label="Job / income change"
          min={-5000}
          max={5000}
          step={100}
          value={jobChange}
          onChange={setJob}
          format={(v) => fmt$(v, { signed: true })}
        />
        <Dial
          label="One-time big expense"
          min={0}
          max={150_000}
          step={1000}
          value={bigExpense}
          onChange={setBig}
          format={(v) => fmt$(v)}
        />
        <Dial
          label="Return rate"
          min={0}
          max={12}
          step={0.1}
          value={returnRate}
          onChange={setRate}
          format={(v) => `${v.toFixed(1)}%`}
        />
      </aside>

      <div>
        <div className="flex justify-between items-baseline mb-4">
          <div className="label-kicker">{years}-year outlook</div>
          <div className="font-sans text-[12px] text-ink-3">
            dashed = today&rsquo;s path
          </div>
        </div>
        <LineChart data={adjusted} compareData={base} showBand height={320} />
        <div className="flex flex-wrap gap-6 mt-5 font-sans text-[12px] text-ink-2 border-t border-rule pt-4">
          <span>
            base ending{" "}
            <b className="num text-ink">
              {fmt$(baseEnd, { compact: true })}
            </b>
          </span>
          <span>
            scenario ending{" "}
            <b className="num text-ink">
              {fmt$(adjEnd, { compact: true })}
            </b>
          </span>
          <span>
            delta{" "}
            <b
              className="num"
              style={{
                color:
                  delta >= 0 ? "var(--color-positive)" : "var(--color-negative)",
              }}
            >
              {delta >= 0 ? "+" : "−"}
              {fmt$(Math.abs(delta), { compact: true })}
            </b>
          </span>
        </div>
      </div>
    </div>
  );
}

function Dial({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <div className="label-kicker">{label}</div>
        <div className="num text-[15px] font-serif-display">{format(value)}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-ink"
      />
    </div>
  );
}
