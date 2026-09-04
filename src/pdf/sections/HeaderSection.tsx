import { Image, Text, View } from "@react-pdf/renderer";

import type { QuotationPublicData } from "@/quotation/types";

import { pdfStyles } from "../styles";

/** Cabeçalho fixo — logo/dados da empresa à esquerda, identificação do orçamento à direita. */
export function HeaderSection({ data }: { data: QuotationPublicData }) {
  const { empresa, branding } = data;

  const metaLinhas = [
    empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : null,
    [empresa.telefone, empresa.whatsapp ? `WhatsApp: ${empresa.whatsapp}` : null]
      .filter(Boolean)
      .join("  ·  ") || null,
    empresa.email || null,
  ].filter((linha): linha is string => Boolean(linha));

  return (
    <View style={pdfStyles.header} fixed>
      <View style={pdfStyles.headerRow}>
        <View style={pdfStyles.companyBlock}>
          {empresa.logoDataUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text -- componente do react-pdf, não é <img> HTML
            <Image src={empresa.logoDataUrl} style={pdfStyles.logo} />
          ) : null}
          <View style={pdfStyles.companyTextBlock}>
            <Text style={[pdfStyles.companyName, { color: branding.corSecundaria }]}>
              {empresa.nome}
            </Text>
            {empresa.nomeFantasia ? (
              <Text style={pdfStyles.companyFantasia}>{empresa.nomeFantasia}</Text>
            ) : null}
            {metaLinhas.map((linha, index) => (
              <Text key={index} style={pdfStyles.companyMeta}>
                {linha}
              </Text>
            ))}
          </View>
        </View>

        <View style={pdfStyles.quoteBadgeBlock}>
          <Text style={[pdfStyles.quoteLabel, { color: branding.corPrincipal }]}>ORÇAMENTO</Text>
          <Text style={[pdfStyles.quoteNumber, { color: branding.corSecundaria }]}>
            #{data.numeroFormatado}
          </Text>
          <Text style={pdfStyles.quoteMeta}>Data: {data.dataFormatada}</Text>
          <Text style={pdfStyles.quoteMeta}>
            Validade: {data.validadeDias !== undefined ? `${data.validadeDias} dias` : data.validadeFormatada}
          </Text>
        </View>
      </View>

      <View style={[pdfStyles.headerDivider, { backgroundColor: branding.corPrincipal }]} />
    </View>
  );
}
