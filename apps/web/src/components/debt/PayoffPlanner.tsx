"use client";

import { useMemo, useState } from "react";
import {
  simulatePayoff,
  type DebtInput,
  type PayoffStrategy,
} from "@/lib/finance";
import { fmt$ } from "@/lib/money";

type Props = {
  debts: DebtInput[];
};

export function PayoffPlanner({ debts }: Props) {
  const [strategy, setStrategy] = useState<PayoffStrategy>("avalanche");
  const [extra, setExtra] = useState(0);

  const totalOwed = useMemo(
    () => debts.reduce((sum, d) => sum + Math.abs(d.balance), 0),
    [debts],
  );
  const totalMinimum = useMemo(
    () => debts.reduce((sum, d) => sum + (d.monthly ?? 0), 0),
    [debts],
  );

  const avalanche = useMemo(
    () => simulatePayoff(debts, extra, "avalanche"),
    [debts, extra],
  );
  const snowball = useMemo(
    () => simulatePayoff(debts, extra, "snowball"),
    [debts, extra],
  );
  const active = strategy === "avalanche" ? avalanche : snowball;
  const other = strategy === "avalanche" ? snowball : avalanche;

  // Order debts by the payoff sequence of the active strategy.
  const ordered = useMemo(() => {
    const byId = new Map(active.perDebt.map((p) => [p.id, p]));
    return [...debts].sort(
      (a, b) =>
        (byId.get(a.id)?.paidOffMonth ?? Infinity) -
        (byId.get(b.id)?.paidOffMonth ?? Infinity),
    );
  }, [debts, active]);

  if (debts.length === 0) {
    return (
      <p className="font-sans text-[13px] text-ink-3">
        No debts on the books. Nothing to plan.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
      {/* Controls */}
      <aside className="flex flex-col gap-6">
        <div>
          <div className="label-kicker mb-2">Strategy</div>
          <div className="flex gap-2">
            {(["avalanche", "snowball"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStrategy(s)}
                className={[
                  "flex-1 text-center font-mono text-[11px] uppercase tracking-wider py-2 rounded-md border transition-colors",
                  strategy === s
                    ? "border-ink bg-ink text-paper"
                    : "border-rule text-ink-2 hover:border-ink",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="font-sans text-[11px] text-ink-3 mt-2 leading-snug">
            {strategy === "avalanche"
              ? "Highest APR first. Mathematically optimal."
              : "Smallest balance first. Quicker wins, more interest."}
          </p>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-2">
            <div className="label-kicker">Extra monthly</div>
            <div className="num text-[16px]">{fmt$(extra)}</div>
          </div>
          <input
            type="range"
            min={0}
            max={2000}
            step={25}
            value={extra}
            onChange={(e) => setExtra(Number(e.target.value))}
            className="w-full accent-ink"
          />
          <div className="flex justify-between mt-1 font-mono text-[10px] text-ink-3">
            <span>$0</span>
            <span>$2,000</span>
          </div>
          <p className="font-sans text-[11px] text-ink-3 mt-3">
            On top of the {fmt$(totalMinimum)} you already pay each month.
          </p>
        </div>

        <dl className="flex flex-col gap-2 font-sans text-[12px] text-ink-2 border-t border-rule pt-4">
          <div className="flex justify-between">
            <dt>Total owed</dt>
            <dd className="num text-ink">{fmt$(totalOwed)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Min payment</dt>
            <dd className="num text-ink">{fmt$(totalMinimum)}</dd>
          </div>
        </dl>
      </aside>

      {/* Results */}
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-3 gap-6 pb-6 border-b border-rule">
          <Stat
            label="Debt-free in"
            value={
              active.months > 0
                ? formatDuration(active.months)
                : "— now —"
            }
          />
          <Stat label="Total interest" value={fmt$(active.totalInterest)} />
          <Stat
            label={`vs ${strategy === "avalanche" ? "snowball" : "avalanche"}`}
            value={formatDelta(active, other)}
            sub={
              other.totalInterest - active.totalInterest >= 0
                ? "less interest"
                : "more interest"
            }
          />
        </div>

        <div>
          <div className="label-kicker mb-3">Payoff order</div>
          <ol className="flex flex-col divide-y divide-rule">
            {ordered.map((d, i) => {
              const perDebt = active.perDebt.find((p) => p.id === d.id);
              return (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="num text-ink-3 text-[12px] w-4 shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-serif-text text-[15px] truncate">
                        {d.name}
                      </span>
                      <span className="font-sans text-[11px] text-ink-3">
                        {d.apr != null && (
                          <>
                            <span className="font-mono">
                              {d.apr.toFixed(2)}% APR
                            </span>
                            <span className="mx-1.5">·</span>
                          </>
                        )}
                        min {fmt$(d.monthly ?? 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="num text-[15px]">
                      {fmt$(Math.abs(d.balance))}
                    </span>
                    <span className="font-mono text-[10px] text-ink-3">
                      {perDebt && perDebt.paidOffMonth > 0
                        ? `paid off month ${perDebt.paidOffMonth}`
                        : "—"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="label-mono">{label}</div>
      <div className="num display text-[24px] leading-none">{value}</div>
      {sub && (
        <div className="font-sans text-[11px] text-ink-3 mt-1">{sub}</div>
      )}
    </div>
  );
}

function formatDuration(months: number) {
  if (months <= 0) return "—";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${months}mo`;
  if (rem === 0) return `${years}yr`;
  return `${years}yr ${rem}mo`;
}

function formatDelta(
  active: { totalInterest: number; months: number },
  other: { totalInterest: number; months: number },
) {
  const diff = other.totalInterest - active.totalInterest;
  const sign = diff >= 0 ? "−" : "+";
  return `${sign}${fmt$(Math.abs(diff))}`;
}
