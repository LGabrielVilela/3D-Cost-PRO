import { StyleSheet } from "@react-pdf/renderer";

/**
 * Estilos compartilhados do PDF de orçamento. Cores de destaque
 * (`corPrincipal`/`corSecundaria`) vêm de `QuotationPublicData.branding` e
 * são aplicadas via style arrays nos componentes, não aqui — o resto do
 * documento (tipografia, espaçamento, cinzas neutros) fica fixo para manter
 * consistência visual entre orçamentos de empresas diferentes.
 */
export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 110,
    paddingBottom: 70,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#1F2937",
  },

  // Header (fixed)
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 32,
    paddingHorizontal: 40,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: {
    width: 56,
    height: 56,
    objectFit: "contain",
    marginRight: 10,
  },
  companyBlock: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  companyTextBlock: {
    flexShrink: 1,
  },
  companyName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
  },
  companyFantasia: {
    fontSize: 8.5,
    color: "#6B7280",
    marginBottom: 3,
  },
  companyMeta: {
    fontSize: 8,
    color: "#4B5563",
    lineHeight: 1.4,
  },
  quoteBadgeBlock: {
    alignItems: "flex-end",
  },
  quoteLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 2,
  },
  quoteNumber: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  quoteMeta: {
    fontSize: 8,
    color: "#4B5563",
    textAlign: "right",
  },
  headerDivider: {
    height: 2.5,
    marginTop: 10,
  },

  // Seções gerais
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    color: "#374151",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
    padding: 10,
  },

  // Cliente
  clientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  clientField: {
    width: "50%",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 7.5,
    color: "#6B7280",
    marginBottom: 1,
  },
  fieldValue: {
    fontSize: 9.5,
    color: "#111827",
  },

  // Produto
  productRow: {
    flexDirection: "row",
    gap: 12,
  },
  productImage: {
    width: 90,
    height: 90,
    objectFit: "contain",
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },

  // Tabela de itens
  table: {
    marginTop: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: "#E5E7EB",
  },
  colItem: { width: "8%" },
  colDescricao: { width: "44%" },
  colQtd: { width: "12%", textAlign: "center" },
  colUnit: { width: "18%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  tableCellText: {
    fontSize: 9,
    color: "#111827",
  },
  tableCellMuted: {
    fontSize: 7.5,
    color: "#6B7280",
    marginTop: 1,
  },

  // Resumo financeiro
  summaryWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  summaryBox: {
    width: 220,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#4B5563",
  },
  summaryValue: {
    fontSize: 9,
    color: "#111827",
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },

  // Condições comerciais
  conditionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  conditionField: {
    width: "33%",
    marginBottom: 8,
  },
  paymentRow: {
    marginBottom: 5,
  },
  paymentName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  paymentDetail: {
    fontSize: 8.5,
    color: "#4B5563",
    marginTop: 1,
  },

  // Observações
  observationsText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
  },

  // Assinatura
  signatureBlock: {
    marginTop: 24,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#9CA3AF",
    width: 260,
    marginTop: 28,
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 8.5,
    color: "#6B7280",
  },

  // Footer (fixed)
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderTopWidth: 0.75,
    borderTopColor: "#E5E7EB",
  },
  footerThanks: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  footerMeta: {
    fontSize: 7.5,
    color: "#6B7280",
    lineHeight: 1.4,
  },
  footerPage: {
    position: "absolute",
    right: 40,
    bottom: 14,
    fontSize: 7.5,
    color: "#9CA3AF",
  },
});
