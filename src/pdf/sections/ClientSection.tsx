import { Text, View } from "@react-pdf/renderer";

import type { QuotationClientInfo } from "@/quotation/types";

import { pdfStyles } from "../styles";

interface ClientFieldSpec {
  label: string;
  value?: string;
}

/** Bloco "Dados do cliente" — só aparece se houver cliente, e só mostra campos preenchidos. */
export function ClientSection({ cliente }: { cliente?: QuotationClientInfo }) {
  if (!cliente) return null;

  const campos: ClientFieldSpec[] = [
    { label: "Nome", value: cliente.nome },
    { label: "Empresa", value: cliente.empresa },
    { label: "CNPJ/CPF", value: cliente.cpfCnpj },
    { label: "WhatsApp", value: cliente.whatsapp },
    { label: "Telefone", value: cliente.telefone },
    { label: "E-mail", value: cliente.email },
    { label: "Endereço", value: cliente.endereco },
  ].filter((campo) => Boolean(campo.value));

  if (campos.length === 0) return null;

  return (
    <View style={pdfStyles.section} wrap={false}>
      <Text style={pdfStyles.sectionTitle}>Dados do cliente</Text>
      <View style={[pdfStyles.card, pdfStyles.clientGrid]}>
        {campos.map((campo) => (
          <View key={campo.label} style={pdfStyles.clientField}>
            <Text style={pdfStyles.fieldLabel}>{campo.label}</Text>
            <Text style={pdfStyles.fieldValue}>{campo.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
