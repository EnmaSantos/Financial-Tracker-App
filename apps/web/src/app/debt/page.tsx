import { getDashboard } from "@/lib/dashboard";
import type { DebtInput } from "@/lib/finance";
import { PayoffPlanner } from "@/components/debt/PayoffPlanner";

// TODO(Phase 5): resolve userId from session.
const CURRENT_USER_ID = "maya";

export default async function DebtPage() {
  const d = await getDashboard(CURRENT_USER_ID);
  if (!d) {
    return (
      <div>
        <h1 className="display text-4xl mb-4">Debt</h1>
        <p className="text-ink-2">
          User not found. Run <code className="font-mono">pnpm db:seed</code>.
        </p>
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
