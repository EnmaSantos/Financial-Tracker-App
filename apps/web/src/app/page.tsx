import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";
import { DEMO_PERSONAS } from "@/lib/demo";
import { fmt$ } from "@/lib/money";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/app");

  const demoCards = await Promise.all(
    DEMO_PERSONAS.map(async (persona) => ({
      persona,
      dashboard: await getDashboard(persona.userId),
    })),
  );

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-16">
        <header className="flex flex-col gap-8 rounded-[28px] border border-rule bg-paper-2 px-6 py-6 shadow-[var(--shadow-1)] md:px-10 md:py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="display text-[30px] tracking-[-0.02em]">Equitas</div>
              <div className="label-mono mt-1">private ledger, public examples</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Create account
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="label-kicker">A calmer way to look at money</div>
            <h1 className="display text-[clamp(48px,8vw,92px)] leading-[0.92]">
              Keep your real ledger separate. Explore examples first.
            </h1>
            <p className="max-w-2xl font-sans text-[15px] leading-7 text-ink-2">
              Equitas is for people who want a clear, calm view of their money. Explore a few
              examples first, see what the experience feels like, and create your own account when
              you&apos;re ready to make it personal.
            </p>
          </div>
        </header>

        <section id="demos" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="label-kicker mb-2">Public demos</div>
              <h2 className="display text-[clamp(30px,4vw,52px)]">
                See the app through three different situations.
              </h2>
            </div>
            <p className="max-w-xl font-sans text-[13px] leading-6 text-ink-3">
              Everyone comes to money with a different story. Start with the example that feels
              closest to yours and get a sense of how Equitas could fit into your life.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {demoCards.map(({ persona, dashboard }) => (
              <article
                key={persona.slug}
                className="flex h-full flex-col gap-5 rounded-[24px] border border-rule bg-paper-2 p-6 shadow-[var(--shadow-1)]"
              >
                <div className="flex flex-col gap-2">
                  <div className="label-kicker">{persona.stage}</div>
                  <h3 className="display text-[34px] leading-none">{persona.name}</h3>
                  <p className="font-serif-text text-[16px] italic text-ink-2">
                    {persona.headline}
                  </p>
                </div>

                <p className="font-sans text-[13px] leading-6 text-ink-2">{persona.summary}</p>

                {dashboard ? (
                  <div className="grid grid-cols-3 gap-3 border-y border-rule py-4">
                    <Metric label="Net worth" value={fmt$(dashboard.netWorth, { compact: true })} />
                    <Metric
                      label="Monthly saved"
                      value={fmt$(dashboard.monthlySaved, { signed: true, compact: true })}
                    />
                    <Metric label="Debt" value={fmt$(dashboard.debt, { compact: true })} />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-rule px-4 py-5 font-sans text-[12px] text-ink-3">
                    Demo data is not seeded yet for this persona.
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-4">
                  <p className="font-sans text-[12px] leading-6 text-ink-3">{persona.focus}</p>
                  <Link href={`/demo/${persona.slug}`} className="btn btn-primary w-full justify-center">
                    Explore {persona.name.split(" ")[0]}&rsquo;s demo
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-[28px] border border-rule bg-paper-2 px-6 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-8">
          <div>
            <div className="label-kicker mb-2">When you want your own space</div>
            <h2 className="display text-[clamp(28px,4vw,46px)] leading-none">
              Make it yours.
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-[14px] leading-7 text-ink-2">
              When you&apos;re ready, start with your real accounts, your real goals, and a view
              that fits the way you already think about money.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="btn btn-primary">
              Create account
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="label-mono">{label}</div>
      <div className="num text-[16px] text-ink">{value}</div>
    </div>
  );
}
