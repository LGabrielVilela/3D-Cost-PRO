import { Text, View } from "@react-pdf/renderer";

import { pdfStyles } from "../styles";

/** Bloco opcional "Aprovação do cliente" — controlado pela configuração `mostrarAssinatura`. */
export function SignatureSection({ mostrar }: { mostrar: boolean }) {
  if (!mostrar) return null;

  return (
    <View style={[pdfStyles.section, pdfStyles.signatureBlock]} wrap={false}>
      <Text style={pdfStyles.sectionTitle}>Aprovação do cliente</Text>
      <View style={pdfStyles.signatureLine}>
        <Text style={pdfStyles.signatureLabel}>Nome</Text>
      </View>
      <View style={pdfStyles.signatureLine}>
        <Text style={pdfStyles.signatureLabel}>Assinatura</Text>
      </View>
      <View style={[pdfStyles.signatureLine, { width: 140 }]}>
        <Text style={pdfStyles.signatureLabel}>Data ____ / ____ / ______</Text>
      </View>
    </View>
  );
}
