"use client";

import {
  BadgeCheck,
  CalendarClock,
  Clock,
  DollarSign,
  Hammer,
  Layers,
  PackageCheck,
  Percent,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { OverdueOrdersAlert } from "@/components/dashboard/OverdueOrdersAlert";
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
  const { loading, stats, weeklySeries, ordersWeeklySeries, statusDistribution, orders } =
    useDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos seus cálculos, orçamentos e pedidos."
        actions={<QuickActions />}
      />

      {!loading ? <OverdueOrdersAlert orders={orders} /> : null}

      {loading ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, section) => (
            <div key={section} className="space-y-2.5">
              <Skeleton className="h-4 w-24" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[92px] rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <DashboardSection title="Orçamentos">
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
              label="Faturamento estimado (orçamentos)"
              value={formatCentavos(stats.faturamentoEstimadoCentavos)}
              hint="Orçamentos em andamento"
              icon={Wallet}
              tone="primary"
            />
            <StatCard
              label="Faturamento aprovado (orçamentos)"
              value={formatCentavos(stats.faturamentoAprovadoCentavos)}
              hint="Somente aprovados"
              icon={DollarSign}
              tone="success"
            />
          </DashboardSection>

          <DashboardSection title="Pedidos">
            <StatCard
              label="Pedidos agendados"
              value={String(stats.pedidosAgendados)}
              icon={CalendarClock}
            />
            <StatCard
              label="Pedidos em andamento"
              value={String(stats.pedidosEmAndamento)}
              icon={Hammer}
              tone="primary"
            />
            <StatCard
              label="Faturamento de pedidos (finalizados)"
              value={formatCentavos(stats.faturamentoPedidosCentavos)}
              hint={`${stats.pedidosFinalizados} pedido(s) finalizado(s)`}
              icon={PackageCheck}
              tone="success"
            />
          </DashboardSection>

          <DashboardSection title="Calculadora">
            <StatCard label="Peças calculadas" value={String(stats.pecasCalculadas)} icon={Layers} />
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
          </DashboardSection>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <QuotesByPeriodChart data={weeklySeries} />
        <QuotesValueChart data={weeklySeries} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <QuotesByPeriodChart
          data={ordersWeeklySeries}
          title="Pedidos finalizados por período"
          quantityLabel="Pedidos"
        />
        <QuotesValueChart data={ordersWeeklySeries} title="Valor dos pedidos finalizados" />
      </div>

      <div className="grid gap-4">
        <QuoteStatusChart data={statusDistribution} />
      </div>
    </div>
  );
}
