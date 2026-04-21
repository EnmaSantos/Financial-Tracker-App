import { fmt$ } from "@/lib/money";

type Props = {
  cash: number;
  invest: number;
  debt: number; // stored negative
};

/**
 * Stacked horizontal bar — cash / invest / debt (by absolute magnitude).
 * Pure server component: renders with CSS flex, no client JS.
 */
export function Allocation({ cash, invest, debt }: Props) {
  const segments = [
    { key: "cash", value: Math.max(0, cash), color: "var(--color-chart-1)" },
    {
      key: "invest",
      value: Math.max(0, invest),
      color: "var(--color-chart-3)",
    },
    {
      key: "debt",
      value: Math.max(0, Math.abs(debt)),
      color: "var(--color-accent)",
    },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className="mt-10 max-w-[360px]">
      <div className="label-kicker mb-2.5">Allocation</div>
      <div
        className="flex h-2 rounded-sm overflow-hidden"
        style={{ background: "var(--color-rule)" }}
        role="img"
        aria-label={`Allocation: cash ${fmt$(cash)}, invested ${fmt$(invest)}, debt ${fmt$(debt)}`}
      >
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              style={{
                width: `${(s.value / total) * 100}%`,
                background: s.color,
              }}
            />
          ) : null,
        )}
      </div>
      <div className="flex justify-between mt-2.5 font-mono text-[11px] text-ink-3">
        <span>cash {fmt$(cash, { compact: true })}</span>
        <span>invest {fmt$(invest, { compact: true })}</span>
        <span>debt {fmt$(debt, { compact: true })}</span>
      </div>
    </div>
  );
}
