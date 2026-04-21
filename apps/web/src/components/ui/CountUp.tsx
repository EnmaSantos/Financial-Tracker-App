"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion";
import { fmt$ } from "@/lib/money";

type Props = {
  value: number;
  className?: string;
  duration?: number;
};

/**
 * Animates a dollar value counting up (or down) from zero on mount.
 */
export function CountUp({ value, className, duration = 1.4 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (el) el.textContent = fmt$(v);
      },
    });
    return () => controls.stop();
    // Re-run only when the value changes (e.g. data refresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {fmt$(value)}
    </span>
  );
}
