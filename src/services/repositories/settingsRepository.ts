import { getSettings, saveSettings } from "@/services/db/settingsActions";
import type { AppSettings } from "@/types/entities";

export const DEFAULT_SETTINGS: AppSettings = {
  empresa: {
    nome: "Minha Empresa 3D",
    nomeFantasia: "",
    cnpj: "",
    telefone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    site: "",
  },
  precificacao: {
    margemPadraoPercentual: 30,
    markupPadraoPercentual: 100,
    taxaPadraoPercentual: 0,
    percentualPerdasPadrao: 10,
    custoMaoDeObraPadraoCentavos: 1500,
    custoEmbalagemPadraoCentavos: 200,
  },
  orcamento: {
    validadePadraoDias: 7,
    prazoPadraoTexto: "7 dias úteis",
    textoObservacaoPadrao: "Obrigado pela preferência!",
    formaPagamentoPadrao: "PIX",
  },
  branding: {
    corPrincipal: "#2563EB",
    corSecundaria: "#0F172A",
    textoRodape: "Obrigado pela preferência!",
    mensagemAgradecimento: "Obrigado pela preferência!",
    mostrarAssinatura: false,
  },
};

/**
 * Repositório de configurações — objeto único (não é uma coleção).
 * Implementação por Server Actions (Postgres/Neon) — ver `services/db/settingsActions.ts`.
 */
class SettingsRepository {
  async get(): Promise<AppSettings> {
    const saved = await getSettings();
    if (!saved) return DEFAULT_SETTINGS;
    return {
      empresa: { ...DEFAULT_SETTINGS.empresa, ...saved.empresa },
      precificacao: { ...DEFAULT_SETTINGS.precificacao, ...saved.precificacao },
      orcamento: { ...DEFAULT_SETTINGS.orcamento, ...saved.orcamento },
      branding: { ...DEFAULT_SETTINGS.branding, ...saved.branding },
    };
  }

  async save(settings: AppSettings): Promise<AppSettings> {
    return saveSettings(settings);
  }
}

export const settingsRepository = new SettingsRepository();
