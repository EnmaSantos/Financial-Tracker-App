import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { NetWorthChart } from "@/components/net-worth-chart";
import { SpendingSummary } from "@/components/spending-summary";
import {
  Wallet,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default async function OverviewPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { plaidItem: { userId: session.user.id } },
    include: { plaidItem: true },
  });

  const totalNetWorth = bankAccounts.reduce((sum, a) => {
    const bal = a.currentBalance ?? 0;
    if (a.type === "credit" || a.type === "loan") return sum - Math.abs(bal);
    return sum + bal;
  }, 0);

  const totalDebt = bankAccounts
    .filter((a) => a.type === "credit" || a.type === "loan")
    .reduce((sum, a) => sum + Math.abs(a.currentBalance ?? 0), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const bankAccountIds = bankAccounts.map((a) => a.id);

  const [thisMonthTxns, lastMonthTxns, recentTxns, snapshots] =
    await Promise.all([
      prisma.transaction.findMany({
        where: {
          bankAccountId: { in: bankAccountIds },
          date: { gte: startOfMonth },
          amount: { gt: 0 },
          pending: false,
        },
      }),
      prisma.transaction.findMany({
        where: {
          bankAccountId: { in: bankAccountIds },
          date: { gte: startOfLastMonth, lte: endOfLastMonth },
          amount: { gt: 0 },
          pending: false,
        },
      }),
      prisma.transaction.findMany({
        where: { bankAccountId: { in: bankAccountIds } },
        orderBy: { date: "desc" },
        take: 8,
        include: { bankAccount: true },
      }),
      prisma.balanceSnapshot.findMany({
        where: {
          bankAccountId: { in: bankAccountIds },
          snapshotDate: {
            gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { snapshotDate: "asc" },
      }),
    ]);

  const thisMonthSpend = thisMonthTxns.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );
  const lastMonthSpend = lastMonthTxns.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );
  const spendDelta =
    lastMonthSpend > 0
      ? ((thisMonthSpend - lastMonthSpend) / lastMonthSpend) * 100
      : 0;

  // Aggregate snapshots by date for net-worth chart
  const snapshotsByDate = new Map<string, number>();
  for (const s of snapshots) {
    const dateKey = s.snapshotDate.toISOString().split("T")[0];
    snapshotsByDate.set(dateKey, (snapshotsByDate.get(dateKey) ?? 0) + s.balance);
  }
  const chartData = Array.from(snapshotsByDate.entries()).map(
    ([date, balance]) => ({ date, balance })
  );

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Overview"
        description="Your financial health at a glance"
      />

      <div className="p-8 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Net Worth
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                {formatCurrency(totalNetWorth)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Across {bankAccounts.length} accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Spending
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                {formatCurrency(thisMonthSpend)}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {spendDelta > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-danger" />
                    <span className="text-danger">
                      {spendDelta.toFixed(1)}% vs last month
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-success" />
                    <span className="text-success">
                      {Math.abs(spendDelta).toFixed(1)}% vs last month
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Debt
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                {formatCurrency(totalDebt)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Credit & loan balances
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Net Worth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <NetWorthChart data={chartData} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Spending Sanity Check</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingSummary
                thisMonth={thisMonthSpend}
                lastMonth={lastMonthSpend}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTxns.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No transactions yet. Connect a bank account to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {recentTxns.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between rounded-[4px] border border-border px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {txn.merchantName || txn.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(txn.date)} &middot;{" "}
                        {txn.bankAccount.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {txn.categoryPrimary && (
                        <span className="hidden sm:inline-flex rounded-[4px] bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {txn.categoryOverride ??
                            txn.categoryPrimary
                              .replace(/_/g, " ")
                              .toLowerCase()}
                        </span>
                      )}
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          txn.amount > 0 ? "text-danger" : "text-success"
                        }`}
                      >
                        {txn.amount > 0 ? "-" : "+"}
                        {formatCurrency(Math.abs(txn.amount))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
