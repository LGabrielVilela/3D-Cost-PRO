import { describe, expect, it } from "vitest";

import { calculateLosses } from "../losses";

describe("calculateLosses", () => {
  it("aplica a taxa de falhas pelo exemplo da especificação", () => {
    // custo antes das perdas R$14,20 · taxa 10% => perdas R$1,42 · após R$15,62
    const result = calculateLosses({
      custoAntesPerdasCentavos: 1420,
      taxaFalhasPercentual: 10,
    });
    expect(result.perdasCentavos).toBe(142);
    expect(result.custoAposPerdasCentavos).toBe(1562);
  });

  it("com taxa de falhas 0%, custo após perdas é igual ao custo antes", () => {
    const result = calculateLosses({
      custoAntesPerdasCentavos: 1000,
      taxaFalhasPercentual: 0,
    });
    expect(result.perdasCentavos).toBe(0);
    expect(result.custoAposPerdasCentavos).toBe(1000);
  });
});
