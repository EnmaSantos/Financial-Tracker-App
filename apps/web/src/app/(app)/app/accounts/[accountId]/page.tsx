import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAccountDetail } from "@/lib/accounts";
import { fmt$ } from "@/lib/money";
import { AccountBalanceHistory } from "@/components/accounts/AccountBalanceHistory";
import { BalanceEditor } from "@/components/accounts/BalanceEditor";
import { DeleteAccountButton } from "@/components/accounts/DeleteAccountButton";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const user = await requireUser();
  const { accountId } = await params;
  const detail = await getAccountDetail(user.id, accountId);

  if (!detail) {
    notFound();
  }

  const { account, history, transactions } = detail;
  const isDebt = account.type === "debt";

  return (
    <div className="flex flex-col gap-10">
      <header className="masthead-row">
        <div>
          <div className="label-kicker">Account detail</div>
          <h1
            className="display mt-1"
            style={{ fontSize: "clamp(40px, 5vw, 56px)" }}
          >
            {account.name}
          </h1>
          <p className="mt-2 max-w-2xl font-sans text-[14px] leading-7 text-ink-2">
            {account.institution} · {account.type}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/app/accounts" className="btn btn-ghost">
            ← Back to accounts
          </Link>
          <DeleteAccountButton accountId={account.id} />
        </div>
      </header>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <AccountBalanceHistory history={history} />

        <div className="rounded-[24px] border border-rule bg-paper-2 p-6 shadow-[var(--shadow-1)]">
          <div className="mb-5">
            <div className="label-kicker mb-2">Current snapshot</div>
            <h2 className="display text-[28px] leading-none">Account info</h2>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <div className="label-mono mb-2">Current balance</div>
              <BalanceEditor
                accountId={account.id}
                balance={account.balance}
                isDebt={isDebt}
              />
            </div>

            <InfoRow label="Institution" value={account.institution} />
            <InfoRow label="Type" value={account.type} />
            <InfoRow label="Updated" value={account.updated} />

            {account.apr != null ? (
              <InfoRow label="APR" value={`${account.apr.toFixed(2)}%`} />
            ) : null}

            {account.monthly != null ? (
              <InfoRow label="Monthly payment" value={fmt$(account.monthly)} />
            ) : null}

            {account.promoEndsAt ? (
              <InfoRow
                label="Promo ends"
                value={account.promoEndsAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            ) : null}

            <InfoRow
              label="Transactions tracked"
              value={String(transactions.length)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-rule bg-paper-2 p-6 shadow-[var(--shadow-1)]">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-rule pb-4">
          <div>
            <div className="label-kicker mb-2">Activity</div>
            <h2 className="display text-[28px] leading-none">Recent transactions</h2>
          </div>
          <div className="font-sans text-[12px] text-ink-3">{transactions.length} shown</div>
        </div>

        {transactions.length === 0 ? (
          <p className="font-sans text-[13px] leading-6 text-ink-3">
            No transactions are attached to this account yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 font-sans text-[13px]">
              <thead>
                <tr className="text-left text-ink-3">
                  <th className="pb-2 pr-4 font-normal">Date</th>
                  <th className="pb-2 pr-4 font-normal">Merchant</th>
                  <th className="pb-2 pr-4 font-normal">Category</th>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-rule pb-3">
      <div className="label-mono">{label}</div>
      <div className="text-right font-sans text-[14px] text-ink">{value}</div>
    </div>
  );
}
