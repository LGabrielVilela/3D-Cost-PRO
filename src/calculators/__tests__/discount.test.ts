import { describe, expect, it } from "vitest";

import { calculateDiscount } from "../discount";

describe("calculateDiscount", () => {
  it("aplica o desconto pelo exemplo da especificação: R$49,90 com 10% => R$44,91", () => {
    const result = calculateDiscount(4990, 10, 3262, 3990);
    expect(result.precoFinalCentavos).toBe(4491);
  });

  it("sem desconto, o preço final é igual ao original", () => {
    const result = calculateDiscount(4990, 0, 3262, 3990);
    expect(result.precoFinalCentavos).toBe(4990);
    expect(result.abaixoDoPrecoMinimo).toBe(false);
  });

  it("sinaliza quando o desconto joga o preço abaixo do mínimo", () => {
    // preço 49,90 com 30% de desconto = 34,93, abaixo do mínimo de 39,90
    const result = calculateDiscount(4990, 30, 3262, 3990);
    expect(result.precoFinalCentavos).toBe(3493);
    expect(result.abaixoDoPrecoMinimo).toBe(true);
  });

  it("calcula a margem real após o desconto", () => {
    const result = calculateDiscount(4990, 10, 3262, 3990);
    // margem = (4491 - 3262) / 4491 * 100 ≈ 27,37%
    expect(result.margemAposDescontoPercentual).toBeCloseTo(27.37, 1);
  });
});
