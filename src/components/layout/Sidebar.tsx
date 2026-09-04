"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box } from "lucide-react";

import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navegação lateral fixa — visível em telas médias/grandes (desktop e tablet). */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Box className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">3D Cost Pro</p>
          <p className="text-[11px] text-sidebar-foreground/60">Custos &amp; Orçamentos</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
                )}
                strokeWidth={2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 text-[11px] text-sidebar-foreground/45">
        v0.1 · Fase 1
      </div>
    </aside>
  );
}
