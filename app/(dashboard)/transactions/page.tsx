import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard-header";
import { TransactionTable } from "@/components/transaction-table";
import { SpendingVelocity } from "@/components/spending-velocity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { plaidItem: { userId: session.user.id } },
    include: { plaidItem: true },
  });

  const bankAccountIds = bankAccounts.map((a) => a.id);

  const transactions = await prisma.transaction.findMany({
    where: { bankAccountId: { in: bankAccountIds } },
    orderBy: { date: "desc" },
    take: 500,
    include: { bankAccount: true },
  });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const last30 = transactions.filter(
    (t) => new Date(t.date) >= thirtyDaysAgo && t.amount > 0
  );
  const prev30 = transactions.filter(
    (t) =>
      new Date(t.date) >= sixtyDaysAgo &&
      new Date(t.date) < thirtyDaysAgo &&
      t.amount > 0
  );

  const last30Total = last30.reduce((s, t) => s + Math.abs(t.amount), 0);
  const prev30Total = prev30.reduce((s, t) => s + Math.abs(t.amount), 0);

  const serialized = transactions.map((t) => ({
    id: t.id,
    date: t.date.toISOString(),
    name: t.name,
    merchantName: t.merchantName,
    amount: t.amount,
    categoryPrimary: t.categoryPrimary,
    categoryDetailed: t.categoryDetailed,
    categoryOverride: t.categoryOverride,
    pending: t.pending,
    accountName: t.bankAccount.name,
    accountType: t.bankAccount.type,
  }));

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Transactions"
        description="Search, filter, and categorize your financial data"
      />

      <div className="p-8 space-y-6">
        {/* Spending Velocity */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day Spending Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingVelocity
              last30={last30Total}
              prev30={prev30Total}
              last30Count={last30.length}
              prev30Count={prev30.length}
            />
          </CardContent>
        </Card>

        {/* Transaction Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={serialized} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
