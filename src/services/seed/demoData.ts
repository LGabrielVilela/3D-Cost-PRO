import { reaisToCentavos } from "@/lib/money";
import { calculationsRepository } from "@/services/repositories/calculationsRepository";
import { clientsRepository } from "@/services/repositories/clientsRepository";
import { materialsRepository } from "@/services/repositories/materialsRepository";
import { printersRepository } from "@/services/repositories/printersRepository";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import { STORAGE_KEYS } from "@/services/storage/localStorageAdapter";
import type {
  Calculation,
  Client,
  Material,
  Printer,
  Quote,
  QuoteStatus,
} from "@/types/entities";

/**
 * Incrementar quando a "forma" dos dados demo mudar, para forçar
 * re-seed em ambientes de desenvolvimento antigos.
 */
export const SEED_VERSION = "2";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Cache do processo de seed em andamento — evita que múltiplos componentes
 * (bootstrap do layout, hooks de página) disparem o seed em paralelo e
 * dupliquem registros.
 */
let seedPromise: Promise<void> | null = null;

/** Popula o app com dados de demonstração na primeira execução (localStorage vazio). */
export function seedDemoDataIfNeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed();
  }
  return seedPromise;
}

/**
 * Uso exclusivo em testes: limpa o cache do processo de seed para que
 * `seedDemoDataIfNeeded` possa ser exercitado novamente dentro do mesmo
 * arquivo de teste (o cache normal existe para evitar seeds duplicados
 * em produção, onde o módulo só é carregado uma vez).
 */
export function __resetSeedCacheForTests(): void {
  seedPromise = null;
}

async function runSeed(): Promise<void> {
  if (!isBrowser()) return;
  const currentVersion = window.localStorage.getItem(STORAGE_KEYS.seedVersion);
  if (currentVersion === SEED_VERSION) return;

  const [materials, printers, clients, quotes] = await Promise.all([
    materialsRepository.list(),
    printersRepository.list(),
    clientsRepository.list(),
    quotesRepository.list(),
  ]);

  if (materials.length === 0) {
    await seedMaterials();
  }
  if (printers.length === 0) {
    await seedPrinters();
  }
  if (clients.length === 0) {
    await seedClients();
  }
  const calculations = await seedCalculations();
  if (quotes.length === 0) {
    await seedQuotes(calculations);
  }

  window.localStorage.setItem(STORAGE_KEYS.seedVersion, SEED_VERSION);
}

async function seedMaterials() {
  const materiais: Array<Omit<Material, "id" | "createdAt" | "updatedAt">> = [
    {
      nome: "PLA Basic",
      tipo: "PLA",
      marca: "Genérico",
      cor: "Branco",
      precoCentavos: reaisToCentavos(99),
      pesoRoloGramas: 1000,
      fornecedor: "",
      observacoes: "",
    },
    {
      nome: "PLA Premium",
      tipo: "PLA",
      marca: "Genérico",
      cor: "Preto",
      precoCentavos: reaisToCentavos(119),
      pesoRoloGramas: 1000,
      fornecedor: "",
      observacoes: "",
    },
    {
      nome: "PETG",
      tipo: "PETG",
      marca: "Genérico",
      cor: "Natural",
      precoCentavos: reaisToCentavos(109),
      pesoRoloGramas: 1000,
      fornecedor: "",
      observacoes: "",
    },
    {
      nome: "TPU",
      tipo: "TPU",
      marca: "Genérico",
      cor: "Preto",
      precoCentavos: reaisToCentavos(129),
      pesoRoloGramas: 1000,
      fornecedor: "",
      observacoes: "",
    },
  ];
  for (const material of materiais) {
    await materialsRepository.create(material);
  }
}

