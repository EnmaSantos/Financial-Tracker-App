import { prisma } from "@ledger/db";

type BalanceHistoryPoint = {
  date: string;
  value: number;
};

function buildAccountBalanceHistory({
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

export async function getAccountDetail(userId: string, accountId: string) {
  const [account, transactions] = await Promise.all([
    prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    }),
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
  ]);

  if (!account) return null;

  return {
    account,
    transactions,
    history: buildAccountBalanceHistory({
      currentBalance: account.balance,
      transactions: transactions.map((transaction) => ({
        date: transaction.date,
        amount: transaction.amount,
      })),
    }),
  };
}

export type AccountDetail = NonNullable<Awaited<ReturnType<typeof getAccountDetail>>>;
