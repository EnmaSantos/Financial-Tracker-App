/**
 * Client-side UI state — theme/accent/layout toggles persist locally.
 * These map 1:1 to the TweakPanel in the design.
 */
import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Accent, DashboardLayout, Theme } from "@ledger/shared";

type AppState = {
  theme: Theme;
  accent: Accent;
  layout: DashboardLayout;
  userId: string;
  setTheme: (t: Theme) => void;
  setAccent: (a: Accent) => void;
  setLayout: (l: DashboardLayout) => void;
  setUserId: (id: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "light",
      accent: "oxblood",
      layout: "editorial",
      userId: "maya",
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setLayout: (layout) => set({ layout }),
      setUserId: (userId) => set({ userId }),
    }),
    { name: "ledger-ui" },
  ),
);

/** Apply theme + accent as data-attrs on <html> so tokens.css can pick them up. */
export function useApplyTheme() {
  const theme = useAppStore((s) => s.theme);
  const accent = useAppStore((s) => s.accent);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset["theme"] = theme;
    root.dataset["accent"] = accent;
  }, [theme, accent]);
}
