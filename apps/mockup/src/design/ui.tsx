/**
 * UI primitives — ported from the design's ui.jsx into strict TSX.
 * Inline styles (rather than Tailwind) are preserved because the design
 * leans on CSS variables for theming/accent switching.
 */
import type { CSSProperties, ReactNode, SVGProps } from "react";

export function fmt$(
  n: number,
  opts: { signed?: boolean; decimals?: number; compact?: boolean } = {},
): string {
  const { signed = false, decimals = 0, compact = false } = opts;
  const abs = Math.abs(n);
  let s: string;
  if (compact && abs >= 1_000_000) s = `$${(abs / 1_000_000).toFixed(1)}M`;
  else if (compact && abs >= 1000) s = `$${(abs / 1000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  else
    s = `$${abs.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  if (n < 0) return `−${s}`;
  if (signed && n > 0) return `+${s}`;
  return s;
}

type Tone = "neutral" | "positive" | "negative" | "accent";
const pillColors: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: "var(--paper-3)", fg: "var(--ink-2)" },
  positive: { bg: "var(--positive-soft)", fg: "var(--positive)" },
  negative: { bg: "var(--negative-soft)", fg: "var(--negative)" },
  accent: { bg: "var(--accent-soft)", fg: "var(--accent-ink)" },
};

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const c = pillColors[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        fontFamily: "var(--mono)",
        fontSize: 10,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

export function Kicker({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="label-kicker" style={{ marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

export function Divider({ thick = false, style }: { thick?: boolean; style?: CSSProperties }) {
  return (
    <div
      style={{
        borderTop: `${thick ? 2 : 1}px solid ${thick ? "var(--ink)" : "var(--rule)"}`,
        ...style,
      }}
    />
  );
}

export function IconBtn({
  children,
  onClick,
  title,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "var(--ink)" : "var(--ink-3)",
        background: active ? "var(--paper-3)" : "transparent",
        transition: "all 120ms",
      }}
    >
      {children}
    </button>
  );
}

type IconProps = SVGProps<SVGSVGElement>;
export const Icon = {
  dash: (p: IconProps) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <rect x="1.5" y="1.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="1.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1.5" y="8" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="8" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  accounts: (p: IconProps) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <rect x="1.5" y="3.5" width="11" height="7.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="1.5" y1="6" x2="12.5" y2="6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  goals: (p: IconProps) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  scen: (p: IconProps) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M2 11 L5 7 L8 9 L12 3" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  ),
  timeline: (p: IconProps) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="3.5" cy="7" r="1.5" fill="currentColor" />
      <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="10.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  upload: (p: IconProps) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M7 9 V3 M4 6 L7 3 L10 6" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M2 10 V12 H12 V10" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  ),
  settings: (p: IconProps) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M7 1 V3 M7 11 V13 M1 7 H3 M11 7 H13 M2.5 2.5 L4 4 M10 10 L11.5 11.5 M2.5 11.5 L4 10 M10 4 L11.5 2.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  ),
  plus: (p: IconProps) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...p}>
      <path d="M6 2 V10 M2 6 H10" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  check: (p: IconProps) => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...p}>
      <path d="M2 5 L4 7 L8 3" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </svg>
  ),
  sparkle: (p: IconProps) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...p}>
      <path d="M6 1 L7 5 L11 6 L7 7 L6 11 L5 7 L1 6 L5 5 Z" fill="currentColor" />
    </svg>
  ),
};

export function SectionHead({
  kicker,
  title,
  subtitle,
  right,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 24,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div style={{ flex: 1 }}>
        {kicker && (
          <div className="label-kicker" style={{ marginBottom: 8 }}>
            {kicker}
          </div>
        )}
        <div className="display" style={{ fontSize: 32, lineHeight: 1 }}>
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              color: "var(--ink-3)",
              fontSize: 13,
              marginTop: 6,
              fontFamily: "var(--sans)",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export function BigNumber({
  value,
  label,
  delta,
  size = 56,
  format = fmt$,
  sub,
}: {
  value: number;
  label?: ReactNode;
  delta?: number | null;
  size?: number;
  format?: (n: number) => string;
  sub?: ReactNode;
}) {
  return (
    <div>
      {label && (
        <div className="label-kicker" style={{ marginBottom: 10 }}>
          {label}
        </div>
      )}
      <div className="display num" style={{ fontSize: size, lineHeight: 1 }}>
        {format(value)}
      </div>
      {(delta != null || sub) && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontSize: 12,
            fontFamily: "var(--sans)",
          }}
        >
          {delta != null && (
            <span
              className="num"
              style={{ color: delta >= 0 ? "var(--positive)" : "var(--negative)" }}
            >
              {delta >= 0 ? "↑" : "↓"} {fmt$(Math.abs(delta))}
            </span>
          )}
          {sub && <span style={{ color: "var(--ink-3)" }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

export function Card({
  children,
  style,
  flush,
  kicker,
  title,
  action,
}: {
  children: ReactNode;
  style?: CSSProperties;
  flush?: boolean;
  kicker?: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--paper-2)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--radius-l)",
        padding: flush ? 0 : 24,
        ...style,
      }}
    >
      {(kicker || title) && (
        <header
          style={{
            padding: flush ? "20px 24px 12px" : "0 0 16px",
            borderBottom: flush ? "1px solid var(--rule)" : "none",
            marginBottom: flush ? 0 : 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            {kicker && (
              <div className="label-kicker" style={{ marginBottom: 6 }}>
                {kicker}
              </div>
            )}
            {title && (
              <div style={{ fontFamily: "var(--serif-display)", fontSize: 20, letterSpacing: "-0.01em" }}>
                {title}
              </div>
            )}
          </div>
          {action}
        </header>
      )}
      {flush ? <div style={{ padding: "0 24px 20px" }}>{children}</div> : children}
    </section>
  );
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  format = (v: number) => String(v),
  label,
  sub,
}: {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  label: ReactNode;
  sub?: ReactNode;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <div>
          <div className="label-kicker">{label}</div>
          {sub && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>}
        </div>
        <div className="num" style={{ fontSize: 16, fontFamily: "var(--serif-display)" }}>
          {format(value)}
        </div>
      </div>
      <div style={{ position: "relative", height: 20 }}>
        <div
          style={{
            position: "absolute",
            top: 9,
            left: 0,
            right: 0,
            height: 2,
            background: "var(--rule)",
            borderRadius: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 9,
            left: 0,
            width: `${pct}%`,
            height: 2,
            background: "var(--accent)",
            borderRadius: 1,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 4,
            left: `${pct}%`,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--paper)",
            border: "2px solid var(--ink)",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
