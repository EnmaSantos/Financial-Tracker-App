import { prisma } from "@ledger/db";
import { requireUser } from "@/lib/auth";
import { fmt$ } from "@/lib/money";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";
import { TransactionImportForm } from "@/components/transactions/TransactionImportForm";

export default async function TransactionsPage() {
  const user = await requireUser();
  const [accounts, transactions, presets] = await Promise.all([
    prisma.account.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, institution: true },
      orderBy: [{ institution: "asc" }, { name: "asc" }],
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        account: {
          select: { name: true, institution: true },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 80,
    }),
    prisma.transactionImportPreset.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        mappingDate: true,
        mappingMerchant: true,
        mappingAmount: true,
        mappingCategory: true,
        mappingAccount: true,
        mappingTransactionId: true,
        mappingBalance: true,
        fallbackAccountId: true,
      },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <header className="masthead-row">
        <div>
          <div className="label-kicker">Transactions</div>
          <h1
            className="display mt-1"
            style={{ fontSize: "clamp(40px, 5vw, 56px)" }}
          >
            Capture transactions as they happen.
          </h1>
          <p className="mt-2 max-w-2xl font-sans text-[14px] leading-7 text-ink-2">
            Add individual entries by hand, or upload a CSV from your bank or card provider
            when you want to backfill history in one shot. New transactions now have to be
            linked to an account so balances can stay in sync.
          </p>
        </div>
      </header>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-[24px] border border-rule bg-paper-2 p-6 shadow-[var(--shadow-1)]">
          <div className="mb-5">
            <div className="label-kicker mb-2">Manual entry</div>
            <h2 className="display text-[28px] leading-none">Add one by hand</h2>
          </div>
          <AddTransactionForm accounts={accounts} />
        </div>

        <div className="rounded-[24px] border border-rule bg-paper-2 p-6 shadow-[var(--shadow-1)]">
          <div className="mb-5">
            <div className="label-kicker mb-2">Import CSV</div>
            <h2 className="display text-[28px] leading-none">Upload transactions</h2>
          </div>
          <TransactionImportForm accounts={accounts} presets={presets} />
        </div>
      </section>

      <section className="rounded-[24px] border border-rule bg-paper-2 p-6 shadow-[var(--shadow-1)]">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-rule pb-4">
          <div>
            <div className="label-kicker mb-2">Recent activity</div>
            <h2 className="display text-[28px] leading-none">Latest transactions</h2>
          </div>
          <div className="font-sans text-[12px] text-ink-3">{transactions.length} shown</div>
        </div>

        {transactions.length === 0 ? (
          <p className="font-sans text-[13px] leading-6 text-ink-3">
            No transactions yet. Add one manually or upload a CSV to start building your
            history here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 font-sans text-[13px]">
              <thead>
                <tr className="text-left text-ink-3">
                  <th className="pb-2 pr-4 font-normal">Date</th>
                  <th className="pb-2 pr-4 font-normal">Merchant</th>
                  <th className="pb-2 pr-4 font-normal">Category</th>
                  <th className="pb-2 pr-4 font-normal">Account</th>
                  <th className="pb-2 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="align-top">
                    <td className="whitespace-nowrap py-2 pr-4 text-ink-2">
                      {transaction.date}
                    </td>
                    <td className="py-2 pr-4 text-ink">{transaction.merchant}</td>
                    <td className="py-2 pr-4 capitalize text-ink-2">
                      {transaction.category.replace(/_/g, " ")}
                    </td>
                    <td className="py-2 pr-4 text-ink-2">
                      {transaction.account
                        ? `${transaction.account.institution} · ${transaction.account.name}`
                        : "Unassigned"}
                    </td>
                    <td
                      className={[
                        "py-2 text-right font-mono",
                        transaction.amount < 0 ? "text-ink" : "text-positive",
                      ].join(" ")}
                    >
                      {fmt$(transaction.amount, { signed: transaction.amount > 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
