"use client";

import { formatCurrency } from "@/lib/utils";

interface SpendingSummaryProps {
  thisMonth: number;
  lastMonth: number;
}

export function SpendingSummary({
  thisMonth,
  lastMonth,
}: SpendingSummaryProps) {
  const maxVal = Math.max(thisMonth, lastMonth, 1);
  const thisPercent = (thisMonth / maxVal) * 100;
  const lastPercent = (lastMonth / maxVal) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">This Month</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(thisMonth)}
          </span>
        </div>
        <div className="h-3 w-full rounded-[4px] bg-slate-100">
          <div
            className="h-full rounded-[4px] bg-navy transition-all duration-500"
            style={{ width: `${thisPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Last Month</span>
          <span className="font-semibold tabular-nums text-slate-500">
            {formatCurrency(lastMonth)}
          </span>
        </div>
        <div className="h-3 w-full rounded-[4px] bg-slate-100">
          <div
            className="h-full rounded-[4px] bg-slate-300 transition-all duration-500"
            style={{ width: `${lastPercent}%` }}
          />
        </div>
      </div>

      {lastMonth > 0 && (
        <div className="rounded-[4px] bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">
            {thisMonth > lastMonth ? (
              <>
                You&apos;re spending{" "}
                <span className="font-semibold text-danger">
                  {formatCurrency(thisMonth - lastMonth)} more
                </span>{" "}
                than last month
              </>
            ) : (
              <>
                You&apos;re spending{" "}
                <span className="font-semibold text-success">
                  {formatCurrency(lastMonth - thisMonth)} less
                </span>{" "}
                than last month
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
