"use client";

import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface SpendingVelocityProps {
  last30: number;
  prev30: number;
  last30Count: number;
  prev30Count: number;
}

export function SpendingVelocity({
  last30,
  prev30,
  last30Count,
  prev30Count,
}: SpendingVelocityProps) {
  const delta = prev30 > 0 ? ((last30 - prev30) / prev30) * 100 : 0;
  const maxVal = Math.max(last30, prev30, 1);

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Last 30 Days</p>
        <p className="text-2xl font-bold font-[family-name:var(--font-heading)] tabular-nums">
          {formatCurrency(last30)}
        </p>
        <p className="text-xs text-muted-foreground">
          {last30Count} transactions
        </p>
        <div className="h-2 w-full rounded-[4px] bg-slate-100">
          <div
            className="h-full rounded-[4px] bg-navy transition-all duration-500"
            style={{ width: `${(last30 / maxVal) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Previous 30 Days
        </p>
        <p className="text-2xl font-bold font-[family-name:var(--font-heading)] tabular-nums text-slate-500">
          {formatCurrency(prev30)}
        </p>
        <p className="text-xs text-muted-foreground">
          {prev30Count} transactions
        </p>
        <div className="h-2 w-full rounded-[4px] bg-slate-100">
          <div
            className="h-full rounded-[4px] bg-slate-300 transition-all duration-500"
            style={{ width: `${(prev30 / maxVal) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-[4px] bg-slate-50 p-4">
        <div className="flex items-center gap-1">
          {delta > 2 ? (
            <ArrowUpRight className="h-5 w-5 text-danger" />
          ) : delta < -2 ? (
            <ArrowDownRight className="h-5 w-5 text-success" />
          ) : (
            <Minus className="h-5 w-5 text-slate-400" />
          )}
          <span
            className={`text-2xl font-bold tabular-nums ${
              delta > 2
                ? "text-danger"
                : delta < -2
                  ? "text-success"
                  : "text-slate-500"
            }`}
          >
            {Math.abs(delta).toFixed(1)}%
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {delta > 2 ? "Spending up" : delta < -2 ? "Spending down" : "Stable"}
        </p>
      </div>
    </div>
  );
}
