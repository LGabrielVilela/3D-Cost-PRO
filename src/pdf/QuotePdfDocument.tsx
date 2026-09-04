import { Document, Page } from "@react-pdf/renderer";

import type { QuotationPublicData } from "@/quotation/types";

import { ClientSection } from "./sections/ClientSection";
import { CommercialConditions } from "./sections/CommercialConditions";
import { FinancialSummary } from "./sections/FinancialSummary";
import { FooterSection } from "./sections/FooterSection";
import { HeaderSection } from "./sections/HeaderSection";
import { ItemsTable } from "./sections/ItemsTable";
import { ObservationsSection } from "./sections/ObservationsSection";
import { ProductSection } from "./sections/ProductSection";
import { SignatureSection } from "./sections/SignatureSection";
import { pdfStyles } from "./styles";

interface QuotePdfDocumentProps {
  data: QuotationPublicData;
}

/**
 * Documento PDF do orçamento — A4, retrato. Único componente usado tanto
 * para a pré-visualização (`QuotePdfPreview`, via `<PDFViewer>`) quanto para
 * o arquivo final (`generateQuotePdfBlob`, via `pdf().toBlob()`).
 *
 * Recebe exclusivamente `QuotationPublicData` — nunca um `Calculation` ou
 * `CalculationCostBreakdown` — para garantir que nenhum custo interno possa
 * vazar para o cliente.
 */
export function QuotePdfDocument({ data }: QuotePdfDocumentProps) {
  return (
    <Document title={`Orçamento ${data.numeroFormatado}`} author={data.empresa.nome}>
      <Page size="A4" style={pdfStyles.page} wrap>
        <HeaderSection data={data} />

        <ClientSection cliente={data.cliente} />
        <ProductSection data={data} />
        <ItemsTable itens={data.itens} branding={data.branding} />
        <FinancialSummary totais={data.totais} branding={data.branding} />
        <CommercialConditions data={data} />
        <ObservationsSection observacoes={data.observacoes} />
        <SignatureSection mostrar={data.branding.mostrarAssinatura} />

        <FooterSection data={data} />
      </Page>
    </Document>
  );
}
