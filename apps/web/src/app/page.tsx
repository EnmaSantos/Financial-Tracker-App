import { prisma } from "@ledger/db";

export default async function Home() {
  const user = await prisma.user.findUnique({
    where: { id: "maya" },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    return (
      <main className="p-8">
        <h1 className="display text-4xl mb-4">Equitas Financial</h1>
        <p className="text-ink-2">User not found. Please run seed.</p>
      </main>
    );
  }

  const netWorth = user.accounts.reduce((acc, a) => acc + a.balance, 0);

  return (
    <main className="p-12 max-w-4xl">
      <header className="mb-12">
        <div className="label-kicker mb-2">Net Worth</div>
        <h1 className="display hero-number mb-4">
          ${netWorth.toLocaleString()}
        </h1>
        <p className="font-serif-text italic text-ink-2">
          Welcome back, {user.name}.
        </p>
      </header>

      <section>
        <div className="label-kicker mb-6">Accounts</div>
        <div className="space-y-4">
          {user.accounts.map((account) => (
            <div
              key={account.id}
              className="flex justify-between items-baseline border-b border-rule pb-2"
            >
              <div>
                <div className="font-serif-text text-lg">{account.name}</div>
                <div className="text-xs text-ink-3 uppercase tracking-wider">
                  {account.institution}
                </div>
              </div>
              <div className="num text-xl">
                ${account.balance.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
