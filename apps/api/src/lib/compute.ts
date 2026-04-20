import type { Account, Goal, Milestone, ProjectionPoint } from "@ledger/shared";

/**
 * Port of the design's `makeProjection()` — deterministic compound-growth curve
 * driven by a starting net-worth, a monthly contribution and an annual return.
 * A scenarioOffset adds a linear bump so the "adjusted" curve can drift off the
 * base line without recomputing growth.
 */
export function makeProjection(
  start: number,
  startYear: number,
  monthlyContribution: number,
  returnRate: number,
  years: number,
  scenarioOffset = 0,
): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  let v = start;
  for (let i = 0; i <= years; i++) {
    points.push({
      year: startYear + i,
      value: Math.round(v + scenarioOffset * i * 1000),
    });
    v = v * (1 + returnRate) + monthlyContribution * 12;
  }
  return points;
}

/** Sum of positive-balance accounts by type. */
export function totals(accounts: Pick<Account, "type" | "balance">[]) {
  let cash = 0;
  let invest = 0;
  let debt = 0;
  for (const a of accounts) {
    if (a.type === "cash") cash += a.balance;
    else if (a.type === "investment") invest += a.balance;
    else if (a.type === "debt") debt += a.balance; // negative values
  }
  return { cash, invest, debt };
}

export function netWorth(accounts: Pick<Account, "type" | "balance">[]) {
  const t = totals(accounts);
  return t.cash + t.invest + t.debt;
}

/** Savings rate = (net income − monthly expenses) / net income. */
export function savingsRate(incomeNet: number, expensesMonthly: number) {
  if (incomeNet <= 0) return 0;
  return Math.max(0, (incomeNet - expensesMonthly) / incomeNet);
}

/** Produce a 12-month NW history around `current` that trends up by `trend`. */
export function syntheticNwHistory(current: number, trend: number): ProjectionPoint[] {
  // Design uses a 12-month fake trail for the sparkline; we synthesize one
  // deterministically rather than aggregating snapshots we don't yet store.
  const out: ProjectionPoint[] = [];
  const base = current - trend;
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    // smooth easing + small deterministic ripple
    const eased = base + trend * (t * t * (3 - 2 * t));
    const ripple = Math.sin(i * 1.7) * trend * 0.04;
    out.push({ year: 2025 * 12 + i, value: Math.round(eased + ripple) });
  }
  return out;
}

export type { Account, Goal, Milestone, ProjectionPoint };
