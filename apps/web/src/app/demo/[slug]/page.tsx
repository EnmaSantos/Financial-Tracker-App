import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { getDashboard } from "@/lib/dashboard";
import { DEMO_PERSONAS, getDemoPersona } from "@/lib/demo";

export async function generateStaticParams() {
  return DEMO_PERSONAS.map((persona) => ({ slug: persona.slug }));
}

export default async function DemoPersonaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const persona = getDemoPersona(slug);
  if (!persona) notFound();

  const dashboard = await getDashboard(persona.userId);
  if (!dashboard) notFound();

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-[28px] border border-rule bg-paper-2 px-6 py-6 shadow-[var(--shadow-1)] md:px-8 md:py-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="label-kicker mb-2">Example · {persona.stage}</div>
              <h1 className="display text-[clamp(34px,6vw,68px)] leading-[0.95]">
                {persona.name}
              </h1>
              <p className="mt-3 font-serif-text text-[18px] italic text-ink-2">
                {persona.headline}
              </p>
              <p className="mt-4 max-w-2xl font-sans text-[14px] leading-7 text-ink-2">
                {persona.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="btn btn-ghost">
                Back to demos
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Create your account
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-rule pt-5">
            {DEMO_PERSONAS.map((candidate) => (
              <Link
                key={candidate.slug}
                href={`/demo/${candidate.slug}`}
                aria-current={candidate.slug === persona.slug ? "page" : undefined}
                className={[
                  "rounded-full border px-4 py-2 font-sans text-[12px] transition-colors",
                  candidate.slug === persona.slug
                    ? "border-ink bg-paper text-ink"
                    : "border-rule bg-paper-2 text-ink-2 hover:border-ink hover:text-ink",
                ].join(" ")}
              >
                {candidate.name}
              </Link>
            ))}
          </div>
        </header>

        <section className="rounded-[28px] border border-rule bg-paper px-6 py-8 shadow-[var(--shadow-1)] md:px-8 md:py-10">
          <div className="mb-6 flex flex-col gap-2 border-b border-rule pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="label-kicker mb-2">A look at one life</div>
              <p className="max-w-2xl font-sans text-[13px] leading-6 text-ink-3">
                These numbers are here to help you picture how Equitas could feel with your own
                money, goals, and pace.
              </p>
            </div>
            <Link
              href="/signup"
              className="font-mono text-[10px] uppercase tracking-wider text-ink-3 hover:text-ink"
            >
              Start your own →
            </Link>
          </div>

          <DashboardOverview
            dashboard={dashboard}
            projectionHref="/signup"
            projectionLabel="Start your own →"
          />
        </section>
      </div>
    </main>
  );
}
