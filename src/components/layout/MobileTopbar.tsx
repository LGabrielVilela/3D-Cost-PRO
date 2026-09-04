"use client";

import { usePathname } from "next/navigation";
import { Box } from "lucide-react";

import { NAV_ITEMS } from "@/lib/navigation";

function currentLabel(pathname: string): string {
  const match = NAV_ITEMS.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
  return match?.label ?? "3D Cost Pro";
}

/** Cabeçalho fixo exibido apenas no mobile, com o nome da tela atual. */
export function MobileTopbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Box className="h-4 w-4" strokeWidth={2.25} />
      </div>
      <h1 className="text-sm font-semibold tracking-tight">{currentLabel(pathname)}</h1>
    </header>
  );
}
