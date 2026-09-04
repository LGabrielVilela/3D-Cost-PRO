import { pdf } from "@react-pdf/renderer";

import type { QuotationPublicData } from "@/quotation/types";

import { QuotePdfDocument } from "./QuotePdfDocument";

/** Gera o PDF do orçamento (mesmo componente da pré-visualização) como um Blob. */
export async function generateQuotePdfBlob(data: QuotationPublicData): Promise<Blob> {
  return pdf(<QuotePdfDocument data={data} />).toBlob();
}
