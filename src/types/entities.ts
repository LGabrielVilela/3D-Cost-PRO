/**
 * Modelos de dados do domínio "3D Cost Pro".
 *
 * Convenção monetária: todo valor em dinheiro é armazenado em CENTAVOS
 * (inteiro), nunca em ponto flutuante. Ver `src/lib/money.ts` para
 * conversão/formatação. Campos com o sufixo `Centavos` seguem essa regra.
 *
 * Convenção de peso: sempre em GRAMAS (inteiro ou decimal).
 * Convenção de tempo: sempre em MINUTOS (inteiro) para evitar ambiguidade
 * entre horas fracionadas (ex: 1h30 = 90).
 */

export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** ------------------------------------------------------------------ */
/** Materiais                                                          */
/** ------------------------------------------------------------------ */

export type MaterialType =
  | "PLA"
  | "PETG"
  | "ABS"
  | "TPU"
  | "ASA"
  | "Resina"
  | "Nylon"
  | "Outro";

export interface Material extends BaseEntity {
  nome: string;
  tipo: MaterialType;
  marca?: string;
  cor?: string;
  precoCentavos: number;
  pesoRoloGramas: number;
  fornecedor?: string;
  observacoes?: string;
}

/** ------------------------------------------------------------------ */
/** Impressoras                                                        */
/** ------------------------------------------------------------------ */

export interface Printer extends BaseEntity {
  nome: string;
  marca?: string;
  modelo?: string;
  precoAquisicaoCentavos: number;
  consumoWatts: number;
  vidaUtilHoras: number;
  manutencaoPorHoraCentavos: number;
  observacoes?: string;
}

/** ------------------------------------------------------------------ */
/** Clientes                                                           */
/** ------------------------------------------------------------------ */

export interface Client extends BaseEntity {
  nome: string;
  empresa?: string;
  cpfCnpj?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
}

/** ------------------------------------------------------------------ */
/** Cálculo de custo/preço                                             */
/** ------------------------------------------------------------------ */

export type MetodoManutencao = "porHora" | "percentual";
export type MetodoPrecificacao = "margem" | "markup";

export interface OutroCustoItem {
  id: ID;
  descricao: string;
  valorCentavos: number;
}

export interface PaymentMethodFee {
  id: ID;
  nome: string;
  taxaPercentual: number; // 0-100
  taxaFixaCentavos: number;
  parcelas?: number;
}

/** Faixa de desconto por quantidade (ex: "a partir de 10 un., 10% de desconto"). */
export interface QuantityTier {
  id: ID;
  quantidade: number;
  descontoPercentual: number;
}

/** Passo de arredondamento comercial (múltiplo de reais usado como base do "R$ X0,90"). */
export type CommercialRoundingStep = 1 | 5 | 10 | 50 | 100;

export interface CalculationInput {
  // Etapa 1 — impressão
  materialId?: ID;
  materialNome: string;
  filamentoPrecoCentavos: number;
  filamentoPesoRoloGramas: number;
  gramasUtilizadas: number;
  tempoImpressaoMinutos: number;
  quantidadePecas: number;

  // Etapa 2 — energia
  printerId?: ID;
  printerNome: string;
  consumoWatts: number;
  valorKwhCentavos: number;

  // Etapa 3 — depreciação
  depreciacaoAtiva: boolean;
  precoImpressoraCentavos: number;
  vidaUtilHoras: number;

  // Etapa 4 — manutenção
  manutencaoMetodo: MetodoManutencao;
  manutencaoPorHoraCentavos: number;
  manutencaoPercentual: number;

  // Etapa 5 — perdas
  taxaFalhasPercentual: number;

  // Etapa 6 — mão de obra
  tempoPreparacaoMinutos: number;
  tempoAcabamentoMinutos: number;
  tempoEmbalagemMinutos: number;
  valorHoraTrabalhoCentavos: number;
  maoDeObraUsarValorFixo: boolean;
  maoDeObraValorFixoCentavos?: number;

  // Etapa 7 — embalagem
  embalagemCentavos: number;
  etiquetaCentavos: number;
  adesivoCentavos: number;
  protecaoCentavos: number;
  embalagemOutrosCentavos: number;

  // Etapa 8 — outros custos
  outrosCustos: OutroCustoItem[];

