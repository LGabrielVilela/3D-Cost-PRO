"use client";

import { useEffect } from "react";

import { seedDemoDataIfNeeded } from "@/services/seed/demoData";

/**
 * Componente invisível: garante que os dados de demonstração existam
 * assim que o app carrega no navegador (idempotente — não duplica dados
 * em execuções seguintes).
 */
export function DemoDataBootstrap() {
  useEffect(() => {
    void seedDemoDataIfNeeded();
  }, []);

  return null;
}
