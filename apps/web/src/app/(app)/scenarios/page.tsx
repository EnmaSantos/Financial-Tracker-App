import { getDashboard } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth";
import { ScenarioExplorer } from "@/components/scenarios/ScenarioExplorer";

export default async function ScenariosPage() {
  const user = await requireUser();
  const d = await getDashboard(user.id);
  if (!d) {
    return (
      <div>
        <h1 className="display text-4xl mb-4">Scenarios</h1>
        <p className="text-ink-2">Add some accounts first to project your future net worth.</p>
      </div>
    );
  }

  const startYear = new Date().getFullYear();

  return (
    <>
      <header className="masthead-row">
        <div>
          <div className="label-kicker">Scenarios</div>
          <h1
            className="display mt-1"
            style={{ fontSize: "clamp(40px, 5vw, 56px)" }}
          >
            Let&rsquo;s play with time.
          </h1>
          <p className="font-serif-text italic text-[14px] text-ink-2 mt-2">
            Slide the dials — the dashed ghost line is your current path.
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
