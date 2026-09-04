import { formatCentavos } from "@/lib/money";
import type { QuotationPublicData } from "./types";

/**
 * Monta a mensagem de WhatsApp para o cliente. Não menciona anexar o PDF
 * automaticamente — o navegador não permite isso, então o texto orienta o
 * usuário a enviar o arquivo logo em seguida.
 */
export function buildQuoteWhatsappMessage(data: QuotationPublicData): string {
  const primeiroNome = data.cliente?.nome?.split(" ")[0] || data.cliente?.nome || "";
  const quantidadeTotal = data.itens.reduce((acc, item) => acc + item.quantidade, 0);
  const servico = data.descricaoServico || data.itens[0]?.descricao || "seu pedido";

  const linhas = [
    primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!",
    "",
    `Preparei seu orçamento nº ${data.numeroFormatado}.`,
    "",
    "Serviço:",
    servico,
    "",
    "Quantidade:",
    `${quantidadeTotal} unidades`,
    "",
    "Valor total:",
    formatCentavos(data.totais.totalCentavos),
  ];

  if (data.prazoEntrega) {
    linhas.push("", "Prazo de entrega:", data.prazoEntrega);
  }

  if (data.validadeDias !== undefined) {
    linhas.push("", `Validade: ${data.validadeDias} dias.`);
  }

  linhas.push(
    "",
    "Estou enviando o orçamento em PDF para sua conferência.",
    "",
    "Obrigado!",
  );

  return linhas.join("\n");
}

/** Mantém só os dígitos de um telefone e garante o DDI 55 (Brasil) quando ausente. */
export function normalizeWhatsappPhone(telefone: string | undefined): string | undefined {
  if (!telefone) return undefined;
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 0) return undefined;
  if (digitos.length <= 11) return `55${digitos}`;
  return digitos;
}

/** Monta a URL do wa.me com a mensagem já preenchida (o usuário só precisa apertar enviar). */
export function buildWhatsappUrl(telefone: string | undefined, mensagem: string): string {
  const numero = normalizeWhatsappPhone(telefone);
  const base = numero ? `https://wa.me/${numero}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(mensagem)}`;
}
