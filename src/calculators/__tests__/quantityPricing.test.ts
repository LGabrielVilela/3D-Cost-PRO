import { describe, expect, it } from "vitest";

import { DEFAULT_QUANTITY_TIERS, calculateQuantityPricing } from "../quantityPricing";

describe("calculateQuantityPricing", () => {
  const faixas = DEFAULT_QUANTITY_TIERS.map((tier, index) => ({ ...tier, id: `tier-${index}` }));

  it("reproduz a tabela de preços por quantidade do exemplo da especificação", () => {
    const rows = calculateQuantityPricing(4990, 3262, faixas);

    expect(rows.map((r) => r.quantidade)).toEqual([1, 5, 10, 25, 50]);
    expect(rows[0].precoUnitarioCentavos).toBe(4990);
    expect(rows[1].precoUnitarioCentavos).toBe(4790); // 4% de desconto
    expect(rows[2].precoUnitarioCentavos).toBe(4491); // 10% de desconto
    expect(rows[3].precoUnitarioCentavos).toBe(4192); // 16% de desconto
    expect(rows[4].precoUnitarioCentavos).toBe(3892); // 22% de desconto
  });

  it("calcula o total multiplicando preço unitário × quantidade", () => {
    const rows = calculateQuantityPricing(4990, 3262, faixas);
    const faixaDe10 = rows.find((r) => r.quantidade === 10)!;
    expect(faixaDe10.totalCentavos).toBe(faixaDe10.precoUnitarioCentavos * 10);
  });

  it("ordena as faixas por quantidade crescente mesmo se vierem fora de ordem", () => {
    const desordenadas = [
      { id: "a", quantidade: 50, descontoPercentual: 22 },
      { id: "b", quantidade: 1, descontoPercentual: 0 },
    ];
    const rows = calculateQuantityPricing(4990, 3262, desordenadas);
    expect(rows.map((r) => r.quantidade)).toEqual([1, 50]);
  });

  it("margem cai conforme o desconto aumenta", () => {
    const rows = calculateQuantityPricing(4990, 3262, faixas);
    const margens = rows.map((r) => r.margemPercentual);
    for (let i = 1; i < margens.length; i++) {
      expect(margens[i]).toBeLessThan(margens[i - 1]);
    }
  });
});
