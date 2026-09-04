import { z } from "zod";

import { centavosToReais, reaisToCentavos } from "@/lib/money";
import type { AppSettings } from "@/types/entities";

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, "Use um código de cor hexadecimal, ex: #2563EB");

export const settingsFormSchema = z.object({
  empresa: z.object({
    nome: z.string().min(1, "Informe o nome da empresa"),
    nomeFantasia: z.string(),
    logoDataUrl: z.string().optional(),
    cnpj: z.string(),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string().refine((v) => v === "" || /.+@.+\..+/.test(v), "E-mail inválido"),
    instagram: z.string(),
    site: z.string(),
    endereco: z.string(),
    cidade: z.string(),
    estado: z.string(),
    cep: z.string(),
  }),
  branding: z.object({
    corPrincipal: hexColor,
    corSecundaria: hexColor,
    textoRodape: z.string().min(1, "Informe o texto do rodapé"),
    mensagemAgradecimento: z.string().min(1, "Informe a mensagem de agradecimento"),
    mostrarAssinatura: z.boolean(),
  }),
  precificacao: z.object({
    margemPadraoPercentual: z.number().min(0).max(99.9),
    markupPadraoPercentual: z.number().min(0),
    taxaPadraoPercentual: z.number().min(0).max(100),
    percentualPerdasPadrao: z.number().min(0).max(100),
    custoMaoDeObraPadrao: z.string(),
    custoEmbalagemPadrao: z.string(),
  }),
  orcamento: z.object({
    validadePadraoDias: z.number().int().min(1, "A validade padrão deve ser de pelo menos 1 dia"),
    prazoPadraoTexto: z.string(),
    textoObservacaoPadrao: z.string(),
    formaPagamentoPadrao: z.string(),
  }),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function settingsToFormValues(settings: AppSettings): SettingsFormValues {
  return {
    empresa: {
      nome: settings.empresa.nome,
      nomeFantasia: settings.empresa.nomeFantasia ?? "",
      logoDataUrl: settings.empresa.logoDataUrl,
      cnpj: settings.empresa.cnpj ?? "",
      telefone: settings.empresa.telefone ?? "",
      whatsapp: settings.empresa.whatsapp ?? "",
      email: settings.empresa.email ?? "",
      instagram: settings.empresa.instagram ?? "",
      site: settings.empresa.site ?? "",
      endereco: settings.empresa.endereco ?? "",
      cidade: settings.empresa.cidade ?? "",
      estado: settings.empresa.estado ?? "",
      cep: settings.empresa.cep ?? "",
    },
    branding: { ...settings.branding },
    precificacao: {
      margemPadraoPercentual: settings.precificacao.margemPadraoPercentual,
      markupPadraoPercentual: settings.precificacao.markupPadraoPercentual,
      taxaPadraoPercentual: settings.precificacao.taxaPadraoPercentual,
      percentualPerdasPadrao: settings.precificacao.percentualPerdasPadrao,
      custoMaoDeObraPadrao: centavosToReais(settings.precificacao.custoMaoDeObraPadraoCentavos).toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 },
      ),
      custoEmbalagemPadrao: centavosToReais(settings.precificacao.custoEmbalagemPadraoCentavos).toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 },
      ),
    },
    orcamento: { ...settings.orcamento },
  };
}

export function formValuesToSettings(values: SettingsFormValues): AppSettings {
  return {
    empresa: { ...values.empresa },
    branding: { ...values.branding },
    precificacao: {
      margemPadraoPercentual: values.precificacao.margemPadraoPercentual,
      markupPadraoPercentual: values.precificacao.markupPadraoPercentual,
      taxaPadraoPercentual: values.precificacao.taxaPadraoPercentual,
      percentualPerdasPadrao: values.precificacao.percentualPerdasPadrao,
      custoMaoDeObraPadraoCentavos: reaisToCentavos(values.precificacao.custoMaoDeObraPadrao),
      custoEmbalagemPadraoCentavos: reaisToCentavos(values.precificacao.custoEmbalagemPadrao),
    },
    orcamento: { ...values.orcamento },
  };
}
