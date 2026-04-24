import Link from "next/link";
import { LineChart } from "@/components/charts/LineChart";
import { fmt$ } from "@/lib/money";

type Props = {
  history: Array<{ date: string; value: number }>;
  href?: string;
  ctaLabel?: string;
};

function formatDateLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function NetWorthHistoryPreview({
  history,
  href = "/app/transactions",
  ctaLabel = "Manage activity →",
}: Props) {
  const data = history.map((point, index) => ({
    year: index,
    value: point.value,
  }));
  const first = history[0] ?? null;
  const last = history[history.length - 1] ?? null;

  return (
    <section
      className="rounded-xl border border-rule bg-paper-2 p-6"
      aria-label="Net worth history"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="label-kicker mb-1.5">Balance through time</div>
          <h2 className="font-serif-display text-[20px] leading-none">
            How your net worth has moved
          </h2>
        </div>
        <Link
          href={href}
          className="font-mono text-[10px] uppercase tracking-wider text-ink-3 hover:text-ink"
        >
          {ctaLabel}
        </Link>
      </div>

      <LineChart data={data} showBand height={240} />

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
