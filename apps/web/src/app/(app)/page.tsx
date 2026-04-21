import { getDashboard } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth";
import { Masthead } from "@/components/dashboard/Masthead";
import { NetWorthHero } from "@/components/dashboard/NetWorthHero";
import { FlowStrip } from "@/components/dashboard/FlowStrip";
import { Allocation } from "@/components/dashboard/Allocation";
import { AccountLists } from "@/components/dashboard/AccountLists";
import { ProjectionPreview } from "@/components/dashboard/ProjectionPreview";
import { RemindersPanel } from "@/components/dashboard/RemindersPanel";

export default async function Home() {
  const user = await requireUser();
  const d = await getDashboard(user.id);

  if (!d) {
    // Session points at a user id but the ledger row was cleared — show an
    // empty-state hint instead of crashing.
    return (
      <div>
        <div className="label-kicker mb-2">No ledger yet</div>
        <h1 className="display text-4xl mb-4">Equitas Financial</h1>
        <p className="text-ink-2">
          Your account has no data yet. Add your first account from the Accounts page.
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
