"use client";

import { useState } from "react";
import { CheckCircle2, DatabaseZap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { calculationsRepository } from "@/services/repositories/calculationsRepository";
import { clientsRepository } from "@/services/repositories/clientsRepository";
import { materialsRepository } from "@/services/repositories/materialsRepository";
import { printersRepository } from "@/services/repositories/printersRepository";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import { settingsRepository } from "@/services/repositories/settingsRepository";
import { STORAGE_KEYS } from "@/services/storage/localStorageAdapter";
import type {
  AppSettings,
  Calculation,
  Client,
  Material,
  Printer,
  Quote,
} from "@/types/entities";

function readLocal<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

interface Summary {
  materials: number;
  printers: number;
  clients: number;
  calculations: number;
  quotes: number;
  settingsMigrated: boolean;
}

/**
 * Ferramenta de uso único: lê os dados que ainda estejam no `localStorage`
 * deste navegador (da versão anterior à migração para o banco) e grava tudo
 * no Postgres através dos repositórios já ligados às Server Actions.
 *
 * Não está no menu — acesse direto por `/migrar-dados`. Idempotente: pode
 * rodar mais de uma vez sem duplicar (usa `replaceAll`, que substitui a
 * coleção inteira no banco pelo conteúdo local).
 */
export default function MigrarDadosPage() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [summary, setSummary] = useState<Summary | null>(null);

  async function handleMigrate() {
    setStatus("running");

    const materials = readLocal<Material>(STORAGE_KEYS.materials);
    const printers = readLocal<Printer>(STORAGE_KEYS.printers);
    const clients = readLocal<Client>(STORAGE_KEYS.clients);
    const calculations = readLocal<Calculation>(STORAGE_KEYS.calculations);
    const quotes = readLocal<Quote>(STORAGE_KEYS.quotes);

    let settingsMigrated = false;
    const rawSettings = window.localStorage.getItem(STORAGE_KEYS.settings);
    if (rawSettings) {
      try {
        const settings = JSON.parse(rawSettings) as AppSettings;
        await settingsRepository.save(settings);
        settingsMigrated = true;
      } catch {
        settingsMigrated = false;
      }
    }

    if (materials.length > 0) await materialsRepository.replaceAll(materials);
    if (printers.length > 0) await printersRepository.replaceAll(printers);
    if (clients.length > 0) await clientsRepository.replaceAll(clients);
    if (calculations.length > 0) await calculationsRepository.replaceAll(calculations);
    if (quotes.length > 0) await quotesRepository.replaceAll(quotes);

    setSummary({
      materials: materials.length,
      printers: printers.length,
      clients: clients.length,
      calculations: calculations.length,
      quotes: quotes.length,
      settingsMigrated,
    });
    setStatus("done");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Migrar dados locais"
        description="Envia os dados salvos neste navegador (localStorage) para o banco de dados."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">O que isso faz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Lê materiais, impressoras, clientes, cálculos, orçamentos e configurações salvos
            neste navegador antes da migração para o banco de dados, e grava tudo no Postgres.
            Só funciona neste navegador/computador onde os dados foram criados originalmente.
            Pode rodar mais de uma vez sem duplicar.
          </p>

          <Button onClick={handleMigrate} disabled={status === "running"}>
            <DatabaseZap className="h-4 w-4" />
            {status === "running" ? "Migrando..." : "Migrar dados agora"}
          </Button>

          {status === "done" && summary && (
            <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="space-y-1">
                <p className="font-medium">Migração concluída.</p>
                <ul className="text-muted-foreground">
                  <li>Materiais: {summary.materials}</li>
                  <li>Impressoras: {summary.printers}</li>
                  <li>Clientes: {summary.clients}</li>
                  <li>Cálculos: {summary.calculations}</li>
                  <li>Orçamentos: {summary.quotes}</li>
                  <li>Configurações: {summary.settingsMigrated ? "migradas" : "nenhuma encontrada"}</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
