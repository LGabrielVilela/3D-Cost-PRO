import { z } from "zod";

import { generateId } from "@/lib/id";
import { centavosToReais, reaisToCentavos } from "@/lib/money";
import { DEFAULT_QUANTITY_TIERS } from "@/calculators/quantityPricing";
import type { CalculationInput } from "@/types/entities";

/**
 * Formulário da calculadora: espelha o `CalculationInput` (src/types/entities.ts),
 * mas com valores monetários como STRING no formato pt-BR (ex: "99,90") para
 * ligar diretamente ao `CurrencyInput`. A conversão para centavos acontece só
 * em `toCalculationInput`, na fronteira com a camada de cálculo.
 */

const moneyString = (mensagem: string) =>
  z
    .string()
    .min(1, mensagem)
    .refine((v) => reaisToCentavos(v) >= 0, "Valor inválido");

const positiveMoneyString = (mensagem: string) =>
  z
    .string()
    .min(1, mensagem)
    .refine((v) => reaisToCentavos(v) > 0, mensagem);

export const outroCustoItemSchema = z.object({
  id: z.string(),
  descricao: z.string().min(1, "Informe uma descrição"),
  valor: moneyString("Informe o valor"),
});

export const paymentFeeSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, "Informe o nome da forma de pagamento"),
  taxaPercentual: z.number({ error: "Informe a taxa" }).min(0, "A taxa não pode ser negativa").max(100, "A taxa não pode passar de 100%"),
  taxaFixa: moneyString("Informe a taxa fixa (ou 0)"),
  parcelas: z.number().int().min(1).max(24).optional(),
});

export const quantityTierSchema = z.object({
  id: z.string(),
  quantidade: z.number({ error: "Informe a quantidade" }).int().min(1, "Mínimo de 1 unidade"),
  descontoPercentual: z
    .number({ error: "Informe o desconto" })
    .min(0, "O desconto não pode ser negativo")
    .max(100, "O desconto não pode passar de 100%"),
});

export const calculatorFormSchema = z
  .object({
    materialId: z.string().optional(),
    materialNome: z.string().min(1, "Informe o material utilizado"),
    filamentoPreco: positiveMoneyString("Informe quanto você pagou no rolo"),
    filamentoPesoRolo: z
      .number({ error: "Informe o peso do rolo" })
      .positive("O peso do rolo deve ser maior que zero"),
    gramasUtilizadas: z
      .number({ error: "Informe quantos gramas foram utilizados" })
      .positive("A quantidade utilizada deve ser maior que zero"),
    tempoImpressaoMinutos: z
      .number({ error: "Informe o tempo de impressão" })
      .positive("O tempo de impressão deve ser maior que zero"),
    quantidadePecas: z
      .number({ error: "Informe a quantidade de peças" })
      .int("A quantidade deve ser um número inteiro")
      .min(1, "A quantidade mínima é 1"),

    printerId: z.string().optional(),
    printerNome: z.string().min(1, "Informe a impressora utilizada"),
    consumoWatts: z.number({ error: "Informe o consumo" }).min(0, "O consumo não pode ser negativo"),
    valorKwh: moneyString("Informe o valor do kWh"),

    depreciacaoAtiva: z.boolean(),
    precoImpressora: moneyString("Informe o preço da impressora"),
    vidaUtilHoras: z.number({ error: "Informe a vida útil" }).min(0, "A vida útil não pode ser negativa"),

    manutencaoMetodo: z.enum(["porHora", "percentual"]),
    manutencaoPorHora: moneyString("Informe o custo por hora"),
    manutencaoPercentual: z.number().min(0).max(100),

    taxaFalhasPercentual: z
      .number({ error: "Informe a taxa de falhas" })
      .min(0, "A taxa não pode ser negativa")
      .max(100, "A taxa não pode passar de 100%"),

    tempoPreparacaoMinutos: z.number().min(0),
    tempoAcabamentoMinutos: z.number().min(0),
    tempoEmbalagemMinutos: z.number().min(0),
    valorHoraTrabalho: moneyString("Informe o valor da sua hora"),
    maoDeObraUsarValorFixo: z.boolean(),
    maoDeObraValorFixo: moneyString("Informe o valor da mão de obra"),

    embalagem: moneyString("Informe o valor (ou 0)"),
    etiqueta: moneyString("Informe o valor (ou 0)"),
    adesivo: moneyString("Informe o valor (ou 0)"),
    protecao: moneyString("Informe o valor (ou 0)"),
    embalagemOutros: moneyString("Informe o valor (ou 0)"),

    outrosCustos: z.array(outroCustoItemSchema),

    metodoPrecificacao: z.enum(["margem", "markup"]),
    margemPercentual: z
      .number({ error: "Informe a margem" })
      .min(0, "A margem não pode ser negativa")
      .max(99.9, "A margem deve ser menor que 100%"),
    markupPercentual: z.number({ error: "Informe o markup" }).min(0, "O markup não pode ser negativo"),

    taxasPagamento: z.array(paymentFeeSchema),
    descontoPercentual: z.number().min(0, "O desconto não pode ser negativo").max(100, "O desconto não pode passar de 100%"),
    faixasQuantidade: z.array(quantityTierSchema),
  })
  .superRefine((data, ctx) => {
    if (data.manutencaoMetodo === "percentual" && data.manutencaoPercentual <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["manutencaoPercentual"],
        message: "Informe um percentual maior que zero",
      });
    }
    if (data.metodoPrecificacao === "markup" && data.markupPercentual <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["markupPercentual"],
        message: "Informe um markup maior que zero",
      });
    }
  });

