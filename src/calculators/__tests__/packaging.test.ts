import { describe, expect, it } from "vitest";

import { calculatePackagingCost } from "../packaging";

describe("calculatePackagingCost", () => {
  it("soma todos os itens de embalagem", () => {
    const custo = calculatePackagingCost({
      embalagemCentavos: 200,
      etiquetaCentavos: 50,
      adesivoCentavos: 30,
      protecaoCentavos: 0,
      outrosCentavos: 20,
    });
    expect(custo).toBe(300);
  });

  it("retorna 0 quando todos os itens são 0", () => {
    const custo = calculatePackagingCost({
      embalagemCentavos: 0,
      etiquetaCentavos: 0,
      adesivoCentavos: 0,
      protecaoCentavos: 0,
      outrosCentavos: 0,
    });
    expect(custo).toBe(0);
  });
});
