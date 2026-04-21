"use client";

import { Pill } from "@/components/ui/Pill";
import { CountUp } from "@/components/ui/CountUp";
import { fmt$ } from "@/lib/money";

type Props = {
  netWorth: number;
  monthlySaved: number;
  savingsRate: number;
};

export function NetWorthHero({ netWorth, monthlySaved, savingsRate }: Props) {
  const saving = monthlySaved >= 0;
  return (
    <div>
      <div className="label-kicker">Net worth · today</div>
      <div className="display num hero-number mt-3">
        <CountUp value={netWorth} />
      </div>
      <div className="stats-row mt-6">
        <Pill tone={saving ? "positive" : "negative"}>
          {saving ? "↑" : "↓"}{" "}
          <CountUp value={Math.abs(monthlySaved)} duration={1.2} /> · this month
        </Pill>
        <span className="text-ink-3 font-sans text-xs">
          saving rate {(savingsRate * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
