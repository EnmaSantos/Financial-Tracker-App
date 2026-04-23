"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { TxnCategory } from "@ledger/shared";
import {
  createTransaction,
  type TransactionCreateResult,
} from "@/app/actions/transactions";

const initialState: TransactionCreateResult = null;
const today = new Date().toISOString().slice(0, 10);

export function AddTransactionForm({
  accounts,
}: {
  accounts: Array<{ id: string; name: string; institution: string }>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [direction, setDirection] = useState<"expense" | "income">("expense");
  const [state, formAction, pending] = useActionState(
    createTransaction,
    initialState,
  );
  const hasAccounts = accounts.length > 0;

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setDirection("expense");
    }
  }, [state]);

  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <div className="rounded-xl border border-rule bg-paper-2 px-4 py-4 font-sans text-[12px] leading-6 text-ink-3">
        Start by entering transactions by hand. Every transaction must be attached to
        one of your accounts. Expenses are stored as money out, and income is stored as
        money in.
      </div>

      {!hasAccounts ? (
        <p className="font-mono text-[11px] text-negative">
          Add an account first before creating transactions.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" error={fieldErrors.date}>
          <input
            name="date"
            type="date"
            required
            defaultValue={today}
            className={inputCls}
            disabled={!hasAccounts}
          />
        </Field>

        <Field label="Category" error={fieldErrors.category}>
          <select
            name="category"
            defaultValue="other"
            className={inputCls}
            disabled={!hasAccounts}
          >
            {TxnCategory.options.map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Merchant" error={fieldErrors.merchant}>
        <input
          name="merchant"
          required
          placeholder="e.g. Trader Joe's"
          className={inputCls}
          disabled={!hasAccounts}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,180px)]">
        <Field
          label="Account"
          error={fieldErrors.accountId}
          hint="Every transaction must be tied to one of your accounts."
        >
          <select
            name="accountId"
            defaultValue=""
            className={inputCls}
            disabled={!hasAccounts}
            required
          >
            <option value="" disabled>
              Select an account
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.institution} · {account.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Amount" error={fieldErrors.amount}>
          <div className="flex items-center gap-2">
            <span className="font-mono text-ink-3">$</span>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              className={inputCls}
              disabled={!hasAccounts}
            />
          </div>
        </Field>
      </div>

      <Field
        label="Direction"
        error={fieldErrors.direction}
        hint="Use money out for spending and money in for paychecks, refunds, or deposits."
      >
        <div className="grid grid-cols-2 gap-2">
          {([
            ["expense", "Money out"],
            ["income", "Money in"],
          ] as const).map(([value, label]) => (
            <label key={value} className="block">
              <input
                type="radio"
                name="direction"
                value={value}
                checked={direction === value}
                onChange={() => setDirection(value)}
                className="sr-only"
                disabled={!hasAccounts}
              />
              <div
                className={[
                  "rounded-md border px-3 py-2 text-center font-mono text-[11px] uppercase tracking-wider transition-colors",
                  direction === value
                    ? "border-ink bg-ink text-paper"
                    : "border-rule text-ink-2 hover:border-ink",
                ].join(" ")}
              >
                {label}
              </div>
            </label>
          ))}
        </div>
      </Field>

      {state && !state.ok ? (
        <p className="font-mono text-[11px] text-negative">{state.error}</p>
      ) : null}

      {state?.ok ? (
        <p className="font-mono text-[11px] text-positive">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !hasAccounts}
        className="btn btn-primary self-start"
      >
        {pending ? "Saving…" : "Add transaction"}
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
