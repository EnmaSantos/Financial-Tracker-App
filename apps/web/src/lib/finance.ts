/**
 * Pure financial math — no DOM, no Prisma, no React. Safe in RSC and client.
 *
 * Money convention: cash/investment are positive; debts are negative balances.
 * APR is an annual percentage (e.g. 22.99 means 22.99%).
 */

export type DebtInput = {
  id: string;
  name: string;
  /** Stored negative in DB; this function treats `Math.abs(balance)` as the owed amount. */
  balance: number;
  /** Annual percentage rate (e.g. 22.99). */
  apr: number | null;
  /** Minimum monthly payment. */
  monthly: number | null;
};

export type PayoffStrategy = "avalanche" | "snowball";

export type PayoffMonth = {
  month: number;
  /** Total paid this month across all debts. */
  paid: number;
  /** Interest accrued this month across all debts. */
  interest: number;
  /** Total remaining principal across all debts at end of month. */
  remaining: number;
  /** Id of the debt that was fully retired this month, if any. */
  retired?: string;
};

export type PayoffResult = {
  strategy: PayoffStrategy;
  /** Months to debt-free (0 if no debt). */
  months: number;
  totalPaid: number;
  totalInterest: number;
  schedule: PayoffMonth[];
  /** Per-debt payoff month index (0-based). */
  perDebt: { id: string; name: string; paidOffMonth: number; interest: number }[];
};

const MAX_MONTHS = 600; // 50yr runaway guard

/**
 * Simulate debt payoff under the given strategy.
 *
 * - Avalanche: extra flows to the highest-APR debt first (mathematically optimal).
 * - Snowball: extra flows to the smallest balance first (psychological wins).
 *
 * Each month: accrue interest, pay minimums on every debt, apply any extra
 * (plus the freed-up minimums from already-retired debts — "debt stacking")
 * to the strategy's current target debt.
 */
export function simulatePayoff(
  debts: DebtInput[],
  extraMonthly: number,
  strategy: PayoffStrategy = "avalanche",
): PayoffResult {
  // Working copy: balances as positive owed amounts.
  const working = debts
    .filter((d) => Math.abs(d.balance) > 0.005)
    .map((d) => ({
      id: d.id,
      name: d.name,
      balance: Math.abs(d.balance),
      apr: d.apr ?? 0,
      monthly: Math.max(0, d.monthly ?? 0),
      interest: 0,
      paidOffMonth: -1,
    }));

  const schedule: PayoffMonth[] = [];
  let month = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  const isActive = (d: (typeof working)[number]) => d.balance > 0.005;

  function pickTarget(): number {
    const actives = working
      .map((d, i) => ({ d, i }))
      .filter(({ d }) => isActive(d));
    if (actives.length === 0) return -1;
    if (strategy === "avalanche") {
      actives.sort((a, b) => b.d.apr - a.d.apr || b.d.balance - a.d.balance);
    } else {
      actives.sort((a, b) => a.d.balance - b.d.balance || b.d.apr - a.d.apr);
    }
    return actives[0]!.i;
  }

  while (working.some(isActive) && month < MAX_MONTHS) {
    month++;
    let paidThisMonth = 0;
    let interestThisMonth = 0;
    let retired: string | undefined;

    // 1. Accrue interest on active debts.
    for (const d of working) {
      if (!isActive(d)) continue;
      const monthlyRate = d.apr / 100 / 12;
      const interest = d.balance * monthlyRate;
      d.balance += interest;
      d.interest += interest;
      interestThisMonth += interest;
    }

    // 2. Available cash = extra + every minimum. Retired debts' minimums
    //    cascade into extra (debt stacking).
    let pool =
      extraMonthly + working.reduce((sum, d) => sum + d.monthly, 0);

    // 3. Pay minimums on every still-active debt first (or what's left if
    //    balance < minimum).
    for (const d of working) {
      if (!isActive(d)) continue;
      const pay = Math.min(d.monthly, d.balance, pool);
      d.balance -= pay;
      pool -= pay;
      paidThisMonth += pay;
      if (!isActive(d) && d.paidOffMonth < 0) {
        d.paidOffMonth = month;
        retired = d.id;
      }
    }

    // 4. Dump remaining pool onto the strategy target, cascading as debts die.
    while (pool > 0.005) {
      const idx = pickTarget();
      if (idx < 0) break;
      const d = working[idx]!;
      const pay = Math.min(d.balance, pool);
      d.balance -= pay;
      pool -= pay;
      paidThisMonth += pay;
      if (!isActive(d) && d.paidOffMonth < 0) {
        d.paidOffMonth = month;
        retired = d.id;
      }
    }

    totalPaid += paidThisMonth;
    totalInterest += interestThisMonth;
    const remaining = working.reduce((sum, d) => sum + d.balance, 0);
    schedule.push({
      month,
      paid: paidThisMonth,
      interest: interestThisMonth,
      remaining,
      retired,
    });
  }

  return {
    strategy,
    months: month,
    totalPaid,
    totalInterest,
    schedule,
    perDebt: working.map((d) => ({
      id: d.id,
      name: d.name,
      paidOffMonth: d.paidOffMonth,
      interest: d.interest,
    })),
  };
}

/* -------------------- Net-worth projection -------------------- */

export type ProjectionPoint = { year: number; value: number };

/**
 * Deterministic compound-growth curve. `monthlyContribution` is added at the
 * end of each year (12× per year). `scenarioOffset` is a small linear nudge
 * that lets us draw a "what-if" divergence without recomputing growth.
 */
export function makeProjection(
  start: number,
  startYear: number,
  monthlyContribution: number,
  returnRate: number, // as decimal (0.065 for 6.5%)
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

/**
 * Scenario inputs → two projection curves (base = today's trajectory,
 * adjusted = with the what-if levers applied). Mirrors the mockup's
 * API-side math so the UI behaves the same way.
 */
export function makeScenario({
  startingNetWorth,
  baseMonthlyContribution,
  extraSavings,
  jobChange,
  bigExpense,
  baseReturnRate,
  scenarioReturnRate,
  years,
  startYear,
}: {
  startingNetWorth: number;
  baseMonthlyContribution: number;
  extraSavings: number;
  jobChange: number;
  bigExpense: number;
  baseReturnRate: number; // decimal
  scenarioReturnRate: number; // decimal
  years: number;
  startYear: number;
}) {
  const base = makeProjection(
    startingNetWorth,
    startYear,
    baseMonthlyContribution,
    baseReturnRate,
    years,
  );
  const adjustedStart = startingNetWorth - bigExpense;
  const adjustedContribution =
    baseMonthlyContribution + extraSavings + jobChange;
  const adjusted = makeProjection(
    adjustedStart,
    startYear,
    adjustedContribution,
    scenarioReturnRate,
    years,
  );
  return { base, adjusted };
}
