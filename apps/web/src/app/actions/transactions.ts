"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@ledger/db";
import {
  TransactionCreate,
  TxnCategory,
  type TxnCategory as TxnCategoryValue,
} from "@ledger/shared";
import { requireUser } from "@/lib/auth";

export type TransactionCreateResult =
  | null
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<
        Record<"date" | "merchant" | "category" | "amount" | "accountId" | "direction", string>
      >;
    };

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
const HEADER_ALIASES = {
  date: ["date", "transactiondate", "posteddate"],
  merchant: ["merchant", "description", "payee", "name", "itemtitle", "title"],
  amount: ["amount", "total", "net", "value"],
  category: ["category", "type"],
  account: ["account", "accountname", "wallet", "source"],
} as const;

function normalizeCell(value: string) {
  return value.trim();
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findHeaderIndex(headers: string[], aliases: readonly string[]) {
  return headers.findIndex((value) => aliases.includes(value));
}

function resolveHeaderIndex(
  headers: string[],
  explicit: FormDataEntryValue | null,
  aliases: readonly string[],
) {
  const selected = normalizeHeader(String(explicit ?? ""));
  if (selected) {
    return headers.findIndex((value) => value === selected);
  }

  return findHeaderIndex(headers, aliases);
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

function parseManualAmount(raw: FormDataEntryValue | null) {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return amount;
}

function sumAmountsByAccount(
  rows: Array<{ accountId: string; amount: number }>,
) {
  const totals = new Map<string, number>();

  for (const row of rows) {
    totals.set(row.accountId, (totals.get(row.accountId) ?? 0) + row.amount);
  }

  return totals;
}

export async function createTransaction(
  _prev: TransactionCreateResult,
  formData: FormData,
): Promise<TransactionCreateResult> {
  const user = await requireUser();
  const date = normalizeDate(String(formData.get("date") ?? ""));
  const merchant = String(formData.get("merchant") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();
  const accountIdRaw = String(formData.get("accountId") ?? "").trim();
  const amountAbs = parseManualAmount(formData.get("amount"));

  const fieldErrors: NonNullable<
    Extract<TransactionCreateResult, { ok: false }>["fieldErrors"]
  > = {};

  if (!date) fieldErrors.date = "Enter a valid date.";
  if (!merchant) fieldErrors.merchant = "Merchant is required.";
  if (!TxnCategory.options.includes(category as TxnCategoryValue)) {
    fieldErrors.category = "Choose a valid category.";
  }
  if (direction !== "expense" && direction !== "income") {
    fieldErrors.direction = "Choose whether this is money out or money in.";
  }
  if (amountAbs == null) {
    fieldErrors.amount = "Enter an amount greater than zero.";
  }

  if (!accountIdRaw) {
    fieldErrors.accountId = "Choose an account for this transaction.";
  }

  let accountId: string | null = null;
  if (accountIdRaw) {
    const account = await prisma.account.findFirst({
      where: {
        id: accountIdRaw,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!account) {
      fieldErrors.accountId = "Choose one of your own accounts.";
    } else {
      accountId = account.id;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const amount = direction === "expense" ? -amountAbs! : amountAbs!;

  const parsed = TransactionCreate.safeParse({
    accountId,
    date,
    merchant,
    category,
    amount,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Transaction data is invalid.",
    };
  }

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        ...parsed.data,
      },
    }),
    prisma.account.update({
      where: { id: accountId! },
      data: {
        balance: {
          increment: amount,
        },
        updated: "just now",
      },
    }),
  ]);

  revalidatePath("/app");
  revalidatePath("/app/transactions");

  return {
    ok: true,
    message: "Transaction added.",
  };
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

  if (accounts.length === 0) {
    return {
      ok: false,
      error: "Add an account before importing transactions.",
      fieldErrors: { accountId: "You need at least one account first." },
    };
  }

  if (defaultAccountId && !accounts.some((account) => account.id === defaultAccountId)) {
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
  const dateIndex = resolveHeaderIndex(
    headers,
    formData.get("mappingDate"),
    HEADER_ALIASES.date,
  );
  const merchantIndex = resolveHeaderIndex(
    headers,
    formData.get("mappingMerchant"),
    HEADER_ALIASES.merchant,
  );
  const amountIndex = resolveHeaderIndex(
    headers,
    formData.get("mappingAmount"),
    HEADER_ALIASES.amount,
  );
  const categoryIndex = resolveHeaderIndex(
    headers,
    formData.get("mappingCategory"),
    HEADER_ALIASES.category,
  );
  const accountIndex = resolveHeaderIndex(
    headers,
    formData.get("mappingAccount"),
    HEADER_ALIASES.account,
  );

  if (dateIndex === -1 || merchantIndex === -1 || amountIndex === -1) {
    const availableHeaders = headerRow
      .filter((value) => value.length > 0)
      .map((value) => `"${value}"`)
      .join(", ");
    return {
      ok: false,
      error:
        `We couldn't match the required columns automatically. Match your CSV headers to date, merchant, and amount. Available headers: ${availableHeaders || "none found"}.`,
    };
  }

  const accountLookup = buildAccountLookup(accounts);
  const rowErrors: string[] = [];
  const data: Array<{
    userId: string;
    accountId: string;
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

    if (!resolvedAccountId) {
      rowErrors.push(
        rawAccount
          ? `Row ${index + 1}: account "${rawAccount}" did not match one of your accounts.`
          : `Row ${index + 1}: no account was provided. Add an account column or choose a fallback account.`,
      );
      continue;
    }

    const parsed = TransactionCreate.safeParse({
      accountId: resolvedAccountId,
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
      accountId: resolvedAccountId,
      date: parsed.data.date,
      merchant: parsed.data.merchant,
      category: parsed.data.category,
      amount: parsed.data.amount,
    });
  }

  if (data.length === 0) {
    return {
      ok: false,
      error: "None of the rows could be imported.",
      rowErrors: rowErrors.slice(0, 8),
    };
  }

  const balanceTotals = sumAmountsByAccount(
    data.map((row) => ({
      accountId: row.accountId,
      amount: row.amount,
    })),
  );

  await prisma.$transaction([
    prisma.transaction.createMany({ data }),
    ...Array.from(balanceTotals.entries()).map(([accountId, amount]) =>
      prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: amount,
          },
          updated: "just now",
        },
      }),
    ),
  ]);

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
