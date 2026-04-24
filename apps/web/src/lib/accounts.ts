import { prisma } from "@ledger/db";

export type BalanceHistoryPoint = {
  date: string;
  value: number;
};

type HistoryTransaction = {
  date: string;
  amount: number;
  balanceAfter: number | null;
};

function buildHistoryFromSnapshots({
  currentBalance,
  transactions,
}: {
  currentBalance: number;
  transactions: HistoryTransaction[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const snapshotByDate = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.balanceAfter != null) {
      snapshotByDate.set(transaction.date, transaction.balanceAfter);
    }
  }

  if (snapshotByDate.size === 0) {
    return null;
  }

  const points = Array.from(snapshotByDate.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, value]) => ({
      date,
      value: Math.round(value),
    }));

  const lastPoint = points[points.length - 1] ?? null;
  if (!lastPoint || lastPoint.date !== today || Math.round(lastPoint.value) !== Math.round(currentBalance)) {
    points.push({
      date: today,
      value: Math.round(currentBalance),
    });
  }

  return points;
}

function buildHistoryFromAmounts({
  currentBalance,
  transactions,
}: {
  currentBalance: number;
  transactions: Array<{ date: string; amount: number }>;
}) {
  const today = new Date().toISOString().slice(0, 10);

  if (transactions.length === 0) {
    return [{ date: today, value: Math.round(currentBalance) }];
  }

  const totalsByDate = new Map<string, number>();

  for (const transaction of transactions) {
    totalsByDate.set(
      transaction.date,
      (totalsByDate.get(transaction.date) ?? 0) + transaction.amount,
    );
  }

  const datesDesc = Array.from(totalsByDate.keys()).sort((a, b) => b.localeCompare(a));
  const pointsDesc: BalanceHistoryPoint[] = [];
  let runningBalance = currentBalance;

  if (datesDesc[0] !== today) {
    pointsDesc.push({
      date: today,
      value: Math.round(runningBalance),
    });
  }

  for (const date of datesDesc) {
    pointsDesc.push({
      date,
      value: Math.round(runningBalance),
    });
    runningBalance -= totalsByDate.get(date) ?? 0;
  }

  return pointsDesc.reverse();
}

export function buildBalanceHistory({
  currentBalance,
  transactions,
}: {
  currentBalance: number;
  transactions: HistoryTransaction[];
}) {
  return (
    buildHistoryFromSnapshots({ currentBalance, transactions }) ??
    buildHistoryFromAmounts({
      currentBalance,
      transactions: transactions.map((transaction) => ({
        date: transaction.date,
        amount: transaction.amount,
      })),
    })
  );
}

export async function getAccountDetail(userId: string, accountId: string) {
  const [account, transactions] = await Promise.all([
    prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    }),
    prisma.transaction
      .findMany({
        where: {
          userId,
          accountId,
        },
        select: {
          id: true,
          date: true,
          merchant: true,
          category: true,
          amount: true,
          balanceAfter: true,
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 100,
      })
      .catch(async () =>
        prisma.transaction.findMany({
          where: {
            userId,
            accountId,
          },
          select: {
            id: true,
            date: true,
            merchant: true,
            category: true,
            amount: true,
          },
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          take: 100,
        }),
      ),
  ]);

  if (!account) return null;

  const history = buildBalanceHistory({
    currentBalance: account.balance,
    transactions: transactions.map((transaction) => ({
      date: transaction.date,
      amount: transaction.amount,
      balanceAfter: "balanceAfter" in transaction ? transaction.balanceAfter ?? null : null,
    })),
  });

  return {
    account,
    transactions,
    history,
  };
}

export type AccountDetail = NonNullable<Awaited<ReturnType<typeof getAccountDetail>>>;
