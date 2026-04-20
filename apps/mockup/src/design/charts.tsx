/**
 * Chart primitives — ported from the design's charts.jsx. Hand-tuned SVG
 * rather than a charting library so the line weights and ticks match the
 * editorial feel exactly.
 */
import { useEffect, useRef, useState } from "react";

type Point = { year: number; value: number };

export function smoothPath(pts: { x: number; y: number }[], tension = 0.35): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function LineChart({
  data,
  width = 640,
  height = 260,
  pad = 32,
  showBand = true,
  handleYear,
  onHandleChange,
  compareData = null,
  style = "line",
  yDomain = null,
}: {
  data: Point[];
  width?: number;
  height?: number;
  pad?: number;
  showBand?: boolean;
  handleYear?: number | null;
  onHandleChange?: (y: number) => void;
  compareData?: Point[] | null;
  style?: "line" | "area";
  yDomain?: [number, number] | null;
}) {
  const allValues = [...data.map((d) => d.value), ...(compareData?.map((d) => d.value) ?? [])];
  const yMin = yDomain ? yDomain[0] : 0;
  const yMax = yDomain ? yDomain[1] : Math.max(...allValues) * 1.08;
  const xMin = data[0]!.year;
  const xMax = data[data.length - 1]!.year;

  const xScale = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - pad * 2);
  const yScale = (y: number) =>
    height - pad - ((y - yMin) / (yMax - yMin)) * (height - pad * 2);

  const pts = data.map((d) => ({ x: xScale(d.year), y: yScale(d.value) }));
  const cpts = compareData ? compareData.map((d) => ({ x: xScale(d.year), y: yScale(d.value) })) : null;

  const bandPts = data.map((d, i) => {
    const variance = Math.pow(i / data.length, 1.4) * 0.22;
    return {
      x: xScale(d.year),
      yUpper: yScale(d.value * (1 + variance)),
      yLower: yScale(d.value * (1 - variance)),
    };
  });
  const first = bandPts[0]!;
  const last = bandPts[bandPts.length - 1]!;
  const bandPath =
    `M ${first.x} ${first.yUpper} ` +
    bandPts.slice(1).map((p) => `L ${p.x} ${p.yUpper}`).join(" ") +
    ` L ${last.x} ${last.yLower} ` +
    bandPts
      .slice(0, -1)
      .reverse()
      .map((p) => `L ${p.x} ${p.yLower}`)
      .join(" ") +
    " Z";

  const linePath = smoothPath(pts);
  const comparePath = cpts ? smoothPath(cpts) : null;
  const areaPath =
    linePath + ` L ${pts[pts.length - 1]!.x} ${height - pad} L ${pts[0]!.x} ${height - pad} Z`;

  const handleX = handleYear != null ? xScale(handleYear) : null;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragging || !onHandleChange) return;
    const mv = (e: PointerEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const xPct = Math.max(
        0,
        Math.min(1, ((e.clientX - rect.left) / rect.width - pad / width) / (1 - (2 * pad) / width)),
      );
      const year = Math.round(xMin + xPct * (xMax - xMin));
      onHandleChange(Math.max(xMin, Math.min(xMax, year)));
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, onHandleChange, pad, width, xMax, xMin]);

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / yTicks);
  const xTickStep = Math.ceil((xMax - xMin) / 6);
  const xTicks: number[] = [];
  for (let y = xMin; y <= xMax; y += xTickStep) xTicks.push(y);

  const fmtK = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1)}M`;
    if (v >= 1_000) return `$${Math.round(v / 1_000)}k`;
    return `$${v}`;
  };

  const handleValue = data.find((d) => d.year === handleYear)?.value ?? data[0]!.value;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad}
            x2={width - pad}
            y1={yScale(t)}
            y2={yScale(t)}
            stroke="var(--rule-2)"
            strokeWidth="1"
            strokeDasharray={i === 0 ? "0" : "2 3"}
          />
          <text
            x={pad - 8}
            y={yScale(t) + 3}
            fontSize="9"
            fontFamily="var(--mono)"
            fill="var(--ink-3)"
            textAnchor="end"
          >
            {fmtK(t)}
          </text>
        </g>
      ))}
      {xTicks.map((x, i) => (
        <text
          key={i}
          x={xScale(x)}
          y={height - pad + 14}
          fontSize="9"
          fontFamily="var(--mono)"
          fill="var(--ink-3)"
          textAnchor="middle"
        >
          {x}
        </text>
      ))}

      {showBand && style === "line" && <path d={bandPath} fill="var(--accent)" opacity="0.08" />}

      {comparePath && (
        <path
          d={comparePath}
          fill="none"
          stroke="var(--chart-ghost)"
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
      )}

      {style === "area" ? (
        <>
          <path d={areaPath} fill="var(--accent)" opacity="0.1" />
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" />
        </>
      ) : (
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" />
      )}

      {handleX != null && (
        <g>
          <line
            x1={handleX}
            x2={handleX}
            y1={pad}
            y2={height - pad}
            stroke="var(--ink)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <circle
            cx={handleX}
            cy={yScale(handleValue)}
            r="7"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="2"
            style={{ cursor: "ew-resize" }}
            onPointerDown={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
          />
        </g>
      )}
    </svg>
  );
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "var(--ink-2)",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const yMin = Math.min(...data);
  const yMax = Math.max(...data);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - yMin) / (yMax - yMin || 1)) * height * 0.8 - height * 0.1,
  }));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width, height, display: "block" }}>
      <path d={smoothPath(pts)} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function GoalArc({
  progress,
  size = 72,
  stroke = 6,
  color = "var(--accent)",
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--rule)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${c * p} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function StackedBar({
  segments,
  height = 10,
}: {
  segments: { value: number; color: string }[];
  height?: number;
}) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  let x = 0;
  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height, display: "block" }}
    >
      {segments.map((s, i) => {
        const w = (s.value / total) * 100;
        const r = <rect key={i} x={x} y={0} width={w - 0.5} height={height} fill={s.color} rx="1" />;
        x += w;
        return r;
      })}
    </svg>
  );
}

export function MilestoneTimeline({
  milestones,
  currentYear = new Date().getFullYear(),
  onHover,
}: {
  milestones: { year: number; label: string; value: number }[];
  currentYear?: number;
  onHover?: (m: { year: number; label: string; value: number } | null) => void;
}) {
  if (milestones.length === 0) return null;
  const minY = currentYear;
  const maxY = milestones[milestones.length - 1]!.year;
  const getX = (y: number) => ((y - minY) / (maxY - minY || 1)) * 100;
  return (
    <div style={{ position: "relative", padding: "8px 4px 40px", width: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 0,
          right: 0,
          height: 1,
          background: "var(--rule)",
        }}
      />
      {milestones.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${getX(m.year)}%`,
            top: 0,
            transform: "translateX(-50%)",
            textAlign: "center",
            width: 110,
          }}
          onMouseEnter={() => onHover?.(m)}
          onMouseLeave={() => onHover?.(null)}
        >
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 4 }}>
            {m.year}
          </div>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: i === 0 ? "var(--accent)" : "var(--paper)",
              border: "2px solid var(--ink)",
              margin: "0 auto",
            }}
          />
          <div
            style={{
              fontFamily: "var(--serif-text)",
              fontSize: 11,
              color: "var(--ink)",
              marginTop: 8,
              lineHeight: 1.2,
            }}
          >
            {m.label}
          </div>
          <div className="num" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
            ${(m.value / 1000).toFixed(0)}k
          </div>
        </div>
      ))}
    </div>
  );
}
