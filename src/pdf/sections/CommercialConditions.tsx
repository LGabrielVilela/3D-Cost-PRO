import { Text, View } from "@react-pdf/renderer";

import type { QuotationPublicData } from "@/quotation/types";

import { pdfStyles } from "../styles";

/** Bloco "Condições comerciais" — forma(s) de pagamento, prazo de entrega e validade. */
export function CommercialConditions({ data }: { data: QuotationPublicData }) {
  const temCondicoes =
    data.formasPagamento.length > 0 || data.prazoEntrega || data.validadeFormatada;

  if (!temCondicoes) return null;

  return (
    <View style={pdfStyles.section} wrap={false}>
      <Text style={pdfStyles.sectionTitle}>Condições comerciais</Text>
      <View style={pdfStyles.card}>
        {data.formasPagamento.length > 0 ? (
          <View style={{ marginBottom: 8 }}>
            <Text style={pdfStyles.fieldLabel}>Forma de pagamento</Text>
            {data.formasPagamento.map((forma) => (
              <View key={forma.id} style={pdfStyles.paymentRow}>
                <Text style={pdfStyles.paymentName}>{forma.nome}</Text>
                {forma.descontoPercentual > 0 || forma.parcelamento || forma.observacao ? (
                  <Text style={pdfStyles.paymentDetail}>
                    {[
                      forma.descontoPercentual > 0 ? `${forma.descontoPercentual}% de desconto` : null,
                      forma.parcelamento,
                      forma.observacao,
                    ]
                      .filter(Boolean)
                      .join("  ·  ")}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={pdfStyles.conditionsGrid}>
          {data.prazoEntrega ? (
            <View style={pdfStyles.conditionField}>
              <Text style={pdfStyles.fieldLabel}>Prazo de entrega</Text>
              <Text style={pdfStyles.fieldValue}>{data.prazoEntrega}</Text>
            </View>
          ) : null}
          {data.validadeFormatada ? (
            <View style={pdfStyles.conditionField}>
              <Text style={pdfStyles.fieldLabel}>Validade do orçamento</Text>
              <Text style={pdfStyles.fieldValue}>
                {data.validadeDias !== undefined ? `${data.validadeDias} dias` : data.validadeFormatada}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
