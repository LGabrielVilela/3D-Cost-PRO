"use client";

import { FileX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { calculationsRepository } from "@/services/repositories/calculationsRepository";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import type { Calculation, Quote } from "@/types/entities";

import { QuoteFormPage } from "./QuoteFormPage";

/**
 * Carrega um orçamento existente pelo id e abre o formulário de edição.
 * Se vier com `?calculoId=...` (uso: "Adicionar a orçamento" na Calculadora),
 * carrega também o cálculo — `QuoteFormPage` acrescenta esse produto como
 * um novo item, além dos que o orçamento já tinha.
 */
export function EditQuotePage({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const calculoId = searchParams.get("calculoId");

  const [quote, setQuote] = useState<Quote | undefined | null>(undefined);
  const [calculation, setCalculation] = useState<Calculation | null | undefined>(
    calculoId ? undefined : null,
  );

  useEffect(() => {
    let cancelled = false;
    quotesRepository.getById(id).then((result) => {
      if (!cancelled) setQuote(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!calculoId) return;
    let cancelled = false;
    calculationsRepository.getById(calculoId).then((result) => {
      if (!cancelled) setCalculation(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [calculoId]);

  if (quote === undefined || calculation === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (quote === null) {
    return (
      <EmptyState
        icon={FileX}
        title="Orçamento não encontrado"
        description="Esse orçamento pode ter sido excluído."
      />
    );
  }

  return <QuoteFormPage quote={quote} initialCalculation={calculation ?? undefined} />;
}
