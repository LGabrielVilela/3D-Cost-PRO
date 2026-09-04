import { integer, jsonb, pgTable, real, text } from "drizzle-orm/pg-core";

import type {
  BrandingSettings,
  CalculationCostBreakdown,
  CalculationInput,
  CalculationPricingResult,
  CompanySettings,
  DiscountType,
  MaterialType,
  PricingSettings,
  QuotePaymentOption,
  QuoteItem,
  QuoteSettings,
  QuoteStatus,
} from "@/types/entities";

/**
 * Schema Drizzle/Postgres (Neon) — espelha os tipos de `src/types/entities.ts`.
 *
 * Convenções mantidas do storage anterior (`localStorageAdapter`):
 * - dinheiro em CENTAVOS (integer), peso em GRAMAS, tempo em MINUTOS.
 * - `createdAt`/`updatedAt` como texto ISO 8601 (não `timestamp`), para que
 *   os valores lidos do banco continuem sendo `string`, igual ao contrato
 *   de `BaseEntity` já usado por toda a aplicação.
 */

export const materials = pgTable("materials", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  tipo: text("tipo").$type<MaterialType>().notNull(),
  marca: text("marca"),
  cor: text("cor"),
  precoCentavos: integer("preco_centavos").notNull(),
  pesoRoloGramas: real("peso_rolo_gramas").notNull(),
  fornecedor: text("fornecedor"),
  observacoes: text("observacoes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const printers = pgTable("printers", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  marca: text("marca"),
  modelo: text("modelo"),
  precoAquisicaoCentavos: integer("preco_aquisicao_centavos").notNull(),
  consumoWatts: real("consumo_watts").notNull(),
  vidaUtilHoras: real("vida_util_horas").notNull(),
  manutencaoPorHoraCentavos: integer("manutencao_por_hora_centavos").notNull(),
  observacoes: text("observacoes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  empresa: text("empresa"),
  cpfCnpj: text("cpf_cnpj"),
  telefone: text("telefone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  endereco: text("endereco"),
  observacoes: text("observacoes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const calculations = pgTable("calculations", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  input: jsonb("input").$type<CalculationInput>().notNull(),
  custos: jsonb("custos").$type<CalculationCostBreakdown>().notNull(),
  precos: jsonb("precos").$type<CalculationPricingResult>().notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  numero: integer("numero").notNull(),
  clientId: text("client_id"),
  calculationId: text("calculation_id"),
  descricaoServico: text("descricao_servico").notNull(),
  itens: jsonb("itens").$type<QuoteItem[]>().notNull(),
  prazoEntrega: text("prazo_entrega"),
  dataOrcamento: text("data_orcamento").notNull(),
  validadeData: text("validade_data").notNull(),
  formasPagamento: jsonb("formas_pagamento").$type<QuotePaymentOption[]>().notNull(),
  descontoPercentual: real("desconto_percentual").notNull(),
  descontoTipo: text("desconto_tipo").$type<DiscountType>(),
  descontoValorFixoCentavos: integer("desconto_valor_fixo_centavos"),
  imagemDataUrl: text("imagem_data_url"),
  observacoes: text("observacoes"),
  status: text("status").$type<QuoteStatus>().notNull(),
  subtotalCentavos: integer("subtotal_centavos").notNull(),
  descontoCentavos: integer("desconto_centavos"),
  totalCentavos: integer("total_centavos").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/** Linha única (id fixo `"default"`) — configurações do app não são uma coleção. */
export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  empresa: jsonb("empresa").$type<CompanySettings>().notNull(),
  precificacao: jsonb("precificacao").$type<PricingSettings>().notNull(),
  orcamento: jsonb("orcamento").$type<QuoteSettings>().notNull(),
  branding: jsonb("branding").$type<BrandingSettings>().notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const SETTINGS_ROW_ID = "default";
