/**
 * Seed — three public demo personas plus auth-ready real-user signups.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seeded demos keep a password hash for local debugging, but the web app now
// exposes them through public read-only routes instead of the login form.
const DEMO_PASSWORD = "password123";

async function main() {
  // Wipe everything deterministic-first so `pnpm db:seed` is idempotent.
  await prisma.transaction.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const maya = await prisma.user.create({
    data: {
      id: "maya",
      name: "Maya Chen",
      email: "maya@example.com",
      passwordHash: demoHash,
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
        passwordHash: demoHash,
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
        passwordHash: demoHash,
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
      { userId: "david", id: "d_chk",  name: "Checking",            institution: "Capital One",       type: "cash",       balance:   2_600, updated: "today",       apr: null,  monthly: null, color: "chart-1" },
      { userId: "david", id: "d_sav",  name: "Emergency Fund",      institution: "Ally",              type: "cash",       balance:   5_400, updated: "today",       apr: 4.10,  monthly: null, color: "chart-2" },
      { userId: "david", id: "d_401k", name: "401(k)",              institution: "Human Interest",    type: "investment", balance:  11_200, updated: "4 days ago",  apr: null,  monthly: null, color: "chart-3" },
      { userId: "david", id: "d_brk",  name: "Brokerage",           institution: "Fidelity",          type: "investment", balance:   3_800, updated: "1 week ago",  apr: null,  monthly: null, color: "chart-3" },
      { userId: "david", id: "d_card", name: "Travel Rewards Card", institution: "Capital One",       type: "debt",       balance:  -2_100, updated: "2 days ago",  apr: 18.9,  monthly: 85,   color: "accent"  },
      { userId: "david", id: "d_stu",  name: "Student Loan",        institution: "Aidvantage",        type: "debt",       balance: -12_400, updated: "1 week ago",  apr: 4.9,   monthly: 180,  color: "accent"  },
      { userId: "linda", id: "l_chk",  name: "Household Checking",  institution: "BMO",               type: "cash",       balance:   9_200, updated: "today",       apr: null,  monthly: null, color: "chart-1" },
      { userId: "linda", id: "l_cash", name: "Cash Reserve",        institution: "Marcus",            type: "cash",       balance:  38_000, updated: "today",       apr: 4.35,  monthly: null, color: "chart-2" },
      { userId: "linda", id: "l_401k", name: "401(k)",              institution: "Fidelity",          type: "investment", balance: 420_000, updated: "3 days ago",  apr: null,  monthly: null, color: "chart-3" },
      { userId: "linda", id: "l_ira",  name: "Traditional IRA",     institution: "Vanguard",          type: "investment", balance: 186_000, updated: "1 week ago",  apr: null,  monthly: null, color: "chart-3" },
      { userId: "linda", id: "l_brk",  name: "Brokerage",           institution: "Schwab",            type: "investment", balance: 124_000, updated: "2 days ago",  apr: null,  monthly: null, color: "chart-3" },
      { userId: "linda", id: "l_mtg",  name: "Mortgage",            institution: "Rocket Mortgage",   type: "debt",       balance: -148_000, updated: "1 week ago", apr: 3.8,   monthly: 1600, color: "accent"  },
      { userId: "linda", id: "l_card", name: "Travel Card",         institution: "Amex",              type: "debt",       balance:  -2_600, updated: "today",       apr: 17.99, monthly: 150,  color: "accent"  },
    ],
  });

  await prisma.goal.createMany({
    data: [
      { userId: maya.id, id: "mg1", name: "Pay off credit cards", kind: "debt",     target: 0,      current: -11_600, eta: "Dec 2026", monthly: 500, projected: "Nov 2026", onTrack: true,  apr: 22.99 },
      { userId: maya.id, id: "mg2", name: "Emergency Fund $15K",   kind: "savings",  target: 15_000, current:   6_800, eta: "Aug 2027", monthly: 500, projected: "Sep 2027", onTrack: false, apr: null },
      { userId: maya.id, id: "mg3", name: "$100K Net Worth",       kind: "networth", target: 100_000, current:  18_400, eta: "Jun 2029", monthly: 2500, projected: "May 2029", onTrack: true,  apr: null },
      { userId: "david", id: "dg1", name: "Eliminate card balance", kind: "debt",     target: 0,      current:  -2_100, eta: "Feb 2027", monthly: 250, projected: "Jan 2027", onTrack: true,  apr: 18.9 },
      { userId: "david", id: "dg2", name: "Emergency Fund $10K",    kind: "savings",  target: 10_000, current:   5_400, eta: "Nov 2026", monthly: 300, projected: "Nov 2026", onTrack: true,  apr: null },
      { userId: "david", id: "dg3", name: "First $50K net worth",   kind: "networth", target: 50_000, current:   8_500, eta: "Aug 2029", monthly: 850, projected: "Oct 2029", onTrack: false, apr: null },
      { userId: "linda", id: "lg1", name: "Retire at 65",           kind: "networth", target: 900_000, current: 626_600, eta: "Mar 2030", monthly: 2800, projected: "Mar 2030", onTrack: true,  apr: null },
      { userId: "linda", id: "lg2", name: "Kitchen remodel reserve",kind: "purchase", target: 35_000, current:  16_000, eta: "Oct 2027", monthly: 900, projected: "Jan 2028", onTrack: false, apr: null },
    ],
  });

  await prisma.milestone.createMany({
    data: [
      { userId: maya.id, year: 2026, label: "Credit card free",     value:    42_000 },
      { userId: maya.id, year: 2029, label: "$100K net worth",      value:   105_000 },
      { userId: maya.id, year: 2035, label: "House downpayment",    value:   280_000 },
      { userId: maya.id, year: 2045, label: "$1M net worth",        value: 1_150_000 },
      { userId: maya.id, year: 2059, label: "Retirement",           value: 3_200_000 },
      { userId: "david", year: 2027, label: "Emergency fund funded", value:    12_000 },
      { userId: "david", year: 2030, label: "$50K net worth",        value:    56_000 },
      { userId: "david", year: 2034, label: "Down payment option",   value:   128_000 },
      { userId: "david", year: 2058, label: "Financial flexibility", value:   980_000 },
      { userId: "linda", year: 2028, label: "Mortgage under $100K",  value:   705_000 },
      { userId: "linda", year: 2030, label: "Retirement window",     value:   930_000 },
      { userId: "linda", year: 2035, label: "Legacy fund",           value: 1_180_000 },
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
      { userId: "david", accountId: "d_chk", date: "2026-04-05", merchant: "Direct Deposit · Orbit", category: "income",        amount:  2_600.00 },
      { userId: "david", accountId: "d_chk", date: "2026-04-02", merchant: "Apartment Rent",        category: "housing",       amount: -1_350.00 },
      { userId: "david", accountId: "d_card", date: "2026-04-06", merchant: "REI",                  category: "shopping",      amount:   -88.40 },
      { userId: "david", accountId: "d_chk", date: "2026-04-08", merchant: "Transfer to Savings",   category: "transfer",      amount:  -300.00 },
      { userId: "linda", accountId: "l_chk", date: "2026-04-03", merchant: "Payroll Deposit",       category: "income",        amount:  4_600.00 },
      { userId: "linda", accountId: "l_mtg", date: "2026-04-01", merchant: "Mortgage Payment",      category: "housing",       amount: -1_600.00 },
      { userId: "linda", accountId: "l_card", date: "2026-04-09", merchant: "Airbnb",               category: "other",         amount:  -420.00 },
      { userId: "linda", accountId: "l_chk", date: "2026-04-10", merchant: "Transfer to Brokerage", category: "transfer",      amount: -1_250.00 },
    ],
  });

  console.log(
    "Seeded public demos:",
    await prisma.user.count(),
    "users with",
    await prisma.account.count(),
    "accounts.",
  );
  console.log(`Demo seed password retained for local debugging only: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
