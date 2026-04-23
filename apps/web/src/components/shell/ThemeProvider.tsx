"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Accent, Theme } from "@ledger/shared";

type ThemeContextValue = {
  theme: Theme;
  accent: Accent;
  setTheme: (t: Theme) => void;
  setAccent: (a: Accent) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "equitas-ui";
const DEFAULT_THEME: Theme = "light";
const DEFAULT_ACCENT: Accent = "oxblood";

type StoredPrefs = { theme?: Theme; accent?: Accent };

function readStored(): StoredPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredPrefs;
  } catch {
    return {};
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => readStored().theme ?? DEFAULT_THEME,
  );
  const [accent, setAccentState] = useState<Accent>(
    () => readStored().accent ?? DEFAULT_ACCENT,
  );

  // Apply to <html> + persist.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.accent = accent;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ theme, accent }),
      );
    } catch {
      /* ignore quota errors */
    }
  }, [theme, accent]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accent,
        setTheme: setThemeState,
        setAccent: setAccentState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
