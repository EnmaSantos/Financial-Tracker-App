import { getDashboard } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth";
import { ScenarioExplorer } from "@/components/scenarios/ScenarioExplorer";

export default async function ScenariosPage() {
  const user = await requireUser();
  const d = await getDashboard(user.id);
  if (!d) {
    return (
      <div>
        <h1 className="mb-4 display text-4xl">What ifs</h1>
        <p className="text-ink-2">Add a few accounts first and you can start exploring changes.</p>
      </div>
    );
  }

  const startYear = new Date().getFullYear();

  return (
    <>
      <header className="masthead-row">
        <div>
          <div className="label-kicker">What ifs</div>
          <h1
            className="display mt-1"
            style={{ fontSize: "clamp(40px, 5vw, 56px)" }}
          >
            Try a few changes.
          </h1>
          <p className="mt-2 font-serif-text text-[14px] italic text-ink-2">
            Move the sliders and compare your current path with a new one.
          </p>
        </div>
      </header>

      <section className="mt-10">
        <ScenarioExplorer
          startingNetWorth={d.netWorth}
          baselineMonthlyContribution={d.monthlySaved}
          baselineReturnRate={d.user.returnRate}
          startYear={startYear}
          years={30}
        />
      </section>
    </>
  );
}
