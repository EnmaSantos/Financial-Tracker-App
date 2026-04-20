/**
 * App shell — Sidebar nav and TweakPanel. Ported from the design's app.jsx,
 * wired to our zustand store instead of local `data`/setData props.
 */
import type { CSSProperties, ReactNode } from "react";
import { NavLink } from "react-router";
import type { Accent, DashboardLayout, Theme } from "@ledger/shared";
import { Icon } from "./ui";
import { useAppStore } from "../state/app";

const NAV: { to: string; label: string; icon: keyof typeof Icon }[] = [
  { to: "/", label: "Dashboard", icon: "dash" },
  { to: "/accounts", label: "Accounts", icon: "accounts" },
  { to: "/goals", label: "Goals", icon: "goals" },
  { to: "/scenarios", label: "Scenarios", icon: "scen" },
  { to: "/timeline", label: "Timeline", icon: "timeline" },
  { to: "/upload", label: "Upload", icon: "upload" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

export function Sidebar() {
  const userId = useAppStore((s) => s.userId);
  // We could fetch the user name, but for a prototype, a simple mapping is fine
  const names: Record<string, string> = { maya: "Maya Chen", david: "David Park", linda: "Linda Rossi" };

  return (
    <nav
      style={{
        width: 220,
        minWidth: 220,
        padding: "32px 20px",
        borderRight: "1px solid var(--rule)",
        background: "var(--paper-2)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--serif-display)",
            fontSize: 26,
            letterSpacing: "-0.02em",
          }}
        >
          Equitas
        </div>
        <div className="label-mono" style={{ marginTop: 4 }}>
          a quiet record
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((n) => {
          const IconEl = Icon[n.icon];
          return (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 6,
                fontFamily: "var(--sans)",
                fontSize: 13,
                color: isActive ? "var(--ink)" : "var(--ink-2)",
                background: isActive ? "var(--paper-3)" : "transparent",
                textDecoration: "none",
              })}
            >
              <IconEl />
              {n.label}
            </NavLink>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", fontFamily: "var(--sans)", fontSize: 11, color: "var(--ink-3)" }}>
        {names[userId] || "Maya Chen"} · demo
      </div>
    </nav>
  );
}

export function TweakPanel() {
  const { theme, accent, layout, userId, setTheme, setAccent, setLayout, setUserId } = useAppStore();
  const accents: Accent[] = ["oxblood", "indigo", "forest", "ochre"];
  const layouts: DashboardLayout[] = ["editorial", "timeline", "grid"];
  const themes: Theme[] = ["light", "dark"];
  const personas = ["maya", "david", "linda"];

  const row: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  };
  const chip = (on: boolean): CSSProperties => ({
    padding: "4px 10px",
    border: `1px solid ${on ? "var(--ink)" : "var(--rule)"}`,
    background: on ? "var(--ink)" : "var(--paper)",
    color: on ? "var(--paper)" : "var(--ink-2)",
    borderRadius: 999,
    fontFamily: "var(--mono)",
    fontSize: 10,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  });

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        padding: 14,
        background: "var(--paper-2)",
        border: "1px solid var(--rule)",
        borderRadius: 12,
        boxShadow: "var(--shadow-2)",
        zIndex: 50,
        minWidth: 260,
      }}
    >
      <div className="label-kicker" style={{ marginBottom: 10 }}>
        Tweak
      </div>
      <div style={row}>
        <span className="label-mono" style={{ width: 60 }}>persona</span>
        {personas.map((p) => (
          <button key={p} onClick={() => setUserId(p)} style={chip(userId === p)}>
            {p}
          </button>
        ))}
      </div>
      <div style={row}>
        <span className="label-mono" style={{ width: 60 }}>theme</span>
        {themes.map((t) => (
          <button key={t} onClick={() => setTheme(t)} style={chip(theme === t)}>
            {t}
          </button>
        ))}
      </div>
      <div style={row}>
        <span className="label-mono" style={{ width: 60 }}>accent</span>
        {accents.map((a) => (
          <button key={a} onClick={() => setAccent(a)} style={chip(accent === a)}>
            {a}
          </button>
        ))}
      </div>
      <div style={{ ...row, marginBottom: 0 }}>
        <span className="label-mono" style={{ width: 60 }}>layout</span>
        {layouts.map((l) => (
          <button key={l} onClick={() => setLayout(l)} style={chip(layout === l)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "40px 48px 80px", maxWidth: 1280 }}>{children}</main>
      <TweakPanel />
    </div>
  );
}
