"use client";

import { useEffect, useState } from "react";

import {
  computeDashboardStats,
  computeStatusDistribution,
  computeWeeklySeries,
  type DashboardStats,
  type PeriodPoint,
  type StatusSlice,
} from "@/lib/dashboardStats";
import { calculationsRepository } from "@/services/repositories/calculationsRepository";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import type { Calculation, Quote } from "@/types/entities";

interface DashboardData {
  loading: boolean;
  stats: DashboardStats;
  weeklySeries: PeriodPoint[];
  statusDistribution: StatusSlice[];
  quotes: Quote[];
  calculations: Calculation[];
  reload: () => void;
}

const EMPTY_STATS: DashboardStats = {
  totalOrcamentos: 0,
  orcamentosAprovados: 0,
  orcamentosPendentes: 0,
  faturamentoEstimadoCentavos: 0,
  faturamentoAprovadoCentavos: 0,
  pecasCalculadas: 0,
  custoMedioPorPecaCentavos: 0,
  margemMediaPercentual: 0,
};

/** Carrega orçamentos + cálculos do storage e deriva os dados do dashboard. */
export function useDashboardData(): DashboardData {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([quotesRepository.list(), calculationsRepository.list()]).then(
      ([quotesResult, calculationsResult]) => {
        if (cancelled) return;
        setQuotes(quotesResult);
        setCalculations(calculationsResult);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    loading,
    stats: loading ? EMPTY_STATS : computeDashboardStats(quotes, calculations),
    weeklySeries: computeWeeklySeries(quotes),
    statusDistribution: computeStatusDistribution(quotes),
    quotes,
    calculations,
    reload: () => {
      setLoading(true);
      setReloadKey((k) => k + 1);
    },
  };
}
