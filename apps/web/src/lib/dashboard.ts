import { prisma } from "@ledger/db";

/**
 * Server-side dashboard summary — joins the user with their accounts and
 * derives the aggregate totals that the editorial dashboard renders.
 */
export async function getDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      goals: true,
      milestones: { orderBy: { year: "asc" } },
    },
  });
  if (!user) return null;

  const accounts = user.accounts;
  const cash = accounts
    .filter((a) => a.type === "cash")
    .reduce((sum, a) => sum + a.balance, 0);
  const invest = accounts
    .filter((a) => a.type === "investment")
    .reduce((sum, a) => sum + a.balance, 0);
  // Debt balances are stored negative; keep the sign so `debt` is <= 0.
  const debt = accounts
    .filter((a) => a.type === "debt")
    .reduce((sum, a) => sum + a.balance, 0);

  const netWorth = cash + invest + debt;

  const monthlyOut = Math.abs(user.expensesMonthly);
  const monthlyIn = user.incomeNet;
  const monthlySaved = monthlyIn - monthlyOut;
  const savingsRate = monthlyIn > 0 ? monthlySaved / monthlyIn : 0;

  return {
    user,
    accounts,
    assets: accounts.filter((a) => a.type !== "debt"),
    debts: accounts.filter((a) => a.type === "debt"),
    goals: user.goals,
    milestones: user.milestones,
    cash,
    invest,
    debt,
    netWorth,
    monthlyIn,
    monthlyOut,
    monthlySaved,
    savingsRate,
  };
}

export type Dashboard = NonNullable<Awaited<ReturnType<typeof getDashboard>>>;
