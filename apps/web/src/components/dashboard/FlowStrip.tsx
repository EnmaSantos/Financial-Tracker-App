"use client";

import { CountUp } from "@/components/ui/CountUp";

type Props = {
  monthlyIn: number;
  monthlyOut: number;
  monthlySaved: number;
};

export function FlowStrip({ monthlyIn, monthlyOut, monthlySaved }: Props) {
  const items = [
    { label: "In", value: monthlyIn, tone: "" },
    { label: "Out", value: monthlyOut, tone: "" },
    {
      label: "Saved",
      value: monthlySaved,
      tone: monthlySaved >= 0 ? "text-positive" : "text-negative",
    },
  ];

  return (
    <div
      className="grid grid-cols-3 gap-8 mt-10 py-6 border-y border-rule"
      aria-label="Monthly flow"
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5">
          <div className="label-mono">{item.label}</div>
          <div className={`num text-[20px] ${item.tone}`}>
            <CountUp value={Math.abs(item.value)} duration={1.2} />
          </div>
        </div>
      ))}
    </div>
  );
}
