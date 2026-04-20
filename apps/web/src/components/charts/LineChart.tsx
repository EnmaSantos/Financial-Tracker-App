/**
 * Server-safe SVG line chart. Renders `data` and optionally a `compareData`
 * dashed baseline for scenario comparisons. No interactivity — pure markup.
 */

type Point = { year: number; value: number };

type Props = {
  data: Point[];
  compareData?: Point[];
  height?: number;
  showBand?: boolean;
  className?: string;
};

export function LineChart({
  data,
  compareData,
  height = 260,
  showBand = false,
  className,
}: Props) {
  if (data.length === 0) return null;

  const width = 640; // viewBox — scales via CSS
  const padX = 24;
  const padY = 16;

  const allPoints = compareData ? [...data, ...compareData] : data;
  const minYear = Math.min(...allPoints.map((p) => p.year));
  const maxYear = Math.max(...allPoints.map((p) => p.year));
  const minValue = Math.min(0, ...allPoints.map((p) => p.value));
  const maxValue = Math.max(...allPoints.map((p) => p.value));

  const spanX = Math.max(1, maxYear - minYear);
  const spanY = Math.max(1, maxValue - minValue);

  function project(p: Point): [number, number] {
    const x = padX + ((p.year - minYear) / spanX) * (width - padX * 2);
    const y =
      height - padY - ((p.value - minValue) / spanY) * (height - padY * 2);
    return [x, y];
  }

  function toPath(pts: Point[]): string {
    return pts
      .map((p, i) => {
        const [x, y] = project(p);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  function toArea(pts: Point[]): string {
    if (pts.length === 0) return "";
    const [x0] = project(pts[0]!);
    const [xn] = project(pts[pts.length - 1]!);
    const base = height - padY;
    return `${toPath(pts)} L${xn.toFixed(1)},${base} L${x0.toFixed(1)},${base} Z`;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: "100%", height }}
      role="img"
    >
      {showBand && (
        <path d={toArea(data)} fill="var(--color-accent-soft)" opacity={0.5} />
      )}
      {compareData && (
        <path
          d={toPath(compareData)}
          fill="none"
          stroke="var(--color-chart-ghost)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      )}
      <path
        d={toPath(data)}
        fill="none"
        stroke="var(--color-chart-1)"
        strokeWidth={2}
      />
      {/* endpoint dot */}
      {(() => {
        const last = data[data.length - 1]!;
        const [x, y] = project(last);
        return (
          <circle
            cx={x}
            cy={y}
            r={3.5}
            fill="var(--color-paper)"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
          />
        );
      })()}
    </svg>
  );
}
