"use client";

import { useEntityCollection } from "@/hooks/useEntityCollection";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import type { Quote } from "@/types/entities";

/** Coleção de orçamentos salvos — usada pela listagem e pelo dashboard. */
export function useQuotes() {
  const { items, loading, reload, create, update, remove } =
    useEntityCollection<Quote>(quotesRepository);

  return { quotes: items, loading, reload, create, update, remove };
}
