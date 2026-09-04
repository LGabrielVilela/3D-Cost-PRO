import { describe, expect, it } from "vitest";

import { buildFixturePublicData } from "@/pdf/__tests__/fixtures";

import { buildQuoteWhatsappMessage, buildWhatsappUrl, normalizeWhatsappPhone } from "../whatsappMessage";

describe("buildQuoteWhatsappMessage", () => {
  it("monta a mensagem com saudação, número do orçamento, serviço, quantidade e total", () => {
    const data = buildFixturePublicData({
      cliente: {
        nome: "Maria Silva",
        empresa: "Studio Maria",
        whatsapp: "(11) 97777-5678",
      },
      itens: [
        {
          id: "1",
          descricao: "Chaveiro personalizado",
          quantidade: 20,
          precoUnitarioCentavos: 1490,
          totalCentavos: 29800,
        },
      ],
      descricaoServico: "Chaveiro personalizado",
      totais: { subtotalCentavos: 28800, descontoCentavos: 0, totalCentavos: 28800, temDesconto: false },
      prazoEntrega: "7 dias úteis",
      validadeDias: 7,
      numeroFormatado: "000125",
    });

    // Intl.NumberFormat('pt-BR') insere um espaço "non-breaking" (U+00A0)
    // entre "R$" e o número — normaliza para espaço comum antes de comparar.
    const NBSP = String.fromCharCode(0xa0);
    const mensagem = buildQuoteWhatsappMessage(data).split(NBSP).join(" ");

    expect(mensagem).toContain("Olá, Maria!");
    expect(mensagem).toContain("orçamento nº 000125");
    expect(mensagem).toContain("Chaveiro personalizado");
    expect(mensagem).toContain("20 unidades");
    expect(mensagem).toContain("R$ 288,00");
    expect(mensagem).toContain("7 dias úteis");
    expect(mensagem).toContain("Validade: 7 dias.");
    expect(mensagem).not.toMatch(/anexad/i); // nunca afirma que o PDF foi anexado automaticamente
  });

  it("funciona sem cliente selecionado", () => {
    const data = buildFixturePublicData({ cliente: undefined });
    const mensagem = buildQuoteWhatsappMessage(data);
    expect(mensagem.startsWith("Olá!")).toBe(true);
  });
});

describe("normalizeWhatsappPhone", () => {
  it("adiciona o DDI 55 quando o número não o possui", () => {
    expect(normalizeWhatsappPhone("(11) 97777-5678")).toBe("5511977775678");
  });

  it("mantém o número como está quando já parece ter DDI", () => {
    expect(normalizeWhatsappPhone("+55 11 97777-5678")).toBe("5511977775678");
  });

  it("retorna undefined para telefone vazio", () => {
    expect(normalizeWhatsappPhone(undefined)).toBeUndefined();
    expect(normalizeWhatsappPhone("")).toBeUndefined();
  });
});

describe("buildWhatsappUrl", () => {
  it("monta a URL do wa.me com a mensagem codificada", () => {
    const url = buildWhatsappUrl("(11) 97777-5678", "Olá!");
    expect(url).toBe("https://wa.me/5511977775678?text=Ol%C3%A1!");
  });
});
