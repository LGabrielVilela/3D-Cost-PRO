import { Text, View } from "@react-pdf/renderer";

import { pdfStyles } from "../styles";

/** Bloco "Observações" — ocultado completamente quando não há texto. */
export function ObservationsSection({ observacoes }: { observacoes?: string }) {
  if (!observacoes) return null;

  return (
    <View style={pdfStyles.section} wrap={false}>
      <Text style={pdfStyles.sectionTitle}>Observações</Text>
      <Text style={pdfStyles.observationsText}>{observacoes}</Text>
    </View>
  );
}