  // Precificação
  metodoPrecificacao: MetodoPrecificacao;
  margemPercentual: number;
  markupPercentual: number;
  /** Passo de arredondamento do preço de anúncio. `undefined` = sugestão automática pela faixa de preço. */
  precoAnuncioArredondamentoStep?: CommercialRoundingStep;

  // Taxas de venda
  taxasPagamento: PaymentMethodFee[];

  // Desconto
  descontoPercentual: number;

  // Preços por quantidade
  faixasQuantidade: QuantityTier[];
}

export interface CalculationCostBreakdown {
  filamentoCentavos: number;
  energiaCentavos: number;
  depreciacaoCentavos: number;
  manutencaoCentavos: number;
  custoAntesPerdasCentavos: number;
  perdasCentavos: number;
  custoAposPerdasCentavos: number;
  maoDeObraCentavos: number;
  embalagemCentavos: number;
  outrosCentavos: number;
  custoTotalCentavos: number;
  custoPorUnidadeCentavos: number;
}

export interface CalculationPricingResult {
  precoMinimoCentavos: number;
  precoRecomendadoCentavos: number;
  precoAnuncioCentavos: number;
}

export interface Calculation extends BaseEntity {
  nome: string;
  input: CalculationInput;
  custos: CalculationCostBreakdown;
  precos: CalculationPricingResult;
}

/** ------------------------------------------------------------------ */
/** Orçamentos                                                         */
/** ------------------------------------------------------------------ */

export type QuoteStatus =
  | "rascunho"
  | "enviado"
  | "aguardando_aprovacao"
  | "aprovado"
  | "recusado"
  | "expirado"
  | "cancelado";

export interface QuoteItem {
  id: ID;
  descricao: string;
  material?: string;
  cor?: string;
  quantidade: number;
  precoUnitarioCentavos: number;
  totalCentavos: number;
}

export interface QuotePaymentOption {
  id: ID;
  nome: string;
  descontoPercentual: number;
  /** Texto livre de parcelamento, ex: "Até 3x sem juros". */
  parcelamento?: string;
  observacao?: string;
}

/** Percentual do subtotal ou valor fixo em centavos — nunca os dois ao mesmo tempo. */
export type DiscountType = "percentual" | "valorFixo";

export interface Quote extends BaseEntity {
  numero: number;
  clientId?: ID;
  /** Cálculo de origem, quando o orçamento foi criado a partir da calculadora. */
  calculationId?: ID;
  descricaoServico: string;
  itens: QuoteItem[];
  prazoEntrega?: string;
  dataOrcamento: string; // ISO date — editável pelo usuário
  validadeData: string; // ISO date
  formasPagamento: QuotePaymentOption[];
  /** Mantido por compatibilidade: percentual de desconto quando `descontoTipo` é "percentual". */
  descontoPercentual: number;
  descontoTipo?: DiscountType;
  /** Usado apenas quando `descontoTipo` é "valorFixo". */
  descontoValorFixoCentavos?: number;
  /** Foto do produto (data URL), opcional. */
  imagemDataUrl?: string;
  observacoes?: string;
  status: QuoteStatus;
  subtotalCentavos: number;
  descontoCentavos?: number;
  totalCentavos: number;
}

/** ------------------------------------------------------------------ */
/** Configurações                                                      */
/** ------------------------------------------------------------------ */

export interface CompanySettings {
  nome: string;
  nomeFantasia?: string;
  logoDataUrl?: string;
  cnpj?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  site?: string;
}

/** Personalização visual do orçamento/PDF. */
export interface BrandingSettings {
  corPrincipal: string;
  corSecundaria: string;
  textoRodape: string;
  mensagemAgradecimento: string;
  mostrarAssinatura: boolean;
}

export interface PricingSettings {
  margemPadraoPercentual: number;
  markupPadraoPercentual: number;
  taxaPadraoPercentual: number;
  percentualPerdasPadrao: number;
  custoMaoDeObraPadraoCentavos: number;
  custoEmbalagemPadraoCentavos: number;
}

export interface QuoteSettings {
  validadePadraoDias: number;
  prazoPadraoTexto: string;
  textoObservacaoPadrao: string;
  formaPagamentoPadrao: string;
}

export interface AppSettings {
  empresa: CompanySettings;
  precificacao: PricingSettings;
  orcamento: QuoteSettings;
  branding: BrandingSettings;
}
