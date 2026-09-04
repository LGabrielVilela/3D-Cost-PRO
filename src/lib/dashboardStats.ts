import type { Calculation, Quote, QuoteStatus } from "@/types/entities";

export interface DashboardStats {
  totalOrcamentos: number;
  orcamentosAprovados: number;
  orcamentosPendentes: number;
  faturamentoEstimadoCentavos: number;
  faturamentoAprovadoCentavos: number;
  pecasCalculadas: number;
  custoMedioPorPecaCentavos: number;
  margemMediaPercentual: number;
}

export interface PeriodPoint {
  /** Rótulo curto da semana, ex: "18/08" */
  label: string;
  quantidade: number;
  valorCentavos: number;
}

export interface StatusSlice {
  status: QuoteStatus;
  label: string;
  quantidade: number;
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aguardando_aprovacao: "Aguard. aprovação",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
  cancelado: "Cancelado",
};

const STATUS_PENDENTE: QuoteStatus[] = ["enviado", "aguardando_aprovacao"];
const STATUS_FORA_DO_PIPELINE: QuoteStatus[] = ["recusado", "cancelado", "expirado"];

export function computeDashboardStats(
  quotes: Quote[],
  calculations: Calculation[],
): DashboardStats {
  const aprovados = quotes.filter((q) => q.status === "aprovado");
  const pendentes = quotes.filter((q) => STATUS_PENDENTE.includes(q.status));
  const noPipeline = quotes.filter((q) => !STATUS_FORA_DO_PIPELINE.includes(q.status));

  const faturamentoEstimadoCentavos = noPipeline.reduce((acc, q) => acc + q.totalCentavos, 0);
  const faturamentoAprovadoCentavos = aprovados.reduce((acc, q) => acc + q.totalCentavos, 0);

  const pecasCalculadas = calculations.reduce(
    (acc, c) => acc + (c.input.quantidadePecas || 0),
    0,
  );

  const custoMedioPorPecaCentavos =
    calculations.length === 0
      ? 0
      : Math.round(
          calculations.reduce((acc, c) => acc + c.custos.custoPorUnidadeCentavos, 0) /
            calculations.length,
        );

  const margens = calculations
    .filter((c) => c.precos.precoRecomendadoCentavos > 0)
    .map(
      (c) =>
        ((c.precos.precoRecomendadoCentavos - c.custos.custoTotalCentavos) /
          c.precos.precoRecomendadoCentavos) *
        100,
    );
  const margemMediaPercentual =
    margens.length === 0 ? 0 : margens.reduce((acc, m) => acc + m, 0) / margens.length;

  return {
    totalOrcamentos: quotes.length,
    orcamentosAprovados: aprovados.length,
    orcamentosPendentes: pendentes.length,
    faturamentoEstimadoCentavos,
    faturamentoAprovadoCentavos,
    pecasCalculadas,
    custoMedioPorPecaCentavos,
    margemMediaPercentual,
  };
}

/** Agrupa orçamentos em N baldes semanais (mais antigo -> mais recente) para os gráficos. */
export function computeWeeklySeries(quotes: Quote[], weeks = 6): PeriodPoint[] {
  const now = new Date();
  const buckets: PeriodPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);

    const quantidade = quotes.filter((q) => {
      const created = new Date(q.createdAt);
      return created >= start && created <= end;
    });

    buckets.push({
      label: `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}`,
      quantidade: quantidade.length,
      valorCentavos: quantidade.reduce((acc, q) => acc + q.totalCentavos, 0),
    });
  }

  return buckets;
}

export function computeStatusDistribution(quotes: Quote[]): StatusSlice[] {
  const counts = new Map<QuoteStatus, number>();
  for (const quote of quotes) {
    counts.set(quote.status, (counts.get(quote.status) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([status, quantidade]) => ({ status, label: STATUS_LABELS[status], quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

export { STATUS_LABELS };
