"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

export const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Overview", icon: "home" },
  { href: "/aurora", label: "Aurora", icon: "aurora" },
  { href: "/gnss", label: "GNSS", icon: "gnss" },
  { href: "/cme", label: "CME tracker", icon: "cme" },
  { href: "/backtest", label: "Backtests", icon: "backtest" },
  { href: "/models", label: "Models", icon: "models" },
  { href: "/api-docs", label: "API docs", icon: "api" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="glass fixed inset-y-0 left-0 z-30 w-16 border-r p-2 md:w-64 md:p-4">
      <div className="flex h-12 items-center px-2 text-lg font-bold md:h-8">
        <span className="md:hidden" aria-hidden="true">
          SB
        </span>
        <span className="hidden md:inline">SolarBud</span>
      </div>
      <nav aria-label="Main" className="mt-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-control px-3 py-1.5 text-[0.8125rem] font-bold transition-colors duration-150 ${
                active
                  ? "bg-primary-fill text-on-primary"
                  : "text-[var(--on-shell-muted)] hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={icon} />
              <span className="hidden md:inline">{label}</span>
              <span className="sr-only md:hidden">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
