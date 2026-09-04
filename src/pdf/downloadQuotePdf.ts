import { buildQuotePdfFilename } from "@/quotation/quoteNumber";
import type { QuotationPublicData } from "@/quotation/types";

import { generateQuotePdfBlob } from "./generateQuotePdfBlob";

/** Gera o PDF e dispara o download no navegador com o nome de arquivo padronizado. */
export async function downloadQuotePdf(data: QuotationPublicData): Promise<void> {
  const blob = await generateQuotePdfBlob(data);
  const filename = buildQuotePdfFilename(data.numero, data.cliente?.nome);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