async function seedPrinters() {
  const impressoras: Array<Omit<Printer, "id" | "createdAt" | "updatedAt">> = [
    {
      nome: "Bambu A1",
      marca: "Bambu Lab",
      modelo: "A1",
      precoAquisicaoCentavos: reaisToCentavos(2199),
      consumoWatts: 200,
      vidaUtilHoras: 8000,
      manutencaoPorHoraCentavos: reaisToCentavos(0.5),
      observacoes: "",
    },
    {
      nome: "Bambu A1 Mini",
      marca: "Bambu Lab",
      modelo: "A1 Mini",
      precoAquisicaoCentavos: reaisToCentavos(1599),
      consumoWatts: 80,
      vidaUtilHoras: 8000,
      manutencaoPorHoraCentavos: reaisToCentavos(0.4),
      observacoes: "",
    },
    {
      nome: "Bambu P1S",
      marca: "Bambu Lab",
      modelo: "P1S",
      precoAquisicaoCentavos: reaisToCentavos(2999),
      consumoWatts: 200,
      vidaUtilHoras: 10000,
      manutencaoPorHoraCentavos: reaisToCentavos(0.6),
      observacoes: "",
    },
    {
      nome: "Bambu X1C",
      marca: "Bambu Lab",
      modelo: "X1 Carbon",
      precoAquisicaoCentavos: reaisToCentavos(6999),
      consumoWatts: 350,
      vidaUtilHoras: 12000,
      manutencaoPorHoraCentavos: reaisToCentavos(0.8),
      observacoes: "",
    },
    {
      nome: "Ender 3",
      marca: "Creality",
      modelo: "Ender 3",
      precoAquisicaoCentavos: reaisToCentavos(899),
      consumoWatts: 120,
      vidaUtilHoras: 6000,
      manutencaoPorHoraCentavos: reaisToCentavos(0.3),
      observacoes: "",
    },
  ];
  for (const printer of impressoras) {
    await printersRepository.create(printer);
  }
}

async function seedClients() {
  const clientes: Array<Omit<Client, "id" | "createdAt" | "updatedAt">> = [
    {
      nome: "Maria Souza",
      empresa: "",
      cpfCnpj: "",
      telefone: "(11) 98888-1234",
      whatsapp: "(11) 98888-1234",
      email: "maria.souza@email.com",
      endereco: "",
      observacoes: "",
    },
    {
      nome: "João Pereira",
      empresa: "Pereira Presentes",
      cpfCnpj: "",
      telefone: "(21) 97777-5678",
      whatsapp: "(21) 97777-5678",
      email: "joao@pereirapresentes.com.br",
      endereco: "",
      observacoes: "",
    },
    {
      nome: "Studio Criativo Ltda",
      empresa: "Studio Criativo",
      cpfCnpj: "12.345.678/0001-90",
      telefone: "(31) 96666-4321",
      whatsapp: "(31) 96666-4321",
      email: "contato@studiocriativo.com",
      endereco: "",
      observacoes: "Cliente recorrente",
    },
  ];
  const created: Client[] = [];
  for (const client of clientes) {
    created.push(await clientsRepository.create(client));
  }
  return created;
}

