import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "negative" | "accent";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-paper-3 text-ink-2",
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
  accent: "bg-accent-soft text-accent-ink",
};

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "font-mono text-[10px] uppercase tracking-wider font-medium",
        toneClasses[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
