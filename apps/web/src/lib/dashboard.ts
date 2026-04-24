import { prisma } from "@ledger/db";

type HistoryPoint = {
  date: string;
  value: number;
};

function buildNetWorthHistory({
  currentNetWorth,
  transactions,
}: {
  currentNetWorth: number;
  transactions: Array<{ date: string; amount: number }>;
}): HistoryPoint[] {
  const today = new Date().toISOString().slice(0, 10);

  if (transactions.length === 0) {
    return [{ date: today, value: Math.round(currentNetWorth) }];
  }

  const totalsByDate = new Map<string, number>();

  for (const transaction of transactions) {
    totalsByDate.set(
      transaction.date,
      (totalsByDate.get(transaction.date) ?? 0) + transaction.amount,
    );
  }

  const datesDesc = Array.from(totalsByDate.keys()).sort((a, b) => b.localeCompare(a));
  const pointsDesc: HistoryPoint[] = [];
  let runningNetWorth = currentNetWorth;

  if (datesDesc[0] !== today) {
    pointsDesc.push({
      date: today,
      value: Math.round(runningNetWorth),
    });
  }

  for (const date of datesDesc) {
    pointsDesc.push({
      date,
      value: Math.round(runningNetWorth),
    });
    runningNetWorth -= totalsByDate.get(date) ?? 0;
  }

  return pointsDesc.reverse();
}

/**
 * Server-side dashboard summary — joins the user with their accounts and
 * derives the aggregate totals that the editorial dashboard renders.
 */
export async function getDashboard(userId: string) {
  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        goals: true,
        milestones: { orderBy: { year: "asc" } },
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        accountId: {
          not: null,
        },
      },
      select: {
        date: true,
        amount: true,
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
  ]);
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
  const netWorthHistory = buildNetWorthHistory({
    currentNetWorth: netWorth,
    transactions,
  });

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
    netWorthHistory,
    monthlyIn,
    monthlyOut,
    monthlySaved,
    savingsRate,
  };
}

export type Dashboard = NonNullable<Awaited<ReturnType<typeof getDashboard>>>;
