import { getDashboard } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth";
import type { DebtInput } from "@/lib/finance";
import { PayoffPlanner } from "@/components/debt/PayoffPlanner";

export default async function DebtPage() {
  const user = await requireUser();
  const d = await getDashboard(user.id);
  if (!d) {
    return (
      <div>
        <h1 className="display text-4xl mb-4">Debt</h1>
        <p className="text-ink-2">No debt accounts yet. Add one from the Accounts page.</p>
      </div>
    );
  }

  const debts: DebtInput[] = d.debts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    balance: acc.balance,
    apr: acc.apr,
    monthly: acc.monthly,
  }));

  return (
    <>
      <header className="masthead-row">
        <div>
          <div className="label-kicker">Debt</div>
          <h1
            className="display mt-1"
            style={{ fontSize: "clamp(40px, 5vw, 56px)" }}
          >
            Paid off, on a timeline.
          </h1>
        </div>
      </header>

      <section className="mt-10">
        <PayoffPlanner debts={debts} />
      </section>
    </>
  );
}
