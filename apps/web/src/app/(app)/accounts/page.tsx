import type { Account } from "@ledger/db";
import { getDashboard } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth";
import { fmt$ } from "@/lib/money";
import { BalanceEditor } from "@/components/accounts/BalanceEditor";
import { DeleteAccountButton } from "@/components/accounts/DeleteAccountButton";
import { AddAccountButton } from "@/components/accounts/AddAccountButton";

export default async function AccountsPage() {
  const user = await requireUser();
  const d = await getDashboard(user.id);

  if (!d) {
    return (
      <div>
        <header className="masthead-row">
          <div>
            <div className="label-kicker">Ledger</div>
            <h1 className="display mt-1" style={{ fontSize: "clamp(40px, 5vw, 56px)" }}>
              Accounts
            </h1>
          </div>
          <AddAccountButton />
        </header>
        <p className="mt-10 text-ink-2">No accounts yet. Add your first one above.</p>
      </div>
    );
  }

  const cash = d.accounts.filter((a) => a.type === "cash");
  const investment = d.accounts.filter((a) => a.type === "investment");
  const debt = d.accounts.filter((a) => a.type === "debt");

  return (
    <>
      <header className="masthead-row">
        <div>
          <div className="label-kicker">Ledger</div>
          <h1
            className="display mt-1"
            style={{ fontSize: "clamp(40px, 5vw, 56px)" }}
          >
            Accounts
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-[12px] text-ink-3">
            {d.accounts.length} total · net {fmt$(d.netWorth)}
          </span>
          <AddAccountButton />
        </div>
      </header>

      <div className="mt-10 flex flex-col gap-12">
        <Section
          kicker="Cash"
          title="Liquid accounts"
          subtotal={d.cash}
          accounts={cash}
        />
        <Section
          kicker="Investment"
          title="Growing quietly"
          subtotal={d.invest}
          accounts={investment}
        />
        <Section
          kicker="Debt"
          title="Owed"
          subtotal={d.debt}
          accounts={debt}
        />
      </div>
    </>
  );
}

function Section({
  kicker,
  title,
  subtotal,
  accounts,
}: {
  kicker: string;
  title: string;
  subtotal: number;
  accounts: Account[];
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-6 mb-5 pb-4 border-b border-rule">
        <div>
          <div className="label-kicker mb-2">{kicker}</div>
          <h2 className="display leading-none" style={{ fontSize: 28 }}>
            {title}
          </h2>
        </div>
        <div className="num text-[20px]">{fmt$(subtotal)}</div>
      </div>

      {accounts.length === 0 ? (
        <p className="font-sans text-[13px] text-ink-3">
          No {kicker.toLowerCase()} accounts yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-rule">
          {accounts.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-serif-text text-[16px] truncate">
                  {a.name}
                </span>
                <span className="font-sans text-[11px] text-ink-3">
                  {a.institution}
                  {a.apr != null && (
                    <>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono">
                        {a.apr.toFixed(2)}% APR
                      </span>
                    </>
                  )}
                  <span className="mx-1.5">·</span>
                  <span>updated {a.updated}</span>
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <BalanceEditor
                  accountId={a.id}
                  balance={a.balance}
                  isDebt={a.type === "debt"}
                />
                <DeleteAccountButton accountId={a.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