export type CalculatorFormValues = z.infer<typeof calculatorFormSchema>;

/** Valores padrão de um cálculo novo — usados quando a calculadora abre em branco. */
export function buildDefaultFormValues(): CalculatorFormValues {
  return {
    materialId: undefined,
    materialNome: "",
    filamentoPreco: "",
    filamentoPesoRolo: 1000,
    gramasUtilizadas: 0,
    tempoImpressaoMinutos: 0,
    quantidadePecas: 1,

    printerId: undefined,
    printerNome: "",
    consumoWatts: 0,
    valorKwh: "0,80",

    depreciacaoAtiva: true,
    precoImpressora: "",
    vidaUtilHoras: 8000,

    manutencaoMetodo: "percentual",
    manutencaoPorHora: "0,00",
    manutencaoPercentual: 5,

    taxaFalhasPercentual: 10,

    tempoPreparacaoMinutos: 10,
    tempoAcabamentoMinutos: 10,
    tempoEmbalagemMinutos: 5,
    valorHoraTrabalho: "20,00",
    maoDeObraUsarValorFixo: true,
    maoDeObraValorFixo: "15,00",

    embalagem: "2,00",
    etiqueta: "0,00",
    adesivo: "0,00",
    protecao: "0,00",
    embalagemOutros: "0,00",

    outrosCustos: [],

    metodoPrecificacao: "margem",
    margemPercentual: 30,
    markupPercentual: 100,

    taxasPagamento: [
      { id: generateId(), nome: "PIX", taxaPercentual: 0, taxaFixa: "0,00" },
      { id: generateId(), nome: "Cartão de crédito", taxaPercentual: 4.99, taxaFixa: "0,00" },
    ],
    descontoPercentual: 0,
    faixasQuantidade: DEFAULT_QUANTITY_TIERS.map((tier) => ({ ...tier, id: generateId() })),
  };
}

/** Converte os valores do formulário (reais em string) para o `CalculationInput` (centavos). */
export function toCalculationInput(values: CalculatorFormValues): CalculationInput {
  return {
    materialId: values.materialId,
    materialNome: values.materialNome,
    filamentoPrecoCentavos: reaisToCentavos(values.filamentoPreco),
    filamentoPesoRoloGramas: values.filamentoPesoRolo,
    gramasUtilizadas: values.gramasUtilizadas,
    tempoImpressaoMinutos: values.tempoImpressaoMinutos,
    quantidadePecas: values.quantidadePecas,

    printerId: values.printerId,
    printerNome: values.printerNome,
    consumoWatts: values.consumoWatts,
    valorKwhCentavos: reaisToCentavos(values.valorKwh),

    depreciacaoAtiva: values.depreciacaoAtiva,
    precoImpressoraCentavos: reaisToCentavos(values.precoImpressora),
    vidaUtilHoras: values.vidaUtilHoras,

    manutencaoMetodo: values.manutencaoMetodo,
    manutencaoPorHoraCentavos: reaisToCentavos(values.manutencaoPorHora),
    manutencaoPercentual: values.manutencaoPercentual,

    taxaFalhasPercentual: values.taxaFalhasPercentual,

    tempoPreparacaoMinutos: values.tempoPreparacaoMinutos,
    tempoAcabamentoMinutos: values.tempoAcabamentoMinutos,
    tempoEmbalagemMinutos: values.tempoEmbalagemMinutos,
    valorHoraTrabalhoCentavos: reaisToCentavos(values.valorHoraTrabalho),
    maoDeObraUsarValorFixo: values.maoDeObraUsarValorFixo,
    maoDeObraValorFixoCentavos: reaisToCentavos(values.maoDeObraValorFixo),

    embalagemCentavos: reaisToCentavos(values.embalagem),
    etiquetaCentavos: reaisToCentavos(values.etiqueta),
    adesivoCentavos: reaisToCentavos(values.adesivo),
    protecaoCentavos: reaisToCentavos(values.protecao),
    embalagemOutrosCentavos: reaisToCentavos(values.embalagemOutros),

    outrosCustos: values.outrosCustos.map((item) => ({
      id: item.id,
      descricao: item.descricao,
      valorCentavos: reaisToCentavos(item.valor),
    })),

    metodoPrecificacao: values.metodoPrecificacao,
    margemPercentual: values.margemPercentual,
    markupPercentual: values.markupPercentual,

    taxasPagamento: values.taxasPagamento.map((taxa) => ({
      id: taxa.id,
      nome: taxa.nome,
      taxaPercentual: taxa.taxaPercentual,
      taxaFixaCentavos: reaisToCentavos(taxa.taxaFixa),
      parcelas: taxa.parcelas,
    })),

    descontoPercentual: values.descontoPercentual,
    faixasQuantidade: values.faixasQuantidade,
  };
}

