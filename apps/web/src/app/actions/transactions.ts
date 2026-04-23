"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@ledger/db";
import {
  TransactionCreate,
  TxnCategory,
  type TxnCategory as TxnCategoryValue,
} from "@ledger/shared";
import { requireUser } from "@/lib/auth";

export type TransactionImportResult =
  | null
  | {
      ok: true;
      imported: number;
      skipped: number;
      message: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<"file" | "accountId", string>>;
      rowErrors?: string[];
    };

const CATEGORY_SET = new Set<string>(TxnCategory.options);

function normalizeCell(value: string) {
  return value.trim();
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function parseAmount(raw: string) {
  const value = normalizeCell(raw);
  if (!value) return null;

  const negative = value.includes("(") && value.includes(")");
  const cleaned = value.replace(/[$,\s()]/g, "");
  const amount = Number(cleaned);
  if (!Number.isFinite(amount)) return null;

  return negative ? -Math.abs(amount) : amount;
}

function normalizeDate(raw: string) {
  const value = normalizeCell(raw);
  if (!value) return null;

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    if (!year || !month || !day) return null;
    return `${year}-${month}-${day}`;
  }

  const usMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (usMatch) {
    const [, monthRaw, dayRaw, yearRaw] = usMatch;
    if (!monthRaw || !dayRaw || !yearRaw) return null;
    const month = monthRaw.padStart(2, "0");
    const day = dayRaw.padStart(2, "0");
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
}

function normalizeCategory(raw: string): TxnCategoryValue {
  const value = raw.trim().toLowerCase().replace(/[\s/]+/g, "_");
  return CATEGORY_SET.has(value) ? (value as TxnCategoryValue) : "other";
}

function buildAccountLookup(
  accounts: Array<{ id: string; name: string; institution: string }>,
) {
  const lookup = new Map<string, string>();

  for (const account of accounts) {
    const name = account.name.trim().toLowerCase();
    const institution = account.institution.trim().toLowerCase();
    const combo = `${institution}:${name}`;

    lookup.set(name, account.id);
    lookup.set(institution, account.id);
    lookup.set(combo, account.id);
  }

  return lookup;
}

export async function importTransactions(
  _prev: TransactionImportResult,
  formData: FormData,
): Promise<TransactionImportResult> {
  const user = await requireUser();
  const file = formData.get("file");
  const defaultAccountId =
    String(formData.get("accountId") ?? "").trim() || null;

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      institution: true,
    },
    orderBy: [{ institution: "asc" }, { name: "asc" }],
  });

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      error: "Choose a CSV file first.",
      fieldErrors: { file: "A CSV file is required." },
    };
  }

  if (
    defaultAccountId &&
    !accounts.some((account) => account.id === defaultAccountId)
  ) {
    return {
      ok: false,
      error: "That account is not available for this import.",
      fieldErrors: { accountId: "Choose one of your own accounts." },
    };
  }

  const csv = await file.text();
  const rows = parseCsv(csv).map((row) => row.map(normalizeCell));
  if (rows.length < 2) {
    return {
      ok: false,
      error: "The CSV needs a header row and at least one transaction row.",
    };
  }

  const headerRow = rows[0];
  if (!headerRow) {
    return {
      ok: false,
      error: "The CSV is missing a header row.",
    };
  }

  const headers = headerRow.map(normalizeHeader);
  const dateIndex = headers.findIndex((value) => value === "date");
  const merchantIndex = headers.findIndex(
    (value) => value === "merchant" || value === "description" || value === "payee",
  );
  const amountIndex = headers.findIndex((value) => value === "amount");
  const categoryIndex = headers.findIndex((value) => value === "category");
  const accountIndex = headers.findIndex(
    (value) => value === "account" || value === "accountname",
  );

  if (dateIndex === -1 || merchantIndex === -1 || amountIndex === -1) {
    return {
      ok: false,
      error:
        "Use a CSV with at least these headers: date, merchant, amount. Category and account are optional.",
    };
  }

  const accountLookup = buildAccountLookup(accounts);
  const rowErrors: string[] = [];
  const data: Array<{
    userId: string;
    accountId: string | null;
    date: string;
    merchant: string;
    category: TxnCategoryValue;
    amount: number;
  }> = [];

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row) continue;
    if (row.every((cell) => cell.length === 0)) continue;

    const rawDate = row[dateIndex] ?? "";
    const rawMerchant = row[merchantIndex] ?? "";
    const rawAmount = row[amountIndex] ?? "";
    const rawCategory = categoryIndex >= 0 ? row[categoryIndex] ?? "" : "";
    const rawAccount = accountIndex >= 0 ? row[accountIndex] ?? "" : "";

    const date = normalizeDate(rawDate);
    const merchant = rawMerchant.trim();
    const amount = parseAmount(rawAmount);
    const category = normalizeCategory(rawCategory);

    const resolvedAccountId = rawAccount
      ? accountLookup.get(rawAccount.trim().toLowerCase()) ?? defaultAccountId
      : defaultAccountId;

    if (!date) {
      rowErrors.push(`Row ${index + 1}: date is missing or invalid.`);
      continue;
    }

    if (!merchant) {
      rowErrors.push(`Row ${index + 1}: merchant is missing.`);
      continue;
    }

    if (amount == null) {
      rowErrors.push(`Row ${index + 1}: amount is missing or invalid.`);
      continue;
    }

    if (rawAccount && !resolvedAccountId) {
      rowErrors.push(
        `Row ${index + 1}: account "${rawAccount}" did not match one of your accounts.`,
      );
      continue;
    }

    const parsed = TransactionCreate.safeParse({
      accountId: resolvedAccountId ?? null,
      date,
      merchant,
      category,
      amount,
    });

    if (!parsed.success) {
      rowErrors.push(`Row ${index + 1}: ${parsed.error.issues[0]?.message ?? "invalid data"}.`);
      continue;
    }

    data.push({
      userId: user.id,
      ...parsed.data,
    });
  }

  if (data.length === 0) {
    return {
      ok: false,
      error: "None of the rows could be imported.",
      rowErrors: rowErrors.slice(0, 8),
    };
  }

  await prisma.transaction.createMany({ data });

  revalidatePath("/app");
  revalidatePath("/app/transactions");

  return {
    ok: true,
    imported: data.length,
    skipped: rowErrors.length,
    message:
      rowErrors.length > 0
        ? `Imported ${data.length} transactions and skipped ${rowErrors.length}.`
        : `Imported ${data.length} transactions.`,
  };
}
