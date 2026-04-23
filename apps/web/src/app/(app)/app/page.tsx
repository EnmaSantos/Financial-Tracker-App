import { requireUser } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export default async function AppHomePage() {
  const user = await requireUser();
  const dashboard = await getDashboard(user.id);

  if (!dashboard) {
    return (
      <div>
        <div className="label-kicker mb-2">Nothing here yet</div>
        <h1 className="display mb-4 text-4xl">Equitas Financial</h1>
        <p className="text-ink-2">
          Add your first account and this space will start to reflect your real numbers.
        </p>
      </div>
    );
  }

  return <DashboardOverview dashboard={dashboard} />;
}
