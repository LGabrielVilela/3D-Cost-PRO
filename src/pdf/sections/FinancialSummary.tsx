import { Text, View } from "@react-pdf/renderer";

import { formatCentavos } from "@/lib/money";
import type { QuotationBranding, QuotationTotals } from "@/quotation/types";

import { pdfStyles } from "../styles";

interface FinancialSummaryProps {
  totais: QuotationTotals;
  branding: QuotationBranding;
}

/** Resumo financeiro — o TOTAL é o maior destaque visual do documento. Nenhum custo interno aparece aqui. */
export function FinancialSummary({ totais, branding }: FinancialSummaryProps) {
  return (
    <View style={pdfStyles.summaryWrapper} wrap={false}>
      <View style={pdfStyles.summaryBox}>
        <View style={pdfStyles.summaryRow}>
          <Text style={pdfStyles.summaryLabel}>Subtotal</Text>
          <Text style={pdfStyles.summaryValue}>{formatCentavos(totais.subtotalCentavos)}</Text>
        </View>

        {totais.temDesconto ? (
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Desconto</Text>
            <Text style={pdfStyles.summaryValue}>- {formatCentavos(totais.descontoCentavos)}</Text>
          </View>
        ) : null}

        <View style={pdfStyles.summaryDivider} />

        <View style={[pdfStyles.totalRow, { backgroundColor: branding.corPrincipal }]}>
          <Text style={pdfStyles.totalLabel}>TOTAL</Text>
          <Text style={pdfStyles.totalValue}>{formatCentavos(totais.totalCentavos)}</Text>
        </View>
      </View>
    </View>
  );
}
