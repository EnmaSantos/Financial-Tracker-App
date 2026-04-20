"use client";

import type { Accent, Theme } from "@ledger/shared";
import { useTheme } from "./ThemeProvider";

const THEMES: Theme[] = ["light", "dark"];
const ACCENTS: Accent[] = ["oxblood", "indigo", "forest", "ochre"];

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-colors",
        on
          ? "bg-ink text-paper border-ink"
          : "bg-paper text-ink-2 border-rule hover:border-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function ThemeSwitcher() {
  const { theme, accent, setTheme, setAccent } = useTheme();

  return (
    <div
      role="region"
      aria-label="Theme controls"
      className="fixed right-4 bottom-4 z-50 p-3.5 rounded-xl border border-rule bg-paper-2"
      style={{ boxShadow: "var(--shadow-2)", minWidth: 260 }}
    >
      <div className="label-kicker mb-2.5">Tweak</div>

      <div className="flex items-center gap-2 mb-2.5">
        <span className="label-mono" style={{ width: 60 }}>
          theme
        </span>
        {THEMES.map((t) => (
          <Chip key={t} on={theme === t} onClick={() => setTheme(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="label-mono" style={{ width: 60 }}>
          accent
        </span>
        {ACCENTS.map((a) => (
          <Chip key={a} on={accent === a} onClick={() => setAccent(a)}>
            {a}
          </Chip>
        ))}
      </div>
    </div>
  );
}
