import { z } from "zod";

import { generateId } from "@/lib/id";
import { centavosToReais, reaisToCentavos } from "@/lib/money";
import { calculateItemTotal } from "@/quotation/quotationCalculator";
import type { DiscountType, Quote, QuoteStatus } from "@/types/entities";

export const quoteItemFormSchema = z.object({
  id: z.string(),
  descricao: z.string().min(1, "Informe a descrição do item"),
  material: z.string(),
  cor: z.string(),
  quantidade: z.number({ error: "Informe a quantidade" }).int().min(1, "A quantidade deve ser pelo menos 1"),
  precoUnitario: z
    .string()
    .min(1, "Informe o preço unitário")
    .refine((v) => reaisToCentavos(v) >= 0, "O preço não pode ser negativo"),
});

export const quotePaymentTermFormSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, "Informe o nome da forma de pagamento"),
  descontoPercentual: z.number().min(0).max(100),
  parcelamento: z.string(),
  observacao: z.string(),
});

export const quoteFormSchema = z
  .object({
    clientId: z.string().min(1, "Selecione ou cadastre um cliente"),
    descricaoServico: z.string().min(1, "Informe a descrição do serviço"),
    itens: z.array(quoteItemFormSchema).min(1, "Adicione pelo menos um item ao orçamento"),
    imagemDataUrl: z.string().optional(),
    dataOrcamento: z.string().min(1, "Informe a data do orçamento"),
    validadeDias: z.number({ error: "Informe a validade" }).int().min(1, "A validade deve ser de pelo menos 1 dia"),
    prazoEntrega: z.string(),
    formasPagamento: z.array(quotePaymentTermFormSchema),
    descontoTipo: z.enum(["percentual", "valorFixo"]),
    descontoPercentual: z.number().min(0).max(100),
    descontoValorFixo: z.string(),
    observacoes: z.string(),
    status: z.enum([
      "rascunho",
      "enviado",
      "aguardando_aprovacao",
      "aprovado",
      "recusado",
      "expirado",
      "cancelado",
    ]),
  })
  .superRefine((data, ctx) => {
    if (Number.isNaN(Date.parse(data.dataOrcamento))) {
      ctx.addIssue({
        code: "custom",
        message: "Data do orçamento inválida",
        path: ["dataOrcamento"],
      });
    }
  });

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
export type QuoteItemFormValues = z.infer<typeof quoteItemFormSchema>;
export type QuotePaymentTermFormValues = z.infer<typeof quotePaymentTermFormSchema>;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildDefaultQuoteFormValues(overrides: Partial<QuoteFormValues> = {}): QuoteFormValues {
  return {
    clientId: "",
    descricaoServico: "",
    itens: [],
    imagemDataUrl: undefined,
    dataOrcamento: todayIso(),
    validadeDias: 7,
    prazoEntrega: "7 dias úteis",
    formasPagamento: [{ id: generateId(), nome: "PIX", descontoPercentual: 0, parcelamento: "", observacao: "" }],
    descontoTipo: "percentual",
    descontoPercentual: 0,
    descontoValorFixo: "0,00",
    observacoes: "",
    status: "rascunho",
    ...overrides,
  };
}

/** Converte um `Quote` salvo de volta para valores de formulário (reabrir para edição/duplicação). */
export function quoteToFormValues(quote: Quote): QuoteFormValues {
  return {
    clientId: quote.clientId ?? "",
    descricaoServico: quote.descricaoServico,
    itens: quote.itens.map((item) => ({
      id: item.id,
      descricao: item.descricao,
      material: item.material ?? "",
      cor: item.cor ?? "",
      quantidade: item.quantidade,
      precoUnitario: centavosToReais(item.precoUnitarioCentavos).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      }),
    })),
    imagemDataUrl: quote.imagemDataUrl,
    dataOrcamento: quote.dataOrcamento,
    validadeDias: diasEntre(quote.dataOrcamento, quote.validadeData) ?? 7,
    prazoEntrega: quote.prazoEntrega ?? "",
    formasPagamento: quote.formasPagamento.map((forma) => ({
      id: forma.id,
      nome: forma.nome,
      descontoPercentual: forma.descontoPercentual,
      parcelamento: forma.parcelamento ?? "",
      observacao: forma.observacao ?? "",
    })),
    descontoTipo: quote.descontoTipo ?? "percentual",
    descontoPercentual: quote.descontoPercentual,
    descontoValorFixo: centavosToReais(quote.descontoValorFixoCentavos ?? 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    }),
    observacoes: quote.observacoes ?? "",
    status: quote.status,
  };
}

function diasEntre(dataInicioIso: string, dataFimIso: string): number | undefined {
  const inicio = Date.parse(dataInicioIso);
  const fim = Date.parse(dataFimIso);
  if (Number.isNaN(inicio) || Number.isNaN(fim)) return undefined;
  return Math.max(1, Math.round((fim - inicio) / (1000 * 60 * 60 * 24)));
}

/** Converte os valores do formulário para os campos persistidos de `Quote` (sem id/número/timestamps). */
export function formValuesToQuoteData(
  values: QuoteFormValues,
): Omit<Quote, "id" | "createdAt" | "updatedAt" | "numero" | "subtotalCentavos" | "totalCentavos" | "descontoCentavos"> {
  const validade = new Date(values.dataOrcamento);
  validade.setDate(validade.getDate() + values.validadeDias);

  return {
    clientId: values.clientId || undefined,
    descricaoServico: values.descricaoServico,
    itens: values.itens.map((item) => {
      const precoUnitarioCentavos = reaisToCentavos(item.precoUnitario);
      return {
        id: item.id,
        descricao: item.descricao,
        material: item.material || undefined,
        cor: item.cor || undefined,
        quantidade: item.quantidade,
        precoUnitarioCentavos,
        totalCentavos: calculateItemTotal(item.quantidade, precoUnitarioCentavos),
      };
    }),
    imagemDataUrl: values.imagemDataUrl,
    dataOrcamento: values.dataOrcamento,
    validadeData: validade.toISOString().slice(0, 10),
    prazoEntrega: values.prazoEntrega || undefined,
    formasPagamento: values.formasPagamento.map((forma) => ({
      id: forma.id,
      nome: forma.nome,
      descontoPercentual: forma.descontoPercentual,
      parcelamento: forma.parcelamento || undefined,
      observacao: forma.observacao || undefined,
    })),
    descontoTipo: values.descontoTipo,
    descontoPercentual: values.descontoTipo === "percentual" ? values.descontoPercentual : 0,
    descontoValorFixoCentavos:
      values.descontoTipo === "valorFixo" ? reaisToCentavos(values.descontoValorFixo) : undefined,
    observacoes: values.observacoes || undefined,
    status: values.status as QuoteStatus,
  };
}

export const QUOTE_STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "expirado", label: "Expirado" },
  { value: "cancelado", label: "Cancelado" },
];

export type { DiscountType };
