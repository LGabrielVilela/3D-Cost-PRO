"use client";

import { useEntityCollection } from "@/hooks/useEntityCollection";
import { materialsRepository } from "@/services/repositories/materialsRepository";
import type { Material } from "@/types/entities";

/**
 * Coleção de materiais cadastrados — usada tanto pela calculadora (leitura,
 * para preencher a Etapa 1) quanto pela tela de cadastro (leitura + escrita).
 */
export function useMaterials() {
  const { items, loading, reload, create, update, remove } =
    useEntityCollection<Material>(materialsRepository);

  return { materials: items, loading, reload, create, update, remove };
}
