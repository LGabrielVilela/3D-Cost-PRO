"use client";

import { useEffect, useState } from "react";

import {
  computeDashboardStats,
  computeOrdersWeeklySeries,
  computeStatusDistribution,
  computeWeeklySeries,
  type DashboardStats,
  type PeriodPoint,
  type StatusSlice,
} from "@/lib/dashboardStats";
import { calculationsRepository } from "@/services/repositories/calculationsRepository";
import { ordersRepository } from "@/services/repositories/ordersRepository";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import type { Calculation, Order, Quote } from "@/types/entities";

interface DashboardData {
  loading: boolean;
  stats: DashboardStats;
  weeklySeries: PeriodPoint[];
  ordersWeeklySeries: PeriodPoint[];
  statusDistribution: StatusSlice[];
  quotes: Quote[];
  calculations: Calculation[];
  orders: Order[];
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
  faturamentoPedidosCentavos: 0,
  pedidosFinalizados: 0,
  pedidosAgendados: 0,
  pedidosEmAndamento: 0,
  pedidosAtrasados: 0,
};

/** Carrega orçamentos + cálculos + pedidos do storage e deriva os dados do dashboard. */
export function useDashboardData(): DashboardData {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      quotesRepository.list(),
      calculationsRepository.list(),
      ordersRepository.list(),
    ]).then(([quotesResult, calculationsResult, ordersResult]) => {
      if (cancelled) return;
      setQuotes(quotesResult);
      setCalculations(calculationsResult);
      setOrders(ordersResult);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    loading,
    stats: loading ? EMPTY_STATS : computeDashboardStats(quotes, calculations, orders),
    weeklySeries: computeWeeklySeries(quotes),
    ordersWeeklySeries: computeOrdersWeeklySeries(orders),
    statusDistribution: computeStatusDistribution(quotes),
    quotes,
    calculations,
    orders,
    reload: () => {
      setLoading(true);
      setReloadKey((k) => k + 1);
    },
  };
}
