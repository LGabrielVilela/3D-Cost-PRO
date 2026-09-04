import { differenceInCalendarDays, parseISO } from "date-fns";

import { STATUS_LABELS } from "@/lib/dashboardStats";
import { formatDateBr } from "@/lib/date";
import type { AppSettings, Client, Quote } from "@/types/entities";

import { calculateQuoteTotals } from "./quotationCalculator";
import { formatQuoteNumber } from "./quoteNumber";
import type { QuotationPublicData } from "./types";

/**
 * ÚNICA porta de entrada para montar os dados que a pré-visualização e o
 * PDF podem ver. Recebe apenas `Quote` (que já não guarda custos internos),
 * o `Client` referenciado e as `AppSettings` — nunca um `Calculation`.
 */
export function buildQuotationPublicData(
  quote: Quote,
  client: Client | undefined,
  settings: AppSettings,
): QuotationPublicData {
  const totais = calculateQuoteTotals({
    itens: quote.itens,
    descontoTipo: quote.descontoTipo ?? "percentual",
    descontoValor:
      (quote.descontoTipo ?? "percentual") === "valorFixo"
        ? (quote.descontoValorFixoCentavos ?? 0)
        : quote.descontoPercentual,
  });

  return {
    numero: quote.numero,
    numeroFormatado: formatQuoteNumber(quote.numero),
    dataFormatada: formatDateBr(quote.dataOrcamento),
    validadeFormatada: formatDateBr(quote.validadeData),
    validadeDias: calculateValidadeDias(quote.dataOrcamento, quote.validadeData),
    status: STATUS_LABELS[quote.status],
    empresa: {
      nome: settings.empresa.nome,
      nomeFantasia: settings.empresa.nomeFantasia || undefined,
      logoDataUrl: settings.empresa.logoDataUrl,
      cnpj: settings.empresa.cnpj || undefined,
      telefone: settings.empresa.telefone || undefined,
      whatsapp: settings.empresa.whatsapp || undefined,
      email: settings.empresa.email || undefined,
      instagram: settings.empresa.instagram || undefined,
      site: settings.empresa.site || undefined,
      endereco: formatCompanyAddress(settings.empresa),
    },
    cliente: client
      ? {
          nome: client.nome,
          empresa: client.empresa || undefined,
          cpfCnpj: client.cpfCnpj || undefined,
          whatsapp: client.whatsapp || undefined,
          telefone: client.telefone || undefined,
          email: client.email || undefined,
          endereco: client.endereco || undefined,
        }
      : undefined,
    descricaoServico: quote.descricaoServico,
    itens: quote.itens.map((item) => ({
      id: item.id,
      descricao: item.descricao,
      material: item.material || undefined,
      cor: item.cor || undefined,
      quantidade: item.quantidade,
      precoUnitarioCentavos: item.precoUnitarioCentavos,
      totalCentavos: item.totalCentavos,
    })),
    imagemDataUrl: quote.imagemDataUrl,
    prazoEntrega: quote.prazoEntrega || undefined,
    formasPagamento: quote.formasPagamento.map((forma) => ({
      id: forma.id,
      nome: forma.nome,
      descontoPercentual: forma.descontoPercentual,
      parcelamento: forma.parcelamento || undefined,
      observacao: forma.observacao || undefined,
    })),
    observacoes: quote.observacoes || undefined,
    totais: {
      subtotalCentavos: totais.subtotalCentavos,
      descontoCentavos: totais.descontoCentavos,
      totalCentavos: totais.totalCentavos,
      temDesconto: totais.descontoCentavos > 0,
    },
    branding: {
      corPrincipal: settings.branding.corPrincipal,
      corSecundaria: settings.branding.corSecundaria,
      textoRodape: settings.branding.textoRodape,
      mensagemAgradecimento: settings.branding.mensagemAgradecimento,
      mostrarAssinatura: settings.branding.mostrarAssinatura,
    },
  };
}

function calculateValidadeDias(dataOrcamento: string, validadeData: string): number | undefined {
  try {
    const dias = differenceInCalendarDays(parseISO(validadeData), parseISO(dataOrcamento));
    return dias >= 0 ? dias : undefined;
  } catch {
    return undefined;
  }
}

function formatCompanyAddress(empresa: AppSettings["empresa"]): string | undefined {
  const partes = [empresa.endereco, empresa.cidade, empresa.estado, empresa.cep].filter(Boolean);
  return partes.length > 0 ? partes.join(" — ") : undefined;
}
