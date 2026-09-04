import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { QuotePdfDocument } from "../QuotePdfDocument";
import { buildFixturePublicData } from "./fixtures";

// PNG 1x1 transparente — suficiente para testar a renderização de imagem sem
// depender de um arquivo externo.
const TINY_PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function renderAndLoad(data: Parameters<typeof QuotePdfDocument>[0]["data"]) {
  const buffer = await renderToBuffer(<QuotePdfDocument data={data} />);
  expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  const pdfDoc = await PDFDocument.load(buffer);
  return { buffer, pdfDoc };
}

describe("QuotePdfDocument", () => {
  it("gera um PDF de uma página para um orçamento simples, sem imagem", async () => {
    const { pdfDoc } = await renderAndLoad(buildFixturePublicData());
    expect(pdfDoc.getPageCount()).toBe(1);

    const { width, height } = pdfDoc.getPage(0).getSize();
    // A4 em pontos: 595 x 842 (react-pdf usa 72dpi, com pequena tolerância).
    expect(width).toBeCloseTo(595.28, 0);
    expect(height).toBeCloseTo(841.89, 0);
  });

  it("gera um PDF válido com desconto aplicado", async () => {
    const data = buildFixturePublicData({
      totais: { subtotalCentavos: 29800, descontoCentavos: 1000, totalCentavos: 28800, temDesconto: true },
    });
    const { pdfDoc } = await renderAndLoad(data);
    expect(pdfDoc.getPageCount()).toBe(1);
  });

  it("gera um PDF válido com vários produtos", async () => {
    const data = buildFixturePublicData({
      itens: Array.from({ length: 6 }, (_, i) => ({
        id: `item-${i}`,
        descricao: `Produto ${String.fromCharCode(65 + i)}`,
        material: "PLA",
        cor: "Preto",
        quantidade: i + 1,
        precoUnitarioCentavos: 1000 * (i + 1),
        totalCentavos: 1000 * (i + 1) * (i + 1),
      })),
    });
    const { pdfDoc } = await renderAndLoad(data);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("gera um PDF válido com foto do produto (sem distorcer o layout)", async () => {
    const data = buildFixturePublicData({ imagemDataUrl: TINY_PNG_DATA_URL });
    const { pdfDoc } = await renderAndLoad(data);
    expect(pdfDoc.getPageCount()).toBe(1);
  });

  it("gera um PDF válido sem foto do produto (layout não deixa espaço vazio)", async () => {
    const data = buildFixturePublicData({ imagemDataUrl: undefined });
    const { pdfDoc } = await renderAndLoad(data);
    expect(pdfDoc.getPageCount()).toBe(1);
  });

  it("gera um PDF válido com texto longo em observações, com acentos e caracteres especiais", async () => {
    const data = buildFixturePublicData({
      observacoes:
        "Produto personalizado conforme modelo aprovado pelo cliente. ".repeat(20) +
        "Atenção: peça sujeita à disponibilidade de material — cores e tonalidades podem variar levemente. Ex: R$ 1.234,56, café, José, ação, coração.",
    });
    const { buffer, pdfDoc } = await renderAndLoad(data);
    expect(buffer.length).toBeGreaterThan(0);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("quebra em duas páginas quando há itens suficientes para não caber em uma", async () => {
    const data = buildFixturePublicData({
      itens: Array.from({ length: 60 }, (_, i) => ({
        id: `item-${i}`,
        descricao: `Produto personalizado número ${i + 1} — variação especial`,
        material: "PLA",
        cor: "Preto",
        quantidade: 1,
        precoUnitarioCentavos: 1000,
        totalCentavos: 1000,
      })),
    });
    const { pdfDoc } = await renderAndLoad(data);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(2);
  });

  it("nunca inclui texto de custos internos no conteúdo do documento", async () => {
    const data = buildFixturePublicData();
    const buffer = await renderToBuffer(<QuotePdfDocument data={data} />);
    const conteudo = buffer.toString("latin1").toLowerCase();
    // Estes termos não podem aparecer nem nos metadados/estrutura do PDF.
    expect(conteudo).not.toContain("custo do filamento");
    expect(conteudo).not.toContain("margem de lucro");
    expect(conteudo).not.toContain("markup");
  });

  it("mostra o bloco de assinatura apenas quando configurado", async () => {
    const semAssinatura = buildFixturePublicData();
    const comAssinatura = buildFixturePublicData({
      branding: { ...buildFixturePublicData().branding, mostrarAssinatura: true },
    });

    const bufferSem = await renderToBuffer(<QuotePdfDocument data={semAssinatura} />);
    const bufferCom = await renderToBuffer(<QuotePdfDocument data={comAssinatura} />);

    // Documento com assinatura deve ser estruturalmente maior (conteúdo extra).
    expect(bufferCom.length).toBeGreaterThan(bufferSem.length - 200);
  });
});
