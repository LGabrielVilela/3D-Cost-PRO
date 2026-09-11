export interface CompanyDisplayName {
  /** Nome grande, em destaque (topo do cabeçalho/rodapé). */
  destaque: string;
  /** Nome menor, como subtítulo — só quando os dois nomes estão preenchidos. */
  secundario?: string;
}

/**
 * Decide qual nome mostra em destaque e qual mostra como subtítulo no PDF.
 * Prioriza o "Nome fantasia" — é a marca que o cliente reconhece — e usa o
 * "Nome da empresa" (razão social) só como subtítulo menor, quando os dois
 * estiverem preenchidos. Se só um dos dois estiver cadastrado, esse vira o
 * destaque (nunca deixa o cabeçalho sem nome quando há pelo menos um).
 */
export function resolveCompanyDisplayName(empresa: {
  nome: string;
  nomeFantasia?: string;
}): CompanyDisplayName {
  const destaque = empresa.nomeFantasia || empresa.nome;
  const secundario = empresa.nomeFantasia && empresa.nome ? empresa.nome : undefined;
  return { destaque, secundario };
}
