import { describe, expect, it } from "vitest";

import { buildQuotePdfFilename, formatQuoteNumber } from "../quoteNumber";

describe("formatQuoteNumber", () => {
  it("preenche com zeros à esquerda até 6 dígitos", () => {
    expect(formatQuoteNumber(1)).toBe("000001");
    expect(formatQuoteNumber(125)).toBe("000125");
    expect(formatQuoteNumber(123456)).toBe("123456");
  });
});

describe("buildQuotePdfFilename", () => {
  it("reproduz o exemplo da especificação: Orcamento_000125_Maria_Silva.pdf", () => {
    expect(buildQuotePdfFilename(125, "Maria Silva")).toBe("Orcamento_000125_Maria_Silva.pdf");
  });

  it("remove acentos e caracteres especiais do nome do cliente", () => {
    expect(buildQuotePdfFilename(2, "João D'Ávila & Cia.")).toBe("Orcamento_000002_Joao_D_Avila_Cia.pdf");
  });

  it("funciona sem nome de cliente (usa apenas o número)", () => {
    expect(buildQuotePdfFilename(3)).toBe("Orcamento_000003.pdf");
  });
});
