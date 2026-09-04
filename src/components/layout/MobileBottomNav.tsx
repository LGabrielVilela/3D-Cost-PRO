"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navegação inferior fixa para celular: 4 atalhos principais + "Mais". */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const primaryItems = NAV_ITEMS.filter((item) => item.primaryMobile);
  const secondaryItems = NAV_ITEMS.filter((item) => !item.primaryMobile);
  const moreIsActive = secondaryItems.some((item) => isActive(pathname, item.href));

  return (
    <>
      <nav
        aria-label="Navegação principal (mobile)"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {primaryItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mais opções"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
            moreIsActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Menu className="h-5 w-5" strokeWidth={moreIsActive ? 2.4 : 2} />
          Mais
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl md:hidden">
          <SheetHeader>
            <SheetTitle>Mais opções</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 px-4 pb-6">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className="flex flex-col items-center gap-2 rounded-xl border bg-card px-3 py-4 text-xs font-medium text-foreground/80 hover:bg-accent"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    {item.label}
                  </Link>
                </SheetClose>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
