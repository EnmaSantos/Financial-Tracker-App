import { prisma } from "@ledger/db";
import { buildBalanceHistory, type BalanceHistoryPoint } from "@/lib/accounts";

function buildNetWorthHistory({
  accounts,
  transactionsByAccount,
}: {
  accounts: Array<{ id: string; balance: number }>;
  transactionsByAccount: Map<
    string,
    Array<{ date: string; amount: number; balanceAfter: number | null }>
  >;
}) {
  const accountHistories = accounts.map((account) => ({
    accountId: account.id,
    points: buildBalanceHistory({
      currentBalance: account.balance,
      transactions: transactionsByAccount.get(account.id) ?? [],
    }),
  }));

  const allDates = Array.from(
    new Set(
      accountHistories.flatMap((history) => history.points.map((point) => point.date)),
    ),
  ).sort((left, right) => left.localeCompare(right));

  if (allDates.length === 0) {
    return [
      {
        date: new Date().toISOString().slice(0, 10),
        value: Math.round(accounts.reduce((sum, account) => sum + account.balance, 0)),
      },
    ];
  }

  const byAccount = new Map<
    string,
    {
      currentIndex: number;
      points: BalanceHistoryPoint[];
      currentValue: number;
    }
  >();

  for (const history of accountHistories) {
    const firstPoint = history.points[0];
    byAccount.set(history.accountId, {
      currentIndex: 0,
      points: history.points,
      currentValue: firstPoint?.value ?? 0,
    });
  }

  return allDates.map((date) => {
    let total = 0;

    for (const state of byAccount.values()) {
      while (
        state.currentIndex + 1 < state.points.length &&
        state.points[state.currentIndex + 1]!.date <= date
      ) {
        state.currentIndex += 1;
        state.currentValue = state.points[state.currentIndex]!.value;
      }

      total += state.currentValue;
    }

    return {
      date,
      value: Math.round(total),
    };
  });
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
    prisma.transaction
      .findMany({
        where: {
          userId,
          accountId: {
            not: null,
          },
        },
        select: {
          accountId: true,
          date: true,
          amount: true,
          balanceAfter: true,
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      })
      .catch(async () =>
        prisma.transaction.findMany({
          where: {
            userId,
            accountId: {
              not: null,
            },
          },
          select: {
            accountId: true,
            date: true,
            amount: true,
          },
          orderBy: [{ date: "asc" }, { createdAt: "asc" }],
        }),
      ),
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
  const transactionsByAccount = new Map<
    string,
    Array<{ date: string; amount: number; balanceAfter: number | null }>
  >();

  for (const transaction of transactions) {
    if (!transaction.accountId) continue;
    const list = transactionsByAccount.get(transaction.accountId) ?? [];
    list.push({
      date: transaction.date,
      amount: transaction.amount,
      balanceAfter:
        "balanceAfter" in transaction ? transaction.balanceAfter ?? null : null,
    });
    transactionsByAccount.set(transaction.accountId, list);
  }

  const netWorthHistory = buildNetWorthHistory({
    accounts: accounts.map((account) => ({
      id: account.id,
      balance: account.balance,
    })),
    transactionsByAccount,
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
