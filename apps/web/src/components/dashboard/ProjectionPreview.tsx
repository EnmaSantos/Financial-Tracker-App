import Link from "next/link";
import { LineChart } from "@/components/charts/LineChart";
import { makeProjection } from "@/lib/finance";
import { fmt$ } from "@/lib/money";

type Props = {
  startingNetWorth: number;
  monthlyContribution: number;
  returnRate: number; // percent
  startYear: number;
  years?: number;
};

/**
 * Read-only preview of the user's default 30-year trajectory. Lives on the
 * dashboard as the right column of the lead-grid; the interactive version is
 * on /scenarios.
 */
export function ProjectionPreview({
  startingNetWorth,
  monthlyContribution,
  returnRate,
  startYear,
  years = 30,
}: Props) {
  const data = makeProjection(
    startingNetWorth,
    startYear,
    monthlyContribution,
    returnRate / 100,
    years,
  );
  const ending = data[data.length - 1]?.value ?? 0;

  return (
    <section
      className="p-6 rounded-xl border border-rule bg-paper-2"
      aria-label="Net worth projection"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="label-kicker mb-1.5">The arc</div>
          <h2 className="font-serif-display text-[20px] leading-none">
            Projection, {years} years
          </h2>
        </div>
        <Link
          href="/scenarios"
          className="font-mono text-[10px] uppercase tracking-wider text-ink-3 hover:text-ink"
        >
          What if →
        </Link>
      </div>
      <LineChart data={data} showBand height={240} />
      <div className="flex justify-between items-baseline mt-4 pt-3 border-t border-rule font-sans text-[12px] text-ink-3">
        <span>
          {startYear} · <span className="num text-ink">{fmt$(startingNetWorth, { compact: true })}</span>
        </span>
        <span>
          {startYear + years} ·{" "}
          <span className="num text-ink">{fmt$(ending, { compact: true })}</span>
        </span>
      </div>
    </section>
  );
}
