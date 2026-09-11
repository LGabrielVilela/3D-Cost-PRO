import { inflateSync } from "node:zlib";

/**
 * Extrai o texto visível de um PDF gerado pelo `react-pdf` — uso exclusivo em
 * testes, para asserções de "este texto aparece/não aparece no conteúdo
 * renderizado" (não é um parser de PDF genérico).
 *
 * O `react-pdf` grava o texto dos content streams como strings hexadecimais
 * (`<48656c6c6f>`), não como literais entre parênteses, e quebra cada run em
 * vários tokens hex separados por números de kerning dentro do operador
 * `TJ` (ex: `[<48> 0 <656c6c6f>] TJ`) — por isso não dá para procurar o
 * texto original direto nos bytes do arquivo. Aqui a gente descomprime cada
 * content stream (`FlateDecode`) e concatena os bytes de todo token
 * hexadecimal, na ordem em que aparecem, ignorando os ajustes de kerning.
 */
export function extractPdfText(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  const hexTokenRegex = /<([0-9A-Fa-f]+)>/g;

  let texto = "";
  let streamMatch: RegExpExecArray | null;
  while ((streamMatch = streamRegex.exec(raw))) {
    let decoded: Buffer;
    try {
      decoded = inflateSync(Buffer.from(streamMatch[1], "latin1"));
    } catch {
      continue; // não era um content stream comprimido (ex: imagem, fonte embutida)
    }

    const content = decoded.toString("latin1");
    let hexMatch: RegExpExecArray | null;
    while ((hexMatch = hexTokenRegex.exec(content))) {
      texto += Buffer.from(hexMatch[1], "hex").toString("latin1");
    }
  }
  return texto;
}
