/**
 * Seed — Elena Vargas, the canonical demo account from the design.
 * Numbers mirror `project/src/data.js` in the design bundle.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Wipe everything deterministic-first so `pnpm db:seed` is idempotent.
  await prisma.transaction.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const maya = await prisma.user.create({
    data: {
      id: "maya",
      name: "Maya Chen",
      email: "maya@example.com",
      age: 32,
      retireAge: 65,
      returnRate: 7.0,
      joinedYear: 2023,
      incomeNet: 7850,
      incomeGross: 10500,
      expensesMonthly: 5340,
    },
  });

  // Adding David and Linda for the persona switcher
  await prisma.user.createMany({
    data: [
      {
        id: "david",
        name: "David Park",
        email: "david@example.com",
        age: 28,
        retireAge: 60,
        returnRate: 8.5,
        joinedYear: 2025,
        incomeNet: 5200,
        incomeGross: 7000,
        expensesMonthly: 2800,
      },
      {
        id: "linda",
        name: "Linda Rossi",
        email: "linda@example.com",
        age: 61,
        retireAge: 65,
        returnRate: 5.0,
        joinedYear: 2010,
        incomeNet: 9200,
        incomeGross: 13000,
        expensesMonthly: 4100,
      },
    ],
  });

  await prisma.account.createMany({
    data: [
      { userId: maya.id, id: "m_chk",  name: "Checking",            institution: "Chase",             type: "cash",       balance:   4_200, updated: "2 days ago",  apr: null,  monthly: null, color: "chart-1" },
      { userId: maya.id, id: "m_sav",  name: "Emergency Fund",      institution: "Ally",              type: "cash",       balance:   6_800, updated: "today",       apr: 4.25,  monthly: null, color: "chart-2" },
      { userId: maya.id, id: "m_roth", name: "Roth IRA",            institution: "Vanguard",          type: "investment", balance:  31_200, updated: "2 days ago",  apr: null,  monthly: null, color: "chart-3" },
      { userId: maya.id, id: "m_401k", name: "401(k)",              institution: "Fidelity",          type: "investment", balance:  29_000, updated: "1 week ago",  apr: null,  monthly: null, color: "chart-3" },
      { userId: maya.id, id: "m_cc1",  name: "Chase Sapphire",      institution: "Chase",             type: "debt",       balance:  -8_400, updated: "today",       apr: 22.99, monthly: 250,  color: "accent"  },
      { userId: maya.id, id: "m_cc2",  name: "Amex Everyday",       institution: "Amex",              type: "debt",       balance:  -3_200, updated: "3 days ago",  apr: 19.49, monthly: 100,  color: "accent"  },
      { userId: maya.id, id: "m_bb",   name: "Best Buy Store Card", institution: "Citi",              type: "debt",       balance:  -2_800, updated: "2 days ago",  apr: 29.99, monthly: 50,   color: "accent", promoEndsAt: new Date("2026-06-12") },
      { userId: maya.id, id: "m_stu",  name: "Student Loan",        institution: "Nelnet",            type: "debt",       balance: -28_400, updated: "1 week ago",  apr: 5.8,   monthly: 320,  color: "accent"  },
      { userId: maya.id, id: "m_car",  name: "Car Loan",            institution: "Toyota",            type: "debt",       balance: -10_000, updated: "3 days ago",  apr: 6.2,   monthly: 400,  color: "accent"  },
    ],
  });

  await prisma.goal.createMany({
    data: [
      { userId: maya.id, id: "mg1", name: "Pay off credit cards", kind: "debt",     target: 0,      current: -11_600, eta: "Dec 2026", monthly: 500, projected: "Nov 2026", onTrack: true,  apr: 22.99 },
      { userId: maya.id, id: "mg2", name: "Emergency Fund $15K",   kind: "savings",  target: 15_000, current:   6_800, eta: "Aug 2027", monthly: 500, projected: "Sep 2027", onTrack: false, apr: null },
      { userId: maya.id, id: "mg3", name: "$100K Net Worth",       kind: "networth", target: 100_000, current:  18_400, eta: "Jun 2029", monthly: 2500, projected: "May 2029", onTrack: true,  apr: null },
    ],
  });

  await prisma.milestone.createMany({
    data: [
      { userId: maya.id, year: 2026, label: "Credit card free",     value:    42_000 },
      { userId: maya.id, year: 2029, label: "$100K net worth",      value:   105_000 },
      { userId: maya.id, year: 2035, label: "House downpayment",    value:   280_000 },
      { userId: maya.id, year: 2045, label: "$1M net worth",        value: 1_150_000 },
      { userId: maya.id, year: 2059, label: "Retirement",           value: 3_200_000 },
    ],
  });

  // Maya's transactions
  await prisma.transaction.createMany({
    data: [
      { userId: maya.id, accountId: "m_chk", date: "2026-04-05", merchant: "Direct Deposit · ACME", category: "income",        amount:  3_925.00 },
      { userId: maya.id, accountId: "m_chk", date: "2026-04-01", merchant: "Rent Payment",          category: "housing",       amount: -2_100.00 },
      { userId: maya.id, accountId: "m_chk", date: "2026-04-03", merchant: "Trader Joe's",          category: "groceries",     amount:   -124.50 },
      { userId: maya.id, accountId: "m_cc1", date: "2026-04-04", merchant: "Netflix",               category: "subscriptions", amount:    -15.99 },
      { userId: maya.id, accountId: "m_cc1", date: "2026-04-06", merchant: "Shell Oil",             category: "transport",     amount:    -45.20 },
    ],
  });

  console.log("Seeded Maya Chen with", await prisma.account.count({ where: { userId: maya.id } }), "accounts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
