"use client";

import { useMemo, useState } from "react";
import { LineChart } from "@/components/charts/LineChart";
import { fmt$ } from "@/lib/money";

type Props = {
  history: Array<{ date: string; value: number }>;
  isDebt?: boolean;
};
type Range = "30d" | "90d" | "all";

function formatDateLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function AccountBalanceHistory({ history, isDebt = false }: Props) {
  const [range, setRange] = useState<Range>("90d");

  const filteredHistory = useMemo(() => {
    if (range === "all" || history.length <= 1) {
      return history;
    }

    const lastDate = history[history.length - 1]?.date;
    if (!lastDate) return history;

    const cutoff = new Date(`${lastDate}T00:00:00`);
    cutoff.setDate(cutoff.getDate() - (range === "30d" ? 29 : 89));

    const filtered = history.filter(
      (point) => new Date(`${point.date}T00:00:00`) >= cutoff,
    );

    return filtered.length > 0 ? filtered : history;
  }, [history, range]);

  const data = filteredHistory.map((point, index) => ({
    year: index,
    value: point.value,
    label: formatDateLabel(point.date),
    valueLabel: fmt$(point.value),
  }));
  const first = filteredHistory[0] ?? null;
  const last = filteredHistory[filteredHistory.length - 1] ?? null;

  return (
    <section className="rounded-[24px] border border-rule bg-paper-2 p-6 shadow-[var(--shadow-1)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="label-kicker mb-2">Balance history</div>
          <h2 className="display text-[28px] leading-none">How this account has moved</h2>
        </div>
        <div className="flex items-center gap-2">
          {(["30d", "90d", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={[
                "rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors",
                range === value
                  ? "border-ink bg-ink text-paper"
                  : "border-rule text-ink-2 hover:border-ink hover:text-ink",
              ].join(" ")}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <LineChart
        data={data}
        showBand
        height={260}
        trendMode={isDebt ? "debt" : "standard"}
      />

      {first && last ? (
        <div className="mt-4 flex items-baseline justify-between border-t border-rule pt-3 font-sans text-[12px] text-ink-3">
          <span>
            {formatDateLabel(first.date)} ·{" "}
            <span className="num text-ink">{fmt$(first.value, { compact: true })}</span>
          </span>
          <span>
            {formatDateLabel(last.date)} ·{" "}
            <span className="num text-ink">{fmt$(last.value, { compact: true })}</span>
          </span>
        </div>
      ) : null}
    </section>
  );
}
