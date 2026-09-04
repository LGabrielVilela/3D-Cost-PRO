import { Image, Text, View } from "@react-pdf/renderer";

import type { QuotationPublicData } from "@/quotation/types";

import { pdfStyles } from "../styles";

/**
 * Bloco "Detalhes do pedido" — mostra a foto do produto (se houver) ao lado
 * da descrição. Quando há apenas um item, mostra material/cor/quantidade
 * dele; com vários itens, o detalhamento fica só na tabela de itens abaixo.
 * Sem imagem, o texto ocupa a largura toda — nunca sobra espaço vazio.
 */
export function ProductSection({ data }: { data: QuotationPublicData }) {
  const itemUnico = data.itens.length === 1 ? data.itens[0] : undefined;
  const temImagem = Boolean(data.imagemDataUrl);

  return (
    <View style={pdfStyles.section} wrap={false}>
      <Text style={pdfStyles.sectionTitle}>Detalhes do pedido</Text>
      <View style={pdfStyles.productRow}>
        {temImagem ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- componente do react-pdf, não é <img> HTML
          <Image src={data.imagemDataUrl} style={pdfStyles.productImage} />
        ) : null}
        <View style={pdfStyles.productInfo}>
          <Text style={pdfStyles.fieldValue}>{data.descricaoServico}</Text>
          {itemUnico ? (
            <View style={{ marginTop: 6, flexDirection: "row", flexWrap: "wrap" }}>
              {itemUnico.material ? (
                <Text style={[pdfStyles.tableCellMuted, { marginRight: 12 }]}>
                  Material: {itemUnico.material}
                </Text>
              ) : null}
              {itemUnico.cor ? (
                <Text style={[pdfStyles.tableCellMuted, { marginRight: 12 }]}>
                  Cor: {itemUnico.cor}
                </Text>
              ) : null}
              <Text style={pdfStyles.tableCellMuted}>Quantidade: {itemUnico.quantidade}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
