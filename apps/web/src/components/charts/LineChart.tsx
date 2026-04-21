"use client";

/**
 * Client-side SVG line chart with motion draw-in animation.
 * Renders `data` and optionally a `compareData` dashed baseline
 * for scenario comparisons.
 */

import { useEffect, useRef } from "react";
import { animate } from "motion";

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
  const svgRef = useRef<SVGSVGElement>(null);

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
  }, [data, compareData]); // eslint-disable-line react-hooks/exhaustive-deps

  if (data.length === 0) return null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: "100%", height }}
      role="img"
    >
      {showBand && (
        <path
          data-band
          d={toArea(data)}
          fill="var(--color-accent-soft)"
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
        stroke="var(--color-chart-1)"
        strokeWidth={2}
      />
      {/* endpoint dot */}
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
            stroke="var(--color-chart-1)"
            strokeWidth={2}
          />
        );
      })()}
    </svg>
  );
}
