import type { SVGProps } from "react";

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
  debt: (p: IconProps) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M2 3 H12 V11 H2 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" />
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
};
