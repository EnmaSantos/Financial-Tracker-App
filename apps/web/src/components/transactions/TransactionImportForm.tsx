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
  transactionId: ["transactionid", "id", "reference", "receiptid"],
  balance: ["balance", "runningbalance", "endingbalance", "availablebalance"],
} as const;
type HeaderOption = {
  raw: string;
  normalized: string;
};
type ImportPreset = {
  id: string;
  name: string;
  mappingDate: string;
  mappingMerchant: string;
  mappingAmount: string;
  mappingCategory: string | null;
  mappingAccount: string | null;
  mappingTransactionId: string | null;
  mappingBalance: string | null;
  fallbackAccountId: string | null;
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

function hasHeaderOption(options: HeaderOption[], value: string) {
  return options.some((option) => option.normalized === value);
}

export function TransactionImportForm({
  accounts,
  presets,
}: {
  accounts: Array<{ id: string; name: string; institution: string }>;
  presets: ImportPreset[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    importTransactions,
    initialState,
  );
  const hasAccounts = accounts.length > 0;
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [headerOptions, setHeaderOptions] = useState<HeaderOption[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [mappingDate, setMappingDate] = useState("");
  const [mappingMerchant, setMappingMerchant] = useState("");
  const [mappingAmount, setMappingAmount] = useState("");
  const [mappingCategory, setMappingCategory] = useState("");
  const [mappingAccount, setMappingAccount] = useState("");
  const [mappingTransactionId, setMappingTransactionId] = useState("");
  const [mappingBalance, setMappingBalance] = useState("");
  const [fallbackAccountId, setFallbackAccountId] = useState("");
  const [savePreset, setSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setHeaderOptions([]);
      setHeaderError(null);
      setSelectedPresetId("");
      setMappingDate("");
      setMappingMerchant("");
      setMappingAmount("");
      setMappingCategory("");
      setMappingAccount("");
      setMappingTransactionId("");
      setMappingBalance("");
      setFallbackAccountId("");
      setSavePreset(false);
      setPresetName("");
    }
  }, [state]);

  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const shouldShowHeaderMapping = headerOptions.length > 0;
  const hasValidDateMapping = mappingDate && hasHeaderOption(headerOptions, mappingDate);
  const hasValidMerchantMapping =
    mappingMerchant && hasHeaderOption(headerOptions, mappingMerchant);
  const hasValidAmountMapping = mappingAmount && hasHeaderOption(headerOptions, mappingAmount);
  const missingRequiredMappings =
    shouldShowHeaderMapping &&
    (!hasValidDateMapping || !hasValidMerchantMapping || !hasValidAmountMapping);
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) ?? null;

  function applyPreset(preset: ImportPreset | null) {
    if (!preset) {
      setMappingDate("");
      setMappingMerchant("");
      setMappingAmount("");
      setMappingCategory("");
      setMappingAccount("");
      setMappingTransactionId("");
      setMappingBalance("");
      setFallbackAccountId("");
      setPresetName("");
      return;
    }

    setMappingDate(preset.mappingDate);
    setMappingMerchant(preset.mappingMerchant);
    setMappingAmount(preset.mappingAmount);
    setMappingCategory(preset.mappingCategory ?? "");
    setMappingAccount(preset.mappingAccount ?? "");
    setMappingTransactionId(preset.mappingTransactionId ?? "");
    setMappingBalance(preset.mappingBalance ?? "");
    setFallbackAccountId(
      preset.fallbackAccountId &&
        accounts.some((account) => account.id === preset.fallbackAccountId)
        ? preset.fallbackAccountId
        : "",
    );
    setPresetName(preset.name);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      setHeaderOptions([]);
      setHeaderError(null);
      setSelectedPresetId("");
      setMappingDate("");
      setMappingMerchant("");
      setMappingAmount("");
      setMappingCategory("");
      setMappingAccount("");
      setMappingTransactionId("");
      setMappingBalance("");
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
      if (selectedPreset) {
        applyPreset(selectedPreset);
      } else {
        setMappingDate(guessHeader(options, HEADER_ALIASES.date));
        setMappingMerchant(guessHeader(options, HEADER_ALIASES.merchant));
        setMappingAmount(guessHeader(options, HEADER_ALIASES.amount));
        setMappingCategory(guessHeader(options, HEADER_ALIASES.category));
        setMappingAccount(guessHeader(options, HEADER_ALIASES.account));
        setMappingTransactionId(guessHeader(options, HEADER_ALIASES.transactionId));
        setMappingBalance(guessHeader(options, HEADER_ALIASES.balance));
      }
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

      {presets.length > 0 ? (
        <Field
          label="Saved preset"
          hint="Apply a saved provider mapping before you import."
        >
          <select
            value={selectedPresetId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedPresetId(nextId);
              applyPreset(presets.find((preset) => preset.id === nextId) ?? null);
            }}
            className={inputCls}
            disabled={!hasAccounts}
          >
            <option value="">No preset</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </Field>
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
              Match the date, merchant, and amount columns to headers that exist in this CSV
              before importing.
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
            <HeaderMappingField
              label="Transaction ID"
              name="mappingTransactionId"
              value={mappingTransactionId}
              options={headerOptions}
              onChange={setMappingTransactionId}
            />
            <HeaderMappingField
              label="Balance"
              name="mappingBalance"
              value={mappingBalance}
              options={headerOptions}
              onChange={setMappingBalance}
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
          value={fallbackAccountId}
          onChange={(event) => setFallbackAccountId(event.target.value)}
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

      <div className="flex flex-col gap-3 rounded-xl border border-rule bg-paper-2 px-4 py-4">
        <label className="flex items-center gap-3 font-sans text-[13px] text-ink">
          <input
            type="checkbox"
            name="savePreset"
            checked={savePreset}
            onChange={(event) => {
              const checked = event.target.checked;
              setSavePreset(checked);
              if (!checked && !selectedPreset) {
                setPresetName("");
              }
            }}
            disabled={!hasAccounts}
          />
          Save or update this mapping as a preset
        </label>

        <Field
          label="Preset name"
          error={fieldErrors.presetName}
          hint="Examples: PayPal export, Chase checking, Stripe payouts."
        >
          <input
            name="presetName"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
            placeholder="e.g. PayPal export"
            className={inputCls}
            disabled={!hasAccounts || !savePreset}
          />
        </Field>
      </div>

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
