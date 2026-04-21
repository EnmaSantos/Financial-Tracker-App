"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@ledger/db";
import { AccountCreate, AccountType } from "@ledger/shared";
import { requireUser } from "@/lib/auth";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function updateAccountBalance(
  accountId: string,
  balance: number,
): Promise<ActionResult> {
  if (!accountId || typeof accountId !== "string") {
    return { ok: false, error: "Missing account id." };
  }
  if (!Number.isFinite(balance)) {
    return { ok: false, error: "Invalid balance." };
  }

  const user = await requireUser();
  const existing = await prisma.account.findFirst({
    where: { id: accountId, userId: user.id },
  });
  if (!existing) return { ok: false, error: "Account not found." };

  // Debts are stored negative; preserve the sign convention so a user who
  // enters "2800" for a credit card sees the balance land as -2800.
  const signed =
    existing.type === "debt" ? -Math.abs(balance) : balance;

  await prisma.account.update({
    where: { id: accountId },
    data: { balance: signed, updated: "just now" },
  });

  revalidatePath("/");
  revalidatePath("/accounts");
  return { ok: true };
}

/**
 * Create a new account for the current user. Validates against the
 * shared Zod schema so the API and the UI agree on shape.
 */
export async function createAccount(
  formData: FormData,
): Promise<ActionResult> {
  const rawPromo = String(formData.get("promoEndsAt") ?? "").trim();
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    institution: String(formData.get("institution") ?? "").trim(),
    type: String(formData.get("type") ?? ""),
    balance: Number(formData.get("balance") ?? 0),
    apr: formData.get("apr") ? Number(formData.get("apr")) : null,
    monthly: formData.get("monthly") ? Number(formData.get("monthly")) : null,
    updated: "just now",
    color: "chart-1",
    promoEndsAt: rawPromo ? new Date(rawPromo) : null,
  };

  const parsed = AccountCreate.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, error: "Please check the form.", fieldErrors };
  }

  const user = await requireUser();
  const data = parsed.data;
  const typed = AccountType.parse(data.type);
  const signedBalance = typed === "debt" ? -Math.abs(data.balance) : data.balance;

  await prisma.account.create({
    data: {
      userId: user.id,
      name: data.name,
      institution: data.institution,
      type: typed,
      balance: signedBalance,
      updated: data.updated,
      apr: data.apr ?? null,
      monthly: data.monthly ?? null,
      color: data.color ?? "chart-1",
      promoEndsAt: data.promoEndsAt ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath("/accounts");
  return { ok: true };
}

export async function deleteAccount(accountId: string): Promise<ActionResult> {
  if (!accountId) return { ok: false, error: "Missing account id." };

  const user = await requireUser();
  const existing = await prisma.account.findFirst({
    where: { id: accountId, userId: user.id },
  });
  if (!existing) return { ok: false, error: "Account not found." };

  await prisma.account.delete({ where: { id: accountId } });

  revalidatePath("/");
  revalidatePath("/accounts");
  return { ok: true };
}
