/**
 * React Query hooks wrapping the Hono `hc` client.
 *
 * We use a loose (`any`) client handle rather than relying on full end-to-end
 * inference because the monorepo doesn't run a typegen step yet. Each hook
 * hand-types its response shape against the shared Zod schemas, which gives
 * us 95% of the safety with none of the fragility.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Account,
  AccountCreate,
  AccountPatch,
  DashboardSummary,
  Goal,
  GoalCreate,
  Milestone,
  ProjectionResponse,
  ScenarioInputs,
  Transaction,
  ParseStatementResponse,
} from "@ledger/shared";
import { client } from "./api";
import { useAppStore } from "../state/app";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const c = client as any;

export function useSummary() {
  const userId = useAppStore((s) => s.userId);
  return useQuery<DashboardSummary>({
    queryKey: ["summary", userId],
    queryFn: async () => {
      const res = await c.summary.$get({ header: { "x-user-id": userId } });
      if (!res.ok) throw new Error(`summary ${res.status}`);
      return (await res.json()) as DashboardSummary;
    },
  });
}

export function useAccounts() {
  const userId = useAppStore((s) => s.userId);
  return useQuery<{ accounts: Account[] }>({
    queryKey: ["accounts", userId],
    queryFn: async () => (await c.accounts.$get({ header: { "x-user-id": userId } })).json(),
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  const userId = useAppStore((s) => s.userId);
  return useMutation({
    mutationFn: async (body: AccountCreate) =>
      (await c.accounts.$post({ json: body, header: { "x-user-id": userId } })).json() as Promise<{ account: Account }>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts", userId] });
      qc.invalidateQueries({ queryKey: ["summary", userId] });
    },
  });
}

export function usePatchAccount() {
  const qc = useQueryClient();
  const userId = useAppStore((s) => s.userId);
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: AccountPatch }) =>
      (await c.accounts[":id"].$patch({ param: { id }, json: patch, header: { "x-user-id": userId } })).json() as Promise<{
        account: Account;
      }>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts", userId] });
      qc.invalidateQueries({ queryKey: ["summary", userId] });
    },
  });
}

export function useGoals() {
  const userId = useAppStore((s) => s.userId);
  return useQuery<{ goals: Goal[] }>({
    queryKey: ["goals", userId],
    queryFn: async () => (await c.goals.$get({ header: { "x-user-id": userId } })).json(),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  const userId = useAppStore((s) => s.userId);
  return useMutation({
    mutationFn: async (body: GoalCreate) =>
      (await c.goals.$post({ json: body, header: { "x-user-id": userId } })).json() as Promise<{ goal: Goal }>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals", userId] });
      qc.invalidateQueries({ queryKey: ["summary", userId] });
    },
  });
}

export function useMilestones() {
  const userId = useAppStore((s) => s.userId);
  return useQuery<{ milestones: Milestone[] }>({
    queryKey: ["milestones", userId],
    queryFn: async () => (await c.milestones.$get({ header: { "x-user-id": userId } })).json(),
  });
}

export function useTransactions() {
  const userId = useAppStore((s) => s.userId);
  return useQuery<{ transactions: Transaction[] }>({
    queryKey: ["transactions", userId],
    queryFn: async () => (await c.transactions.$get({ header: { "x-user-id": userId } })).json(),
  });
}

export function useProjection() {
  const userId = useAppStore((s) => s.userId);
  return useMutation({
    mutationFn: async (body: ScenarioInputs) =>
      (await c.projection.$post({ json: body, header: { "x-user-id": userId } })).json() as Promise<ProjectionResponse>,
  });
}

export function useParseStatement() {
  const userId = useAppStore((s) => s.userId);
  return useMutation({
    mutationFn: async (fileName: string) =>
      (await c["parse-statement-mock"].$post({ json: { fileName }, header: { "x-user-id": userId } })).json() as Promise<ParseStatementResponse>,
  });
}
