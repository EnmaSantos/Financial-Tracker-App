import { getDashboard } from "@/lib/dashboard";
import { Masthead } from "@/components/dashboard/Masthead";
import { NetWorthHero } from "@/components/dashboard/NetWorthHero";
import { FlowStrip } from "@/components/dashboard/FlowStrip";
import { Allocation } from "@/components/dashboard/Allocation";
import { AccountLists } from "@/components/dashboard/AccountLists";
import { ProjectionPreview } from "@/components/dashboard/ProjectionPreview";
import { RemindersPanel } from "@/components/dashboard/RemindersPanel";

// TODO(Phase 5): resolve userId from session instead of the hardcoded persona.
const CURRENT_USER_ID = "maya";

export default async function Home() {
  const d = await getDashboard(CURRENT_USER_ID);

  if (!d) {
    return (
      <div>
        <div className="label-kicker mb-2">No ledger yet</div>
        <h1 className="display text-4xl mb-4">Equitas Financial</h1>
        <p className="text-ink-2">
          User not found. Run <code className="font-mono">pnpm db:seed</code>.
        </p>
      </div>
    );
  }

  const asOf = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startYear = new Date().getFullYear();

  return (
    <>
      <Masthead
        name={d.user.name}
        asOf={asOf}
        joinedYear={d.user.joinedYear}
      />

      <div className="lead-grid mt-8">
        <div>
          <NetWorthHero
            netWorth={d.netWorth}
            monthlySaved={d.monthlySaved}
            savingsRate={d.savingsRate}
          />
          <FlowStrip
            monthlyIn={d.monthlyIn}
            monthlyOut={d.monthlyOut}
            monthlySaved={d.monthlySaved}
          />
          <Allocation cash={d.cash} invest={d.invest} debt={d.debt} />
        </div>
        <ProjectionPreview
          startingNetWorth={d.netWorth}
          monthlyContribution={d.monthlySaved}
          returnRate={d.user.returnRate}
          startYear={startYear}
        />
      </div>

      <AccountLists assets={d.assets} debts={d.debts} />

      <RemindersPanel accounts={d.accounts} goals={d.goals} />
    </>
  );
}
