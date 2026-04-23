"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  importTransactions,
  type TransactionImportResult,
} from "@/app/actions/transactions";

const initialState: TransactionImportResult = null;
const HEADER_ALIASES = {
  date: ["date", "transactiondate", "posteddate"],
  merchant: ["merchant", "description", "payee", "name", "itemtitle", "title"],
  amount: ["amount", "total", "net", "value"],
  category: ["category", "type"],
  account: ["account", "accountname", "wallet", "source"],
} as const;

type MappingKey = keyof typeof HEADER_ALIASES;
type HeaderOption = {
  raw: string;
  normalized: string;
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function parseHeaderRow(text: string) {
  const headers: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      headers.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      headers.push(cell.trim());
      return headers.filter((value) => value.length > 0);
    }

    cell += char;
  }

  if (cell.length > 0) {
    headers.push(cell.trim());
  }

  return headers.filter((value) => value.length > 0);
}

function guessHeader(
  options: HeaderOption[],
  aliases: readonly string[],
) {
  const match = options.find((option) => aliases.includes(option.normalized));
  return match?.normalized ?? "";
}

export function TransactionImportForm({
  accounts,
}: {
  accounts: Array<{ id: string; name: string; institution: string }>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    importTransactions,
    initialState,
  );
  const hasAccounts = accounts.length > 0;
  const [headerOptions, setHeaderOptions] = useState<HeaderOption[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [mappingDate, setMappingDate] = useState("");
  const [mappingMerchant, setMappingMerchant] = useState("");
  const [mappingAmount, setMappingAmount] = useState("");
  const [mappingCategory, setMappingCategory] = useState("");
  const [mappingAccount, setMappingAccount] = useState("");

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setHeaderOptions([]);
      setHeaderError(null);
      setMappingDate("");
      setMappingMerchant("");
      setMappingAmount("");
      setMappingCategory("");
      setMappingAccount("");
    }
  }, [state]);

  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const shouldShowHeaderMapping = headerOptions.length > 0;
  const missingRequiredMappings =
    shouldShowHeaderMapping &&
    (!mappingDate || !mappingMerchant || !mappingAmount);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      setHeaderOptions([]);
      setHeaderError(null);
      setMappingDate("");
      setMappingMerchant("");
      setMappingAmount("");
      setMappingCategory("");
      setMappingAccount("");
      return;
    }

    try {
      const text = await file.text();
      const headers = parseHeaderRow(text);

      if (headers.length === 0) {
        setHeaderOptions([]);
        setHeaderError("We couldn't read a header row from that CSV.");
        return;
      }

      const options = headers.map((raw) => ({
        raw,
        normalized: normalizeHeader(raw),
      }));

      setHeaderOptions(options);
      setHeaderError(null);
      setMappingDate(guessHeader(options, HEADER_ALIASES.date));
      setMappingMerchant(guessHeader(options, HEADER_ALIASES.merchant));
      setMappingAmount(guessHeader(options, HEADER_ALIASES.amount));
      setMappingCategory(guessHeader(options, HEADER_ALIASES.category));
      setMappingAccount(guessHeader(options, HEADER_ALIASES.account));
    } catch {
      setHeaderOptions([]);
      setHeaderError("We couldn't read that file. Try another CSV export.");
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      encType="multipart/form-data"
      className="flex flex-col gap-5"
    >
      <div className="rounded-xl border border-rule bg-paper-2 px-4 py-4 font-sans text-[12px] leading-6 text-ink-3">
        Upload a CSV with <span className="font-mono text-ink">date</span>,{" "}
        <span className="font-mono text-ink">merchant</span>, and{" "}
        <span className="font-mono text-ink">amount</span> columns.{" "}
        <span className="font-mono text-ink">category</span> is optional. Every imported
        row must resolve to one of your accounts, either from an{" "}
        <span className="font-mono text-ink">account</span> column or the fallback account
        below.
      </div>

      {!hasAccounts ? (
        <p className="font-mono text-[11px] text-negative">
          Add an account first before importing transactions.
        </p>
      ) : null}

      <Field label="CSV file" error={fieldErrors.file}>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          disabled={!hasAccounts}
          onChange={(event) => void handleFileChange(event)}
          className="w-full font-sans text-[13px] text-ink file:mr-4 file:border-0 file:bg-paper-3 file:px-3 file:py-2 file:font-sans file:text-[12px] file:text-ink"
        />
      </Field>

      {headerError ? (
        <p className="font-mono text-[11px] text-negative">{headerError}</p>
      ) : null}

      {shouldShowHeaderMapping ? (
        <div className="flex flex-col gap-4 rounded-xl border border-rule bg-paper-2 px-4 py-4">
          <div className="flex flex-col gap-1">
            <div className="label-kicker">Header mapping</div>
            <p className="font-sans text-[12px] leading-6 text-ink-3">
              We detected these headers in your CSV. Confirm or adjust how they map into
              the app before import.
            </p>
          </div>

          <div className="rounded-lg bg-paper px-3 py-3 font-mono text-[11px] text-ink-2">
            {headerOptions.map((option) => option.raw).join(" · ")}
          </div>

          {missingRequiredMappings ? (
            <p className="font-mono text-[11px] text-negative">
              Match the date, merchant, and amount columns before importing.
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <HeaderMappingField
              label="Date"
              name="mappingDate"
              required
              value={mappingDate}
              options={headerOptions}
              onChange={setMappingDate}
            />
            <HeaderMappingField
              label="Merchant"
              name="mappingMerchant"
              required
              value={mappingMerchant}
              options={headerOptions}
              onChange={setMappingMerchant}
            />
            <HeaderMappingField
              label="Amount"
              name="mappingAmount"
              required
              value={mappingAmount}
              options={headerOptions}
              onChange={setMappingAmount}
            />
            <HeaderMappingField
              label="Category"
              name="mappingCategory"
              value={mappingCategory}
              options={headerOptions}
              onChange={setMappingCategory}
            />
            <HeaderMappingField
              label="Account"
              name="mappingAccount"
              value={mappingAccount}
              options={headerOptions}
              onChange={setMappingAccount}
            />
          </div>
        </div>
      ) : null}

      <Field
        label="Fallback account (optional)"
        error={fieldErrors.accountId}
        hint="Used when the CSV does not include an account column or a row leaves it blank."
      >
        <select
          name="accountId"
          defaultValue=""
          className={inputCls}
          disabled={!hasAccounts}
        >
          <option value="">No fallback account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.institution} · {account.name}
            </option>
          ))}
        </select>
      </Field>

      {state && !state.ok ? (
        <>
          <p className="font-mono text-[11px] text-negative">{state.error}</p>
          {state.rowErrors?.length ? (
            <ul className="flex flex-col gap-1 rounded-xl border border-rule bg-paper-2 px-4 py-4 font-sans text-[12px] text-ink-2">
              {state.rowErrors.map((rowError) => (
                <li key={rowError}>{rowError}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      {state?.ok ? (
        <p className="font-mono text-[11px] text-positive">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !hasAccounts || missingRequiredMappings}
        className="btn btn-primary self-start"
      >
        {pending ? "Importing…" : "Import transactions"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label-mono">{label}</label>
      {children}
      {hint && !error ? (
        <span className="font-sans text-[11px] text-ink-3">{hint}</span>
      ) : null}
      {error ? (
        <span className="font-mono text-[10px] text-negative">{error}</span>
      ) : null}
    </div>
  );
}

function HeaderMappingField({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  options: HeaderOption[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <Field
      label={`${label}${required ? " *" : ""}`}
      hint={required ? "Required for import." : "Optional."}
    >
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputCls}
      >
        <option value="">{required ? "Select a header" : "Do not map"}</option>
        {options.map((option) => (
          <option key={option.normalized} value={option.normalized}>
            {option.raw}
          </option>
        ))}
      </select>
    </Field>
  );
}

const inputCls =
  "w-full bg-paper border-b border-rule px-3 py-3 font-sans text-[14px] text-ink outline-none focus:border-ink";
