import { generateId } from "@/lib/id";
import type { Calculation, QuoteItem } from "@/types/entities";

import { calculateItemTotal } from "./quotationCalculator";

/**
 * Converte o resultado de um cálculo salvo em um item de orçamento.
 *
 * ATENÇÃO — fronteira de segurança: esta função só pode ler
 * `calculation.precos.precoAnuncioCentavos` (o preço já pensado para o
 * cliente) e campos de `calculation.input` que descrevem o produto
 * (material, quantidade). NUNCA leia `calculation.custos` aqui — é onde
 * vivem os custos internos (filamento, energia, mão de obra, margem etc.),
 * que não podem vazar para o orçamento.
 */
export function buildQuoteItemFromCalculation(
  calculation: Calculation,
  quantidadeOverride?: number,
): QuoteItem {
  const quantidade = quantidadeOverride ?? calculation.input.quantidadePecas;
  const precoUnitarioCentavos = calculation.precos.precoAnuncioCentavos;

  return {
    id: generateId(),
    descricao: calculation.nome || calculation.input.materialNome || "Peça personalizada",
    material: calculation.input.materialNome || undefined,
    cor: undefined,
    quantidade,
    precoUnitarioCentavos,
    totalCentavos: calculateItemTotal(quantidade, precoUnitarioCentavos),
  };
}

export interface QuoteDraftFromCalculation {
  descricaoServico: string;
  itens: QuoteItem[];
  calculationId: string;
}

/** Monta o rascunho de orçamento (descrição + item único) a partir de um cálculo salvo. */
export function buildQuoteDraftFromCalculation(calculation: Calculation): QuoteDraftFromCalculation {
  const item = buildQuoteItemFromCalculation(calculation);
  return {
    descricaoServico: item.descricao,
    itens: [item],
    calculationId: calculation.id,
  };
}
