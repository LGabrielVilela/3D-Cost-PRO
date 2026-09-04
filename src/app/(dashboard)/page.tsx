"use client";

import {
  BadgeCheck,
  Clock,
  DollarSign,
  Layers,
  Percent,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { QuickActions } from "@/components/dashboard/QuickActions";
import { QuoteStatusChart } from "@/components/dashboard/QuoteStatusChart";
import { QuotesByPeriodChart } from "@/components/dashboard/QuotesByPeriodChart";
import { QuotesValueChart } from "@/components/dashboard/QuotesValueChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatCentavos, formatPercentual } from "@/lib/money";

export default function DashboardPage() {
  const { loading, stats, weeklySeries, statusDistribution } = useDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos seus cálculos e orçamentos."
        actions={<QuickActions />}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            label="Total de orçamentos"
            value={String(stats.totalOrcamentos)}
            icon={ReceiptText}
            tone="primary"
          />
          <StatCard
            label="Aprovados"
            value={String(stats.orcamentosAprovados)}
            icon={BadgeCheck}
            tone="success"
          />
          <StatCard
            label="Pendentes"
            value={String(stats.orcamentosPendentes)}
            icon={Clock}
            tone="warning"
          />
          <StatCard
            label="Peças calculadas"
            value={String(stats.pecasCalculadas)}
            icon={Layers}
          />
          <StatCard
            label="Faturamento estimado"
            value={formatCentavos(stats.faturamentoEstimadoCentavos)}
            hint="Orçamentos em andamento"
            icon={Wallet}
            tone="primary"
          />
          <StatCard
            label="Faturamento aprovado"
            value={formatCentavos(stats.faturamentoAprovadoCentavos)}
            hint="Somente aprovados"
            icon={DollarSign}
            tone="success"
          />
          <StatCard
            label="Custo médio por peça"
            value={formatCentavos(stats.custoMedioPorPecaCentavos)}
            icon={TrendingUp}
          />
          <StatCard
            label="Margem média"
            value={formatPercentual(stats.margemMediaPercentual)}
            icon={Percent}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <QuotesByPeriodChart data={weeklySeries} />
        <QuotesValueChart data={weeklySeries} />
      </div>

      <div className="grid gap-4">
        <QuoteStatusChart data={statusDistribution} />
      </div>
    </div>
  );
}
