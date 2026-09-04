/** Formata o número sequencial do orçamento: 1 → "000001". */
export function formatQuoteNumber(numero: number): string {
  return String(Math.max(0, Math.trunc(numero))).padStart(6, "0");
}

// Marcas de acentuação combinantes (Unicode U+0300–U+036F), isoladas da letra
// base depois de uma normalização NFD (ex: "ã" -> "a" + marca combinante).
const COMBINING_MARKS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

/** Remove acentos e caracteres inválidos de nome de arquivo, preservando letras/números/_/-. */
function sanitizeFilenamePart(value: string): string {
  const semAcentos = value.normalize("NFD").replace(COMBINING_MARKS_REGEX, "");
  return semAcentos
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Nome de arquivo do PDF: "Orcamento_000125_Maria_Silva.pdf". */
export function buildQuotePdfFilename(numero: number, clienteNome?: string): string {
  const numeroFormatado = formatQuoteNumber(numero);
  const nomeSanitizado = clienteNome ? sanitizeFilenamePart(clienteNome) : "";
  const partes = ["Orcamento", numeroFormatado, nomeSanitizado].filter(Boolean);
  return `${partes.join("_")}.pdf`;
}
