"use client";

/**
 * Client-side SVG line chart with motion draw-in animation.
 * Renders `data` and optionally a `compareData` dashed baseline
 * for scenario comparisons.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "motion";

type Point = {
  year: number;
  value: number;
  label?: string;
  valueLabel?: string;
};

type Props = {
  data: Point[];
  compareData?: Point[];
  height?: number;
  showBand?: boolean;
  className?: string;
  trendMode?: "standard" | "debt" | "neutral";
};

export function LineChart({
  data,
  compareData,
  height = 260,
  showBand = false,
  className,
  trendMode = "neutral",
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
  const delta = (data[data.length - 1]?.value ?? 0) - (data[0]?.value ?? 0);
  const improved =
    trendMode === "debt"
      ? delta <= 0
      : trendMode === "standard"
        ? delta >= 0
        : null;
  const lineColor =
    improved == null
      ? "var(--color-chart-1)"
      : improved
        ? "var(--color-positive)"
        : "var(--color-negative)";
  const softColor =
    improved == null
      ? "var(--color-accent-soft)"
      : improved
        ? "var(--color-positive-soft)"
        : "var(--color-negative-soft)";

  const projectedPoints = useMemo(
    () =>
      data.map((point) => {
        const [x, y] = project(point);
        return { point, x, y };
      }),
    [data],
  );

  const activePoint =
    activeIndex != null ? projectedPoints[activeIndex] ?? null : null;

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

  useEffect(() => {
    if (data.length === 0) return;
    const svg = svgRef.current;
    if (!svg) return;

    // Animate the main data line with stroke-dashoffset draw-in
    const stops: (() => void)[] = [];

    const mainPath = svg.querySelector<SVGPathElement>("path[data-main-line]");
    if (mainPath) {
      const length = mainPath.getTotalLength();
      mainPath.style.strokeDasharray = `${length}`;
      mainPath.style.strokeDashoffset = `${length}`;
      const controls = animate(length, 0, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => {
          mainPath.style.strokeDashoffset = `${v}`;
        },
      });
      stops.push(() => controls.stop());
    }

    // Fade in compare line
    const comparePath = svg.querySelector<SVGPathElement>("path[data-compare-line]");
    if (comparePath) {
      comparePath.style.opacity = "0";
      const c = animate(0 as number, 1 as number, {
        duration: 1.0, delay: 0.3, ease: "easeOut",
        onUpdate: (v) => { comparePath.style.opacity = `${v}`; },
      });
      stops.push(() => c.stop());
    }

    // Fade in the area band
    const band = svg.querySelector<SVGPathElement>("path[data-band]");
    if (band) {
      band.style.opacity = "0";
      const c = animate(0 as number, 0.5 as number, {
        duration: 1.2, delay: 0.6, ease: "easeOut",
        onUpdate: (v) => { band.style.opacity = `${v}`; },
      });
      stops.push(() => c.stop());
    }

    // Fade in endpoint dot
    const dot = svg.querySelector<SVGCircleElement>("circle[data-dot]");
    if (dot) {
      dot.style.opacity = "0";
      const c = animate(0 as number, 1 as number, {
        duration: 0.4, delay: 1.6, ease: "easeOut",
        onUpdate: (v) => { dot.style.opacity = `${v}`; },
      });
      stops.push(() => c.stop());
    }

    return () => stops.forEach((s) => s());
  }, [data, compareData]);

  if (data.length === 0) return null;

  return (
    <div
      ref={frameRef}
      className={className}
      style={{ position: "relative", width: "100%", height }}
      onMouseLeave={() => setActiveIndex(null)}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height }}
        role="img"
        onMouseMove={(event) => {
          const frame = frameRef.current;
          if (!frame || projectedPoints.length === 0) return;
          const rect = frame.getBoundingClientRect();
          const ratio = width / Math.max(rect.width, 1);
          const x = (event.clientX - rect.left) * ratio;

          let nearestIndex = 0;
          let nearestDistance = Number.POSITIVE_INFINITY;

          projectedPoints.forEach((entry, index) => {
            const distance = Math.abs(entry.x - x);
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestIndex = index;
            }
          });

          setActiveIndex(nearestIndex);
        }}
      >
        {showBand && (
          <path
            data-band
            d={toArea(data)}
            fill={softColor}
            opacity={0.5}
          />
        )}
        {compareData && (
          <path
            data-compare-line
            d={toPath(compareData)}
            fill="none"
            stroke="var(--color-chart-ghost)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        )}
        <path
          data-main-line
          d={toPath(data)}
          fill="none"
          stroke={lineColor}
          strokeWidth={2}
        />
        {activePoint ? (
          <>
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={padY}
              y2={height - padY}
              stroke="var(--color-rule)"
              strokeDasharray="4 4"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r={4}
              fill="var(--color-paper)"
              stroke={lineColor}
              strokeWidth={2}
            />
          </>
        ) : null}
        {(() => {
          const last = data[data.length - 1]!;
          const [x, y] = project(last);
          return (
            <circle
              data-dot
              cx={x}
              cy={y}
              r={3.5}
              fill="var(--color-paper)"
              stroke={lineColor}
              strokeWidth={2}
            />
          );
        })()}
      </svg>

      {activePoint ? (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-rule bg-paper px-3 py-2 shadow-[var(--shadow-1)]"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: Math.max(((activePoint.y / height) * 100) - 18, 4) + "%",
            transform: "translate(-50%, -100%)",
            minWidth: 120,
          }}
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
            {activePoint.point.label ?? activePoint.point.year}
          </div>
          <div className="num mt-1 text-[14px] text-ink">
            {activePoint.point.valueLabel ?? activePoint.point.value.toLocaleString()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
