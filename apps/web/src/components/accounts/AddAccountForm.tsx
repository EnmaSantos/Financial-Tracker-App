"use client";

import { useActionState, useState } from "react";
import type { ActionResult } from "@/app/actions/accounts";
import { createAccount } from "@/app/actions/accounts";

const initialState: ActionResult | null = null;

async function submit(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return createAccount(formData);
}

export function AddAccountForm({ onDone }: { onDone?: () => void }) {
  const [state, formAction, pending] = useActionState(submit, initialState);
  const [type, setType] = useState<"cash" | "investment" | "debt">("cash");

  // Close on success.
  if (state?.ok && onDone) {
    queueMicrotask(onDone);
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Name" error={fieldErrors.name}>
        <input
          name="name"
          required
          placeholder="e.g. Checking"
          className={inputCls}
        />
      </Field>

      <Field label="Institution" error={fieldErrors.institution}>
        <input
          name="institution"
          required
          placeholder="e.g. Chase"
          className={inputCls}
        />
      </Field>

      <Field label="Type" error={fieldErrors.type}>
        <div className="flex gap-2">
          {(["cash", "investment", "debt"] as const).map((t) => (
            <label key={t} className="flex-1">
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => setType(t)}
                className="sr-only peer"
              />
              <div
                className={[
                  "cursor-pointer text-center font-mono text-[11px] uppercase tracking-wider py-2 rounded-md border",
                  type === t
                    ? "border-ink bg-ink text-paper"
                    : "border-rule text-ink-2 hover:border-ink",
                ].join(" ")}
              >
                {t}
              </div>
            </label>
          ))}
        </div>
      </Field>

      <Field
        label={type === "debt" ? "Balance owed" : "Balance"}
        error={fieldErrors.balance}
        hint={type === "debt" ? "Enter a positive number — we'll record it as owed." : undefined}
      >
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-ink-3">$</span>
          <input
            name="balance"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue="0"
            className={inputCls}
          />
        </div>
      </Field>

      {type === "debt" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="APR %" error={fieldErrors.apr}>
            <input
              name="apr"
              type="number"
              step="0.01"
              min="0"
              placeholder="22.99"
              className={inputCls}
            />
          </Field>
          <Field label="Monthly payment" error={fieldErrors.monthly}>
            <input
              name="monthly"
              type="number"
              step="0.01"
              min="0"
              placeholder="250"
              className={inputCls}
            />
          </Field>
        </div>
      )}

      {state && !state.ok && !Object.keys(fieldErrors).length && (
        <p className="font-mono text-[11px] text-negative">{state.error}</p>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            disabled={pending}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Add account"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "flex-1 w-full px-2 py-1.5 bg-paper border-b border-rule focus:border-ink focus:outline-none font-sans text-[14px] text-ink placeholder:text-ink-3";

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
    <div className="flex flex-col gap-1.5">
      <label className="label-mono">{label}</label>
      {children}
      {hint && !error && (
        <span className="font-sans text-[11px] text-ink-3">{hint}</span>
      )}
      {error && (
        <span className="font-mono text-[10px] text-negative">{error}</span>
      )}
    </div>
  );
}
