import { Text, View } from "@react-pdf/renderer";

import { formatCentavos } from "@/lib/money";
import type { QuotationItemView, QuotationBranding } from "@/quotation/types";

import { pdfStyles } from "../styles";

interface ItemsTableProps {
  itens: QuotationItemView[];
  branding: QuotationBranding;
}

/** Tabela "ITEM / DESCRIÇÃO / QTD. / VALOR UNIT. / TOTAL" — quebra entre páginas sem cortar linhas. */
export function ItemsTable({ itens, branding }: ItemsTableProps) {
  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>Itens do orçamento</Text>
      <View style={pdfStyles.table}>
        <View
          style={[pdfStyles.tableHeaderRow, { backgroundColor: branding.corSecundaria }]}
          fixed
        >
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.colItem]}>Item</Text>
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.colDescricao]}>Descrição</Text>
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.colQtd]}>Qtd.</Text>
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.colUnit]}>Valor unit.</Text>
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.colTotal]}>Total</Text>
        </View>

        {itens.map((item, index) => (
          <View key={item.id} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.tableCellText, pdfStyles.colItem]}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <View style={pdfStyles.colDescricao}>
              <Text style={pdfStyles.tableCellText}>{item.descricao}</Text>
              {item.material || item.cor ? (
                <Text style={pdfStyles.tableCellMuted}>
                  {[item.material, item.cor].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </View>
            <Text style={[pdfStyles.tableCellText, pdfStyles.colQtd]}>{item.quantidade}</Text>
            <Text style={[pdfStyles.tableCellText, pdfStyles.colUnit]}>
              {formatCentavos(item.precoUnitarioCentavos)}
            </Text>
            <Text style={[pdfStyles.tableCellText, pdfStyles.colTotal]}>
              {formatCentavos(item.totalCentavos)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
