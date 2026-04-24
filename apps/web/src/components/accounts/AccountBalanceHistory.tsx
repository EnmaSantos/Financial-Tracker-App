import { LineChart } from "@/components/charts/LineChart";
import { fmt$ } from "@/lib/money";

type Props = {
  history: Array<{ date: string; value: number }>;
};

function formatDateLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function AccountBalanceHistory({ history }: Props) {
  const data = history.map((point, index) => ({
    year: index,
    value: point.value,
  }));
  const first = history[0] ?? null;
  const last = history[history.length - 1] ?? null;

  return (
    <section className="rounded-[24px] border border-rule bg-paper-2 p-6 shadow-[var(--shadow-1)]">
      <div className="mb-5">
        <div className="label-kicker mb-2">Balance history</div>
        <h2 className="display text-[28px] leading-none">How this account has moved</h2>
      </div>

      <LineChart data={data} showBand height={260} />

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