/** Converte um `CalculationInput` salvo de volta para valores de formulário (para reabrir um cálculo). */
export function fromCalculationInput(input: CalculationInput): CalculatorFormValues {
  const centavosParaTexto = (centavos: number) =>
    centavosToReais(centavos).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return {
    materialId: input.materialId,
    materialNome: input.materialNome,
    filamentoPreco: centavosParaTexto(input.filamentoPrecoCentavos),
    filamentoPesoRolo: input.filamentoPesoRoloGramas,
    gramasUtilizadas: input.gramasUtilizadas,
    tempoImpressaoMinutos: input.tempoImpressaoMinutos,
    quantidadePecas: input.quantidadePecas,

    printerId: input.printerId,
    printerNome: input.printerNome,
    consumoWatts: input.consumoWatts,
    valorKwh: centavosParaTexto(input.valorKwhCentavos),

    depreciacaoAtiva: input.depreciacaoAtiva,
    precoImpressora: centavosParaTexto(input.precoImpressoraCentavos),
    vidaUtilHoras: input.vidaUtilHoras,

    manutencaoMetodo: input.manutencaoMetodo,
    manutencaoPorHora: centavosParaTexto(input.manutencaoPorHoraCentavos),
    manutencaoPercentual: input.manutencaoPercentual,

    taxaFalhasPercentual: input.taxaFalhasPercentual,

    tempoPreparacaoMinutos: input.tempoPreparacaoMinutos,
    tempoAcabamentoMinutos: input.tempoAcabamentoMinutos,
    tempoEmbalagemMinutos: input.tempoEmbalagemMinutos,
    valorHoraTrabalho: centavosParaTexto(input.valorHoraTrabalhoCentavos),
    maoDeObraUsarValorFixo: input.maoDeObraUsarValorFixo,
    maoDeObraValorFixo: centavosParaTexto(input.maoDeObraValorFixoCentavos ?? 0),

    embalagem: centavosParaTexto(input.embalagemCentavos),
    etiqueta: centavosParaTexto(input.etiquetaCentavos),
    adesivo: centavosParaTexto(input.adesivoCentavos),
    protecao: centavosParaTexto(input.protecaoCentavos),
    embalagemOutros: centavosParaTexto(input.embalagemOutrosCentavos),

    outrosCustos: input.outrosCustos.map((item) => ({
      id: item.id,
      descricao: item.descricao,
      valor: centavosParaTexto(item.valorCentavos),
    })),

    metodoPrecificacao: input.metodoPrecificacao,
    margemPercentual: input.margemPercentual,
    markupPercentual: input.markupPercentual,

    taxasPagamento: input.taxasPagamento.map((taxa) => ({
      id: taxa.id,
      nome: taxa.nome,
      taxaPercentual: taxa.taxaPercentual,
      taxaFixa: centavosParaTexto(taxa.taxaFixaCentavos),
      parcelas: taxa.parcelas,
    })),

    descontoPercentual: input.descontoPercentual,
    faixasQuantidade: input.faixasQuantidade,
  };
}
