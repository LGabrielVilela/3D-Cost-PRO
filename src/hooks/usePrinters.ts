"use client";

import { useEntityCollection } from "@/hooks/useEntityCollection";
import { printersRepository } from "@/services/repositories/printersRepository";
import type { Printer } from "@/types/entities";

/**
 * Coleção de impressoras cadastradas — usada tanto pela calculadora (leitura,
 * para preencher a Etapa 2) quanto pela tela de cadastro (leitura + escrita).
 */
export function usePrinters() {
  const { items, loading, reload, create, update, remove } =
    useEntityCollection<Printer>(printersRepository);

  return { printers: items, loading, reload, create, update, remove };
}
