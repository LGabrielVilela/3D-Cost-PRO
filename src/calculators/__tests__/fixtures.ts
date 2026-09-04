import type { CalculationInput } from "@/types/entities";

/**
 * Reproduz exatamente o exemplo numérico usado na especificação do produto:
 * filamento R$9,90 · energia R$0,80 · depreciação R$2,50 · manutenção R$1,00 ·
 * perdas R$1,42 (10%) · mão de obra R$15,00 · embalagem R$2,00 · total R$32,62.
 *
 * A depreciação R$2,50 é obtida com uma impressora de R$1.000,00 e vida útil
 * de 2.000h (R$0,50/h × 5h) — valores escolhidos apenas para fechar a conta
 * do exemplo; não representam um equipamento real específico.
 */
export function buildExampleInput(overrides: Partial<CalculationInput> = {}): CalculationInput {
  return {
    materialNome: "PLA Basic",
    filamentoPrecoCentavos: 9900,
    filamentoPesoRoloGramas: 1000,
    gramasUtilizadas: 100,
    tempoImpressaoMinutos: 300, // 5 horas
    quantidadePecas: 1,

    printerNome: "Impressora exemplo",
    consumoWatts: 200,
    valorKwhCentavos: 80,

    depreciacaoAtiva: true,
    precoImpressoraCentavos: 100000,
    vidaUtilHoras: 2000,

    manutencaoMetodo: "porHora",
    manutencaoPorHoraCentavos: 20,
    manutencaoPercentual: 0,

    taxaFalhasPercentual: 10,

    tempoPreparacaoMinutos: 10,
    tempoAcabamentoMinutos: 15,
    tempoEmbalagemMinutos: 5,
    valorHoraTrabalhoCentavos: 1500,
    maoDeObraUsarValorFixo: true,
    maoDeObraValorFixoCentavos: 1500,

    embalagemCentavos: 200,
    etiquetaCentavos: 0,
    adesivoCentavos: 0,
    protecaoCentavos: 0,
    embalagemOutrosCentavos: 0,

    outrosCustos: [],

    metodoPrecificacao: "margem",
    margemPercentual: 30,
    markupPercentual: 100,

    taxasPagamento: [],
    descontoPercentual: 0,
    faixasQuantidade: [],

    ...overrides,
  };
}
