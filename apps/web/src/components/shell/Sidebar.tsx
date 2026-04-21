"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { logout } from "@/app/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof Icon;
};

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "dash" },
  { href: "/accounts", label: "Accounts", icon: "accounts" },
  { href: "/debt", label: "Debt", icon: "debt" },
  { href: "/goals", label: "Goals", icon: "goals" },
  { href: "/scenarios", label: "Scenarios", icon: "scen" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="flex flex-col gap-8 sticky top-0 h-screen px-10 py-10 border-r border-rule bg-paper-2"
      style={{ width: 280, minWidth: 280 }}
    >
      <div className="pl-4">
        <div
          className="display"
          style={{ fontSize: 26, letterSpacing: "-0.02em" }}
        >
          Equitas
        </div>
        <div className="label-mono mt-1">a quiet record</div>
      </div>

      <div className="flex flex-col gap-1">
        {NAV.map((item) => {
          const IconEl = Icon[item.icon];
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-center gap-4 pl-4 pr-3 py-3 rounded-md no-underline transition-colors",
                "font-sans text-[13px]",
                active
                  ? "text-ink bg-paper-3"
                  : "text-ink-2 hover:text-ink hover:bg-paper-3/60",
              ].join(" ")}
            >
              <IconEl />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2 pb-6 pl-4">
        <div className="font-sans text-[11px] text-ink-3">
          Signed in as
          <div className="text-ink-2 truncate">{userName}</div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="font-mono text-[10px] uppercase tracking-wider text-ink-3 hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
