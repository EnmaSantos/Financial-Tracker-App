import { z } from "zod";

/**
 * Ledger — shared Zod schemas.
 *
 * Mirror the shape of the design's `initialData` in `data.js`. Money is stored
 * as plain numbers (dollars) — debts are negative, assets positive — to match
 * the fmt$ helper in the design.
 */

export const AccountType = z.enum(["cash", "investment", "debt"]);
export type AccountType = z.infer<typeof AccountType>;

export const GoalKind = z.enum(["debt", "purchase"]);
export type GoalKind = z.infer<typeof GoalKind>;

export const ChartStyle = z.enum(["line", "area"]);
export type ChartStyle = z.infer<typeof ChartStyle>;

export const Theme = z.enum(["light", "dark"]);
export type Theme = z.infer<typeof Theme>;

export const Accent = z.enum(["oxblood", "indigo", "forest", "ochre"]);
export type Accent = z.infer<typeof Accent>;

export const DashboardLayout = z.enum(["editorial", "timeline", "grid"]);
export type DashboardLayout = z.infer<typeof DashboardLayout>;

export const TxnCategory = z.enum([
  "groceries",
  "transport",
  "income",
  "subscriptions",
  "housing",
  "dining",
  "shopping",
  "health",
  "transfer",
  "other",
]);
export type TxnCategory = z.infer<typeof TxnCategory>;

export const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().nullable(),
  age: z.number().int().positive().default(26),
  retireAge: z.number().int().default(55),
  returnRate: z.number().default(6.5),
  joinedYear: z.number().int().default(2024),
});
export type User = z.infer<typeof User>;

export const Account = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  institution: z.string(),
  type: AccountType,
  /** Positive for cash/investment, negative for debt. */
  balance: z.number(),
  updated: z.string(),
  apr: z.number().nullable(),
  monthly: z.number().nullable(),
  color: z.string().default("chart-1"),
  /** When a 0%-APR promotional window ends, for debt accounts that have one. */
  promoEndsAt: z.coerce.date().nullable().optional(),
});
export type Account = z.infer<typeof Account>;

export const AccountCreate = Account.omit({ id: true, userId: true });
export type AccountCreate = z.infer<typeof AccountCreate>;

export const AccountPatch = Account.omit({ id: true, userId: true }).partial();
export type AccountPatch = z.infer<typeof AccountPatch>;

export const Goal = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  kind: GoalKind,
  target: z.number(),
  /** For debt goals this is the current debt balance (negative). */
  current: z.number(),
  eta: z.string(),
  monthly: z.number(),
  projected: z.string(),
  onTrack: z.boolean(),
  apr: z.number().nullable().optional(),
});
export type Goal = z.infer<typeof Goal>;

export const GoalCreate = Goal.omit({ id: true, userId: true });
export type GoalCreate = z.infer<typeof GoalCreate>;

export const Milestone = z.object({
  id: z.string(),
  userId: z.string(),
  year: z.number().int(),
  label: z.string(),
  value: z.number(),
});
export type Milestone = z.infer<typeof Milestone>;

export const Transaction = z.object({
  id: z.string(),
  userId: z.string(),
  accountId: z.string().nullable(),
  date: z.string(),
  merchant: z.string(),
  category: TxnCategory,
  amount: z.number(),
});
export type Transaction = z.infer<typeof Transaction>;

export const TransactionCreate = Transaction.omit({ id: true, userId: true });
export type TransactionCreate = z.infer<typeof TransactionCreate>;

/* ------------ scenario modeling ------------ */

export const ScenarioInputs = z.object({
  extraSavings: z.number().default(0),
  jobChange: z.number().default(0),
  bigExpense: z.number().min(0).default(0),
  returnRate: z.number().default(6.5),
  years: z.number().int().min(1).max(50).default(30),
});
export type ScenarioInputs = z.infer<typeof ScenarioInputs>;

export const ProjectionPoint = z.object({
  year: z.number().int(),
  value: z.number(),
});
export type ProjectionPoint = z.infer<typeof ProjectionPoint>;

export const ProjectionResponse = z.object({
  startingNetWorth: z.number(),
  base: z.array(ProjectionPoint),
  adjusted: z.array(ProjectionPoint),
});
export type ProjectionResponse = z.infer<typeof ProjectionResponse>;

/* ------------ statement parsing (mock) ------------ */

export const ParsedTxn = z.object({
  date: z.string(),
  merchant: z.string(),
  category: z.string(),
  amount: z.number(),
});
export type ParsedTxn = z.infer<typeof ParsedTxn>;

export const ParseStatementResponse = z.object({
  fileName: z.string(),
  range: z.string(),
  transactions: z.array(ParsedTxn),
});
export type ParseStatementResponse = z.infer<typeof ParseStatementResponse>;

/* ------------ dashboard summary ------------ */

export const DashboardSummary = z.object({
  user: User,
  asOf: z.string(),
  netWorth: z.number(),
  netWorthTrend: z.number(),
  cash: z.number(),
  invest: z.number(),
  debt: z.number(),
  incomeNet: z.number(),
  incomeGross: z.number(),
  expensesMonthly: z.number(),
  savingsRate: z.number(),
  accounts: z.array(Account),
  goals: z.array(Goal),
  milestones: z.array(Milestone),
  nwHistory: z.array(ProjectionPoint),
});
export type DashboardSummary = z.infer<typeof DashboardSummary>;
