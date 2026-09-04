import { centavosToReais, clampNonNegative, multiplyCentavos, reaisToCentavos } from "@/lib/money";
import type { CommercialRoundingStep } from "@/types/entities";

/**
 * Markup vs. Margem — são conceitos diferentes e não podem ser confundidos:
 *
 *   MARKUP: percentual aplicado sobre o CUSTO.
 *     preço = custo × (1 + markup / 100)
 *
 *   MARGEM: percentual do PREÇO DE VENDA que deve ser lucro.
 *     preço = custo / (1 - margem / 100)
 *
 * Um markup de 100% e uma margem de 50% chegam ao mesmo preço, mas
 * são calculados de formas diferentes — por isso o app pede que o
 * usuário escolha explicitamente qual método usar.
 */

/** Preço de venda a partir de um markup (%) sobre o custo. */
export function calculateMarkupPrice(custoCentavos: number, markupPercentual: number): number {
  const custo = clampNonNegative(custoCentavos);
  const markup = clampNonNegative(markupPercentual);
  return multiplyCentavos(custo, 1 + markup / 100);
}

/**
 * Preço de venda a partir de uma margem de lucro (%) desejada sobre o preço.
 * Margens >= 100% são inválidas (preço tenderia ao infinito) e retornam 0.
 */
export function calculateMarginPrice(custoCentavos: number, margemPercentual: number): number {
  const custo = clampNonNegative(custoCentavos);
  const margem = clampNonNegative(margemPercentual);
  if (margem >= 100) return 0;
  return Math.round(custo / (1 - margem / 100));
}

/** Preço sugerido conforme o método de precificação escolhido pelo usuário. */
export function calculateSuggestedPrice(
  custoCentavos: number,
  metodo: "margem" | "markup",
  percentual: number,
): number {
  return metodo === "margem"
    ? calculateMarginPrice(custoCentavos, percentual)
    : calculateMarkupPrice(custoCentavos, percentual);
}

/** Markup real obtido entre um custo e um preço de venda: (preço - custo) / custo × 100. */
export function calculateRealMarkup(custoCentavos: number, precoCentavos: number): number {
  const custo = clampNonNegative(custoCentavos);
  if (custo === 0) return 0;
  return ((precoCentavos - custo) / custo) * 100;
}

/** Margem real obtida entre um custo e um preço de venda: (preço - custo) / preço × 100. */
export function calculateRealMargin(custoCentavos: number, precoCentavos: number): number {
  const preco = clampNonNegative(precoCentavos);
  if (preco === 0) return 0;
  return ((preco - custoCentavos) / preco) * 100;
}

/** Sugere um passo de arredondamento comercial de acordo com a faixa de preço. */
export function suggestRoundingStep(valorReais: number): CommercialRoundingStep {
  if (valorReais < 20) return 1;
  if (valorReais < 100) return 10;
  if (valorReais < 500) return 50;
  return 100;
}

/**
 * Arredondamento comercial "inteligente": arredonda para CIMA até o próximo
 * múltiplo de `step` reais e fecha a casa decimal em `ending` (padrão 0,90).
 *
 * Exemplos (step=10, ending=0,90): R$ 46,63 → R$ 49,90 · R$ 32,62 → R$ 39,90.
 * Nunca resulta em um valor menor que o original.
 */
export function applyCommercialRounding(
  centavos: number,
  step?: CommercialRoundingStep,
  ending: number = 0.9,
): number {
  const valorReais = centavosToReais(clampNonNegative(centavos));
  if (valorReais === 0) return 0;

  const passo = step ?? suggestRoundingStep(valorReais);
  const proximoMultiplo = Math.ceil(valorReais / passo) * passo;
  let candidato = proximoMultiplo - (1 - ending);
  if (candidato < valorReais) {
    candidato += passo;
  }
  return reaisToCentavos(candidato);
}

export interface SuggestedPricesParams {
  custoTotalCentavos: number;
  metodoPrecificacao: "margem" | "markup";
  percentual: number;
  arredondamentoStep?: CommercialRoundingStep;
}

export interface SuggestedPricesResult {
  /** Custo total arredondado comercialmente para cima — nunca vender abaixo disto. */
  precoMinimoCentavos: number;
  /** Preço "cru" resultante do método/percentual escolhidos, sem arredondamento. */
  precoRecomendadoCentavos: number;
  /** Preço recomendado arredondado comercialmente — valor pronto para anunciar. */
  precoAnuncioCentavos: number;
}

/**
 * Preço mínimo, recomendado e de anúncio, todos derivados do custo total:
 *   mínimo     = arredondamento comercial do custo total (nunca vende no prejuízo)
 *   recomendado = markup/margem aplicado ao custo, valor exato (sem arredondar)
 *   anúncio    = arredondamento comercial do preço recomendado
 */
export function calculateSuggestedPrices(params: SuggestedPricesParams): SuggestedPricesResult {
  const custoTotalCentavos = clampNonNegative(params.custoTotalCentavos);
  const precoRecomendadoCentavos = calculateSuggestedPrice(
    custoTotalCentavos,
    params.metodoPrecificacao,
    params.percentual,
  );

  return {
    precoMinimoCentavos: applyCommercialRounding(custoTotalCentavos, params.arredondamentoStep),
    precoRecomendadoCentavos,
    precoAnuncioCentavos: applyCommercialRounding(
      precoRecomendadoCentavos,
      params.arredondamentoStep,
    ),
  };
}
