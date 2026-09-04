import { sumCentavos } from "@/lib/money";
import type { OutroCustoItem } from "@/types/entities";

/** Soma a lista livre de "outros custos" (imã, argola, pintura, etc.). */
export function calculateOtherCosts(itens: OutroCustoItem[]): number {
  return sumCentavos(...itens.map((item) => item.valorCentavos));
}
