import { Text, View } from "@react-pdf/renderer";

import type { QuotationPublicData } from "@/quotation/types";

import { pdfStyles } from "../styles";

/** Rodapé fixo — mensagem de agradecimento + contatos da empresa + paginação. */
export function FooterSection({ data }: { data: QuotationPublicData }) {
  const { empresa, branding } = data;
  const contatos = [empresa.whatsapp ? `WhatsApp: ${empresa.whatsapp}` : null, empresa.instagram, empresa.email]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <View style={pdfStyles.footer} fixed>
      <Text style={[pdfStyles.footerThanks, { color: branding.corSecundaria }]}>
        {branding.textoRodape}
      </Text>
      <Text style={pdfStyles.footerMeta}>{empresa.nomeFantasia || empresa.nome}</Text>
      {contatos ? <Text style={pdfStyles.footerMeta}>{contatos}</Text> : null}
      {empresa.endereco ? <Text style={pdfStyles.footerMeta}>{empresa.endereco}</Text> : null}

      <Text
        style={pdfStyles.footerPage}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  );
}
