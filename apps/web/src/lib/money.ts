export function fmt$(
  n: number,
  opts: { signed?: boolean; decimals?: number; compact?: boolean } = {},
): string {
  const { signed = false, decimals = 0, compact = false } = opts;
  const abs = Math.abs(n);
  let s: string;
  if (compact && abs >= 1_000_000) s = `$${(abs / 1_000_000).toFixed(1)}M`;
  else if (compact && abs >= 1000)
    s = `$${(abs / 1000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  else
    s = `$${abs.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  if (n < 0) return `−${s}`;
  if (signed && n > 0) return `+${s}`;
  return s;
}
