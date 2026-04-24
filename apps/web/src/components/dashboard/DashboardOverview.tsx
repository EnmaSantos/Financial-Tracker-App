import type { Dashboard } from "@/lib/dashboard";
import { Masthead } from "@/components/dashboard/Masthead";
import { NetWorthHero } from "@/components/dashboard/NetWorthHero";
import { FlowStrip } from "@/components/dashboard/FlowStrip";
import { Allocation } from "@/components/dashboard/Allocation";
import { AccountLists } from "@/components/dashboard/AccountLists";
import { NetWorthHistoryPreview } from "@/components/dashboard/NetWorthHistoryPreview";
import { RemindersPanel } from "@/components/dashboard/RemindersPanel";

export function DashboardOverview({
  dashboard,
  projectionHref,
  projectionLabel,
}: {
  dashboard: Dashboard;
  projectionHref?: string;
  projectionLabel?: string;
}) {
  const asOf = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Masthead
        name={dashboard.user.name}
        asOf={asOf}
        joinedYear={dashboard.user.joinedYear}
      />

      <div className="lead-grid mt-8">
        <div>
          <NetWorthHero
            netWorth={dashboard.netWorth}
            monthlySaved={dashboard.monthlySaved}
            savingsRate={dashboard.savingsRate}
          />
          <FlowStrip
            monthlyIn={dashboard.monthlyIn}
            monthlyOut={dashboard.monthlyOut}
            monthlySaved={dashboard.monthlySaved}
          />
          <Allocation
            cash={dashboard.cash}
            invest={dashboard.invest}
            debt={dashboard.debt}
          />
        </div>
        <NetWorthHistoryPreview
          history={dashboard.netWorthHistory}
          href={projectionHref}
          ctaLabel={projectionLabel}
        />
      </div>

      <AccountLists assets={dashboard.assets} debts={dashboard.debts} />

      <RemindersPanel accounts={dashboard.accounts} goals={dashboard.goals} />
    </>
  );
}
