/**
 * Ledger API — Hono + Prisma.
 *
 * There's no auth yet; we identify a user via the `x-user-id` header and fall
 * back to the seeded demo user ("elena"). Every route is chained on a single
 * builder so `hc<AppType>` in the web app gets full end-to-end types.
 */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@ledger/db";
import {
  AccountCreate,
  AccountPatch,
  GoalCreate,
  Goal as GoalSchema,
  ScenarioInputs,
  TransactionCreate,
  ParseStatementResponse,
} from "@ledger/shared";
import { z } from "zod";
import {
  makeProjection,
  netWorth,
  savingsRate,
  syntheticNwHistory,
  totals,
} from "./lib/compute.js";

const DEFAULT_USER = "elena";

type Variables = { userId: string };
const app = new Hono<{ Variables: Variables }>();

app.use("*", cors());

// Resolve user id from header; middleware so downstream can assume c.get("userId").
app.use("*", async (c, next) => {
  const header = c.req.header("x-user-id");
  c.set("userId", header && header.length > 0 ? header : DEFAULT_USER);
  await next();
});

const GoalPatch = GoalSchema.omit({ id: true, userId: true }).partial();

const routes = app
  .get("/", (c) => c.json({ name: "ledger-api", ok: true }))

  /* ------------ dashboard summary ------------ */
  .get("/summary", async (c) => {
    const userId = c.get("userId");
    const [user, accounts, goals, milestones] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.account.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.milestone.findMany({ where: { userId }, orderBy: { year: "asc" } }),
    ]);
    if (!user) return c.json({ error: "user not found" }, 404);
    const nw = netWorth(accounts);
    const t = totals(accounts);
    // The design shows a 30-day delta against the current NW. We don't yet
    // store snapshots, so approximate from a synthetic history.
    const nwHistory = syntheticNwHistory(nw, Math.round(nw * 0.05));
    const trend = nw - (nwHistory[0]?.value ?? nw);
    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        retireAge: user.retireAge,
        returnRate: user.returnRate,
        joinedYear: user.joinedYear,
      },
      asOf: new Date().toISOString().slice(0, 10),
      netWorth: nw,
      netWorthTrend: trend,
      cash: t.cash,
      invest: t.invest,
      debt: t.debt,
      incomeNet: user.incomeNet,
      incomeGross: user.incomeGross,
      expensesMonthly: user.expensesMonthly,
      savingsRate: savingsRate(user.incomeNet, user.expensesMonthly),
      accounts,
      goals,
      milestones,
      nwHistory,
    });
  })

  /* ------------ accounts ------------ */
  .get("/accounts", async (c) => {
    const userId = c.get("userId");
    const accounts = await prisma.account.findMany({ where: { userId } });
    return c.json({ accounts });
  })
  .post("/accounts", zValidator("json", AccountCreate), async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const account = await prisma.account.create({ data: { ...body, userId } });
    return c.json({ account }, 201);
  })
  .patch(
    "/accounts/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", AccountPatch),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const patch = c.req.valid("json");
      const existing = await prisma.account.findFirst({ where: { id, userId } });
      if (!existing) return c.json({ error: "not found" }, 404);
      const account = await prisma.account.update({ where: { id }, data: patch });
      return c.json({ account });
    },
  )
  .delete(
    "/accounts/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const existing = await prisma.account.findFirst({ where: { id, userId } });
      if (!existing) return c.json({ error: "not found" }, 404);
      await prisma.account.delete({ where: { id } });
      return c.json({ ok: true });
    },
  )

  /* ------------ goals ------------ */
  .get("/goals", async (c) => {
    const userId = c.get("userId");
    const goals = await prisma.goal.findMany({ where: { userId } });
    return c.json({ goals });
  })
  .post("/goals", zValidator("json", GoalCreate), async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const goal = await prisma.goal.create({ data: { ...body, userId } });
    return c.json({ goal }, 201);
  })
  .patch(
    "/goals/:id",
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", GoalPatch),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const patch = c.req.valid("json");
      const existing = await prisma.goal.findFirst({ where: { id, userId } });
      if (!existing) return c.json({ error: "not found" }, 404);
      const goal = await prisma.goal.update({ where: { id }, data: patch });
      return c.json({ goal });
    },
  )
  .delete(
    "/goals/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const existing = await prisma.goal.findFirst({ where: { id, userId } });
      if (!existing) return c.json({ error: "not found" }, 404);
      await prisma.goal.delete({ where: { id } });
      return c.json({ ok: true });
    },
  )

  /* ------------ transactions ------------ */
  .get("/transactions", async (c) => {
    const userId = c.get("userId");
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 200,
    });
    return c.json({ transactions });
  })
  .post("/transactions", zValidator("json", TransactionCreate), async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const transaction = await prisma.transaction.create({ data: { ...body, userId } });
    return c.json({ transaction }, 201);
  })

  /* ------------ milestones ------------ */
  .get("/milestones", async (c) => {
    const userId = c.get("userId");
    const milestones = await prisma.milestone.findMany({
      where: { userId },
      orderBy: { year: "asc" },
    });
    return c.json({ milestones });
  })

  /* ------------ projections & scenarios ------------ */
  .post("/projection", zValidator("json", ScenarioInputs), async (c) => {
    const userId = c.get("userId");
    const inputs = c.req.valid("json");
    const [user, accounts] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.account.findMany({ where: { userId } }),
    ]);
    if (!user) return c.json({ error: "user not found" }, 404);

    const start = netWorth(accounts);
    const startYear = new Date().getFullYear();

    // Base curve uses the user's saved return rate and a monthly contribution
    // derived from their net income minus expenses.
    const baseMonthly = Math.max(0, user.incomeNet - user.expensesMonthly);
    const base = makeProjection(
      start,
      startYear,
      baseMonthly,
      user.returnRate / 100,
      inputs.years,
    );

    // Adjusted curve overlays the scenario inputs. `jobChange` is a monthly
    // income delta that flows through savings; `extraSavings` is additive
    // monthly; `bigExpense` hits the starting principal.
    const adjustedMonthly = baseMonthly + inputs.extraSavings + inputs.jobChange;
    const adjustedStart = Math.max(0, start - inputs.bigExpense);
    const adjusted = makeProjection(
      adjustedStart,
      startYear,
      adjustedMonthly,
      inputs.returnRate / 100,
      inputs.years,
    );

    return c.json({ startingNetWorth: start, base, adjusted });
  })

  /* ------------ mock statement parsing ------------ */
  .post(
    "/parse-statement-mock",
    zValidator("json", z.object({ fileName: z.string() })),
    async (c) => {
      const { fileName } = c.req.valid("json");
      // The real design proposes a PDF -> LLM flow; for now return a
      // deterministic set of parsed rows so the upload UI has something real.
      const sample: ParseStatementResponse = {
        fileName,
        range: "Mar 01 — Mar 31, 2026",
        transactions: [
          { date: "2026-03-02", merchant: "Trader Joe's",           category: "groceries",     amount: -84.22 },
          { date: "2026-03-04", merchant: "Lyft",                   category: "transport",     amount: -14.60 },
          { date: "2026-03-05", merchant: "Direct Deposit · ACME",  category: "income",        amount: 3600.00 },
          { date: "2026-03-07", merchant: "Netflix",                category: "subscriptions", amount: -15.99 },
          { date: "2026-03-10", merchant: "Rent · 450 W Elm",       category: "housing",       amount: -1850.00 },
          { date: "2026-03-14", merchant: "Blue Bottle Coffee",     category: "dining",        amount: -6.75 },
          { date: "2026-03-18", merchant: "Uniqlo",                 category: "shopping",      amount: -78.40 },
          { date: "2026-03-22", merchant: "CVS Pharmacy",           category: "health",        amount: -28.10 },
          { date: "2026-03-28", merchant: "Transfer to Savings",    category: "transfer",      amount: -800.00 },
        ],
      };
      return c.json(sample);
    },
  );

export type AppType = typeof routes;

const port = Number(process.env["PORT"] ?? 8787);

serve({ fetch: app.fetch, port }, () => {
  console.log(`ledger-api listening on http://localhost:${port}`);
});
