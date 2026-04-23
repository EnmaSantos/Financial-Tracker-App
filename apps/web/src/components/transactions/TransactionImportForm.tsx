"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  importTransactions,
  type TransactionImportResult,
} from "@/app/actions/transactions";

const initialState: TransactionImportResult = null;

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

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};

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
        <span className="font-mono text-ink">category</span> and{" "}
        <span className="font-mono text-ink">account</span> are optional.
      </div>

      <Field label="CSV file" error={fieldErrors.file}>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="w-full font-sans text-[13px] text-ink file:mr-4 file:border-0 file:bg-paper-3 file:px-3 file:py-2 file:font-sans file:text-[12px] file:text-ink"
        />
      </Field>

      <Field
        label="Default account (optional)"
        error={fieldErrors.accountId}
        hint="Used when the CSV does not include an account column."
      >
        <select name="accountId" defaultValue="" className={inputCls}>
          <option value="">Leave transactions unassigned</option>
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

      <button type="submit" disabled={pending} className="btn btn-primary self-start">
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

const inputCls =
  "w-full bg-paper border-b border-rule px-3 py-3 font-sans text-[14px] text-ink outline-none focus:border-ink";
