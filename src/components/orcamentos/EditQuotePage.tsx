"use client";

import { FileX } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import type { Quote } from "@/types/entities";

import { QuoteFormPage } from "./QuoteFormPage";

/** Carrega um orçamento existente pelo id e abre o formulário de edição. */
export function EditQuotePage({ id }: { id: string }) {
  const [quote, setQuote] = useState<Quote | undefined | null>(undefined);

  useEffect(() => {
    let cancelled = false;
    quotesRepository.getById(id).then((result) => {
      if (!cancelled) setQuote(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (quote === undefined) {
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

  return <QuoteFormPage quote={quote} />;
}
