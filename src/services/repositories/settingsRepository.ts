import { STORAGE_KEYS } from "@/services/storage/localStorageAdapter";
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
 * Mesma ideia de troca futura para Supabase: a interface pública
 * (`get`/`save`) não muda, só a implementação interna.
 */
class SettingsRepository {
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  async get(): Promise<AppSettings> {
    if (!this.isBrowser()) return DEFAULT_SETTINGS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return {
        empresa: { ...DEFAULT_SETTINGS.empresa, ...parsed.empresa },
        precificacao: { ...DEFAULT_SETTINGS.precificacao, ...parsed.precificacao },
        orcamento: { ...DEFAULT_SETTINGS.orcamento, ...parsed.orcamento },
        branding: { ...DEFAULT_SETTINGS.branding, ...parsed.branding },
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async save(settings: AppSettings): Promise<AppSettings> {
    if (this.isBrowser()) {
      window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    }
    return settings;
  }
}

export const settingsRepository = new SettingsRepository();