/** Cria um cálculo de exemplo replicando o caso de uso descrito na especificação. */
async function seedCalculations(): Promise<Calculation[]> {
  const existentes = await calculationsRepository.list();
  if (existentes.length > 0) return existentes;

  const exemplo: Omit<Calculation, "id" | "createdAt" | "updatedAt"> = {
    nome: "Miniatura decorativa (exemplo)",
    input: {
      materialNome: "PLA Basic",
      filamentoPrecoCentavos: reaisToCentavos(99),
      filamentoPesoRoloGramas: 1000,
      gramasUtilizadas: 100,
      tempoImpressaoMinutos: 300,
      quantidadePecas: 1,
      printerNome: "Bambu A1",
      consumoWatts: 200,
      valorKwhCentavos: reaisToCentavos(0.8),
      depreciacaoAtiva: true,
      precoImpressoraCentavos: reaisToCentavos(2199),
      vidaUtilHoras: 8000,
      manutencaoMetodo: "porHora",
      manutencaoPorHoraCentavos: reaisToCentavos(0.2),
      manutencaoPercentual: 5,
      taxaFalhasPercentual: 10,
      tempoPreparacaoMinutos: 10,
      tempoAcabamentoMinutos: 15,
      tempoEmbalagemMinutos: 5,
      valorHoraTrabalhoCentavos: reaisToCentavos(15),
      maoDeObraUsarValorFixo: true,
      maoDeObraValorFixoCentavos: reaisToCentavos(15),
      embalagemCentavos: reaisToCentavos(2),
      etiquetaCentavos: 0,
      adesivoCentavos: 0,
      protecaoCentavos: 0,
      embalagemOutrosCentavos: 0,
      outrosCustos: [],
      metodoPrecificacao: "margem",
      margemPercentual: 30,
      markupPercentual: 100,
      taxasPagamento: [],
      descontoPercentual: 0,
      faixasQuantidade: [],
    },
    custos: {
      filamentoCentavos: reaisToCentavos(9.9),
      energiaCentavos: reaisToCentavos(0.8),
      depreciacaoCentavos: reaisToCentavos(2.5),
      manutencaoCentavos: reaisToCentavos(1.0),
      custoAntesPerdasCentavos: reaisToCentavos(14.2),
      perdasCentavos: reaisToCentavos(1.42),
      custoAposPerdasCentavos: reaisToCentavos(15.62),
      maoDeObraCentavos: reaisToCentavos(15),
      embalagemCentavos: reaisToCentavos(2),
      outrosCentavos: 0,
      custoTotalCentavos: reaisToCentavos(32.62),
      custoPorUnidadeCentavos: reaisToCentavos(32.62),
    },
    precos: {
      precoMinimoCentavos: reaisToCentavos(39.9),
      precoRecomendadoCentavos: reaisToCentavos(46.6),
      precoAnuncioCentavos: reaisToCentavos(49.9),
    },
  };

  const created = await calculationsRepository.create(exemplo);
  return [created];
}

async function seedQuotes(calculations: Calculation[]) {
  const clients = await clientsRepository.list();
  if (clients.length === 0) return;

  const calculo = calculations[0];

  const statusPorIndice: QuoteStatus[] = [
    "aprovado",
    "aprovado",
    "aguardando_aprovacao",
    "enviado",
    "recusado",
    "rascunho",
  ];

  const quantidades = [1, 20, 3, 5, 1, 2];
  const diasAtras = [2, 5, 8, 12, 18, 25];

  for (let i = 0; i < statusPorIndice.length; i++) {
    const cliente = clients[i % clients.length];
    const quantidade = quantidades[i];
    const precoUnitario = calculo.precos.precoAnuncioCentavos;
    const subtotal = precoUnitario * quantidade;
    const total = subtotal;

    const quote: Omit<Quote, "id" | "createdAt" | "updatedAt"> = {
      numero: i + 1,
      clientId: cliente.id,
      calculationId: calculo.id,
      descricaoServico: "Peça personalizada em PLA",
      itens: [
        {
          id: `item-${i}`,
          descricao: "Peça personalizada em PLA",
          material: "PLA Basic",
          cor: "Branco",
          quantidade,
          precoUnitarioCentavos: precoUnitario,
          totalCentavos: subtotal,
        },
      ],
      prazoEntrega: "7 dias úteis",
      dataOrcamento: daysAgoIso(diasAtras[i]),
      validadeData: daysAgoIso(diasAtras[i] - 7),
      formasPagamento: [{ id: `pag-${i}`, nome: "PIX", descontoPercentual: 0 }],
      descontoPercentual: 0,
      descontoTipo: "percentual",
      observacoes: "",
      status: statusPorIndice[i],
      subtotalCentavos: subtotal,
      descontoCentavos: 0,
      totalCentavos: total,
    };

    const entity = {
      ...quote,
      id: `seed-quote-${i}`,
      createdAt: daysAgoIso(diasAtras[i]),
      updatedAt: daysAgoIso(diasAtras[i]),
    } as Quote;

    await quotesRepository.createRaw(entity);
  }
}
