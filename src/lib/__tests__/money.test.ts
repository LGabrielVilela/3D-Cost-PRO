import { describe, expect, it } from "vitest";

import {
  applyPercentual,
  clampNonNegative,
  formatCentavos,
  formatDuracao,
  formatPeso,
  reaisToCentavos,
} from "../money";

describe("reaisToCentavos", () => {
  it("converte números decimais simples", () => {
    expect(reaisToCentavos(32.62)).toBe(3262);
  });

  it("aceita string com vírgula (formato pt-BR)", () => {
    expect(reaisToCentavos("32,62")).toBe(3262);
  });

  it("aceita string com separador de milhar", () => {
    expect(reaisToCentavos("1.234,56")).toBe(123456);
  });

  it("valor vazio ou inválido resulta em 0 (não trava a UI)", () => {
    expect(reaisToCentavos("")).toBe(0);
    expect(reaisToCentavos("abc")).toBe(0);
    expect(reaisToCentavos(Number.NaN)).toBe(0);
  });
});

describe("clampNonNegative", () => {
  it("mantém valores positivos", () => {
    expect(clampNonNegative(10)).toBe(10);
  });

  it("zera valores negativos", () => {
    expect(clampNonNegative(-10)).toBe(0);
  });

  it("zera zero, NaN e infinito", () => {
    expect(clampNonNegative(0)).toBe(0);
    expect(clampNonNegative(Number.NaN)).toBe(0);
    expect(clampNonNegative(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("applyPercentual", () => {
  it("aplica um percentual sobre um valor em centavos", () => {
    expect(applyPercentual(10000, 10)).toBe(1000);
  });

  it("percentual 0 resulta em 0", () => {
    expect(applyPercentual(10000, 0)).toBe(0);
  });
});

describe("formatCentavos", () => {
  // Intl.NumberFormat('pt-BR') insere um espaço "non-breaking" (U+00A0) entre
  // "R$" e o número — normaliza para espaço comum (U+0020) antes de comparar.
  const NBSP = String.fromCharCode(0xa0);
  const normalizeSpaces = (valor: string) => valor.split(NBSP).join(" ");

  it("formata em pt-BR com o símbolo R$", () => {
    expect(normalizeSpaces(formatCentavos(3262))).toBe("R$ 32,62");
  });

  it("valores não finitos são tratados como R$ 0,00", () => {
    expect(normalizeSpaces(formatCentavos(Number.NaN))).toBe("R$ 0,00");
  });
});

describe("formatPeso", () => {
  it("mostra gramas abaixo de 1000g", () => {
    expect(formatPeso(100)).toBe("100 g");
  });

  it("converte para kg a partir de 1000g", () => {
    expect(formatPeso(1500)).toBe("1,5 kg");
  });
});

describe("formatDuracao", () => {
  it("mostra apenas minutos quando menor que 1 hora", () => {
    expect(formatDuracao(45)).toBe("45 min");
  });

  it("mostra horas e minutos combinados", () => {
    expect(formatDuracao(300)).toBe("5h");
    expect(formatDuracao(325)).toBe("5h 25min");
  });

  it("tempo zero ou negativo é tratado como '0 min'", () => {
    expect(formatDuracao(0)).toBe("0 min");
    expect(formatDuracao(-10)).toBe("0 min");
  });
});
