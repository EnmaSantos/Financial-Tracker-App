import type { Account, Goal } from "@ledger/db";
import { fmt$ } from "@/lib/money";

type Reminder = {
  kind: "promo" | "high-apr" | "goal-offtrack";
  title: string;
  detail: string;
  meta?: string;
};

/**
 * Derive actionable reminders from user data. Promo reminders are surfaced
 * for any debt with a `promoEndsAt` in the next 120 days (or recently past,
 * so the user doesn't miss a just-expired window).
 */
function buildReminders(accounts: Account[], goals: Goal[]): Reminder[] {
  const out: Reminder[] = [];
  const now = Date.now();
  const WINDOW_MS = 120 * 24 * 60 * 60 * 1000;

  const promoAccts = accounts.filter(
    (a) =>
      a.type === "debt" &&
      a.promoEndsAt &&
      a.promoEndsAt.getTime() - now < WINDOW_MS,
  );
  for (const acct of promoAccts) {
    const end = acct.promoEndsAt!;
    const daysOut = Math.round((end.getTime() - now) / (24 * 60 * 60 * 1000));
    const when = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const lead =
      daysOut < 0
        ? `ended ${Math.abs(daysOut)}d ago`
        : daysOut === 0
          ? "ends today"
          : `in ${daysOut}d`;
    out.push({
      kind: "promo",
      title: `${acct.name} promo ends ${when}`,
      detail: `${fmt$(Math.abs(acct.balance))} balance · ${acct.apr?.toFixed(1) ?? "—"}% APR after · ${lead}`,
      meta: "PROMO",
    });
  }

  // Highest-APR active debt above 20% — a gentle prompt to prioritize.
  const worstDebt = accounts
    .filter((a) => a.type === "debt" && (a.apr ?? 0) >= 20)
    .sort((a, b) => (b.apr ?? 0) - (a.apr ?? 0))[0];
  const promoIds = new Set(promoAccts.map((a) => a.id));
  if (worstDebt && !promoIds.has(worstDebt.id)) {
    out.push({
      kind: "high-apr",
      title: `${worstDebt.name} is expensive`,
      detail: `${worstDebt.apr?.toFixed(2)}% APR on ${fmt$(Math.abs(worstDebt.balance))} — prioritize in your plan`,
      meta: "HIGH APR",
    });
  }

  for (const g of goals) {
    if (!g.onTrack) {
      out.push({
        kind: "goal-offtrack",
        title: `${g.name} is drifting`,
        detail: `Projected ${g.projected} · target ${g.eta}`,
        meta: "GOAL",
      });
    }
  }

  return out;
}

export function RemindersPanel({
  accounts,
  goals,
}: {
  accounts: Account[];
  goals: Goal[];
}) {
  const reminders = buildReminders(accounts, goals);
  if (reminders.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-rule">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="label-kicker mb-2">Attention</div>
          <h2 className="display" style={{ fontSize: 28 }}>
            Worth a look
          </h2>
        </div>
        <span className="font-sans text-[12px] text-ink-3">
          {reminders.length} item{reminders.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="flex flex-col divide-y divide-rule">
        {reminders.map((r, i) => (
          <li
            key={`${r.kind}-${i}`}
            className="flex items-start justify-between gap-4 py-4"
          >
            <div className="flex flex-col min-w-0">
              <span className="font-serif-text text-[16px]">{r.title}</span>
              <span className="font-sans text-[12px] text-ink-3 mt-0.5">
                {r.detail}
              </span>
            </div>
            {r.meta && (
              <span
                className="font-mono text-[10px] uppercase tracking-wider font-medium shrink-0"
                style={{ color: "var(--color-accent-ink)" }}
              >
                {r.meta}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
