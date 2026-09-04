/**
 * Fronteira de segurança de dados do orçamento.
 *
 * `Quote` (src/types/entities.ts) já não guarda nenhum custo interno — mas
 * `QuotationPublicData` formaliza isso: é a ÚNICA estrutura que a
 * pré-visualização e o PDF podem enxergar, montada por
 * `buildQuotationPublicData()` a partir de `Quote` + `Client` + `AppSettings`.
 * Nenhuma função aqui tem acesso a `Calculation` (que é onde vivem os
 * custos internos — filamento, energia, mão de obra, margem etc.).
 */

export interface QuotationCompanyInfo {
  nome: string;
  nomeFantasia?: string;
  logoDataUrl?: string;
  cnpj?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  site?: string;
  endereco?: string;
}

export interface QuotationClientInfo {
  nome: string;
  empresa?: string;
  cpfCnpj?: string;
  whatsapp?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

export interface QuotationItemView {
  id: string;
  descricao: string;
  material?: string;
  cor?: string;
  quantidade: number;
  precoUnitarioCentavos: number;
  totalCentavos: number;
}

export interface QuotationPaymentTermView {
  id: string;
  nome: string;
  descontoPercentual: number;
  parcelamento?: string;
  observacao?: string;
}

export interface QuotationTotals {
  subtotalCentavos: number;
  descontoCentavos: number;
  totalCentavos: number;
  temDesconto: boolean;
}

export interface QuotationBranding {
  corPrincipal: string;
  corSecundaria: string;
  textoRodape: string;
  mensagemAgradecimento: string;
  mostrarAssinatura: boolean;
}

/** Único formato de dados aceito pela pré-visualização e pelo gerador de PDF. */
export interface QuotationPublicData {
  numero: number;
  numeroFormatado: string;
  dataFormatada: string;
  validadeFormatada: string;
  validadeDias?: number;
  status: string;
  empresa: QuotationCompanyInfo;
  cliente?: QuotationClientInfo;
  descricaoServico: string;
  itens: QuotationItemView[];
  imagemDataUrl?: string;
  prazoEntrega?: string;
  formasPagamento: QuotationPaymentTermView[];
  observacoes?: string;
  totais: QuotationTotals;
  branding: QuotationBranding;
}
