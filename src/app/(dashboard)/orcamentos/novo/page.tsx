"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { QuoteFormPage } from "@/components/orcamentos/QuoteFormPage";
import { Skeleton } from "@/components/ui/skeleton";
import { calculationsRepository } from "@/services/repositories/calculationsRepository";
import type { Calculation } from "@/types/entities";

/** `undefined` = ainda carregando; `null` = não há cálculo de origem (orçamento em branco). */
function NovoOrcamentoContent() {
  const searchParams = useSearchParams();
  const calculoId = searchParams.get("calculoId");

  const [calculation, setCalculation] = useState<Calculation | null | undefined>(
    calculoId ? undefined : null,
  );

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

  if (calculation === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return <QuoteFormPage initialCalculation={calculation ?? undefined} />;
}

export default function NovoOrcamentoPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <NovoOrcamentoContent />
    </Suspense>
  );
}
