import type { Account } from "@ledger/db";
import { fmt$ } from "@/lib/money";

type Props = {
  assets: Account[];
  debts: Account[];
};

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-5 pb-4 border-b border-rule">
      <div className="flex-1">
        <div className="label-kicker mb-2">{kicker}</div>
        <div className="display text-[32px] leading-none">{title}</div>
      </div>
    </div>
  );
}

function AssetRow({ a }: { a: Account }) {
  return (
    <div className="flex justify-between items-baseline">
      <div className="flex flex-col">
        <span className="font-serif-text text-[16px]">{a.name}</span>
        <span className="text-[11px] text-ink-3 font-sans">{a.institution}</span>
      </div>
      <div className="num text-[16px]">{fmt$(a.balance)}</div>
    </div>
  );
}

/**
 * The Best Buy line carries a promo-expiration warning. Flagged by name for
 * now — a structured `promoEndsAt` column on Account is a future improvement.
 */
function isPromoAccount(a: Account) {
  return a.name.toLowerCase().includes("best buy");
}

function DebtRow({ a }: { a: Account }) {
  const promo = isPromoAccount(a);
  return (
    <div className="flex justify-between items-baseline">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-serif-text text-[16px]">{a.name}</span>
          {promo && (
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--color-chart-3)" }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink-3 font-sans">
            {a.institution}
          </span>
          {promo && (
            <span
              className="font-mono text-[10px] font-medium"
              style={{ color: "var(--color-chart-3)" }}
            >
              PROMO ENDS MAR 12
            </span>
          )}
        </div>
      </div>
      <div className="num text-[16px]">{fmt$(a.balance)}</div>
    </div>
  );
}

export function AccountLists({ assets, debts }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-8 border-t border-rule">
      <section aria-labelledby="assets-head">
        <SectionHead kicker="Assets" title="Liquid & Invested" />
        <div className="flex flex-col gap-3">
          {assets.map((a) => (
            <AssetRow key={a.id} a={a} />
          ))}
        </div>
      </section>
      <section aria-labelledby="debts-head">
        <SectionHead kicker="Debts" title="Liabilities" />
        <div className="flex flex-col gap-3">
          {debts.map((a) => (
            <DebtRow key={a.id} a={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
