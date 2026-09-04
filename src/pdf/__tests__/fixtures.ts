import type { QuotationPublicData } from "@/quotation/types";

export function buildFixturePublicData(
  overrides: Partial<QuotationPublicData> = {},
): QuotationPublicData {
  return {
    numero: 125,
    numeroFormatado: "000125",
    dataFormatada: "03/09/2026",
    validadeFormatada: "10/09/2026",
    validadeDias: 7,
    status: "Enviado",
    empresa: {
      nome: "3D Cost Pro Ltda",
      nomeFantasia: "3D Cost Pro",
      cnpj: "12.345.678/0001-90",
      telefone: "(11) 4000-0000",
      whatsapp: "(11) 98888-1234",
      email: "contato@3dcostpro.com",
      instagram: "@3dcostpro",
      site: "https://3dcostpro.com",
      endereco: "Rua Exemplo, 100 — São Paulo — SP",
    },
    cliente: {
      nome: "Maria Silva",
      empresa: "Studio Maria",
      cpfCnpj: "123.456.789-00",
      whatsapp: "(11) 97777-5678",
      email: "maria@email.com",
      endereco: "Av. Teste, 200",
    },
    descricaoServico: "Chaveiro personalizado abridor de lata",
    itens: [
      {
        id: "item-1",
        descricao: "Chaveiro personalizado abridor de lata",
        material: "PLA",
        cor: "Preto",
        quantidade: 20,
        precoUnitarioCentavos: 1490,
        totalCentavos: 29800,
      },
    ],
    prazoEntrega: "7 dias úteis",
    formasPagamento: [
      { id: "pag-1", nome: "PIX", descontoPercentual: 5 },
      { id: "pag-2", nome: "Cartão", descontoPercentual: 0, parcelamento: "Até 3x sem juros" },
    ],
    observacoes: "Produto personalizado conforme modelo aprovado pelo cliente.",
    totais: {
      subtotalCentavos: 29800,
      descontoCentavos: 1000,
      totalCentavos: 28800,
      temDesconto: true,
    },
    branding: {
      corPrincipal: "#2563EB",
      corSecundaria: "#0F172A",
      textoRodape: "Obrigado pela preferência!",
      mensagemAgradecimento: "Obrigado pela preferência!",
      mostrarAssinatura: false,
    },
    ...overrides,
  };
}
