"use client";

import { PDFViewer } from "@react-pdf/renderer";

import type { QuotationPublicData } from "@/quotation/types";

import { QuotePdfDocument } from "./QuotePdfDocument";

interface QuotePdfPreviewProps {
  data: QuotationPublicData;
  className?: string;
}

/**
 * Pré-visualização fiel do orçamento: renderiza o MESMO componente
 * (`QuotePdfDocument`) usado para gerar o PDF final, dentro de um
 * `<PDFViewer>` (iframe com o PDF real) — não é uma aproximação em HTML.
 */
export function QuotePdfPreview({ data, className }: QuotePdfPreviewProps) {
  return (
    <PDFViewer className={className} style={{ width: "100%", height: "100%", border: "none" }} showToolbar={false}>
      <QuotePdfDocument data={data} />
    </PDFViewer>
  );
}
