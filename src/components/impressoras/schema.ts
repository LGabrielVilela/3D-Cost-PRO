import { z } from "zod";

import { centavosToReais, reaisToCentavos } from "@/lib/money";
import type { Printer } from "@/types/entities";

export const printerFormSchema = z.object({
  nome: z.string().min(1, "Informe o nome da impressora"),
  marca: z.string(),
  modelo: z.string(),
  precoAquisicao: z
    .string()
    .min(1, "Informe o preço de aquisição")
    .refine((v) => reaisToCentavos(v) > 0, "O preço deve ser maior que zero"),
  consumoWatts: z
    .number({ error: "Informe o consumo" })
    .positive("O consumo deve ser maior que zero"),
  vidaUtilHoras: z
    .number({ error: "Informe a vida útil" })
    .positive("A vida útil deve ser maior que zero"),
  manutencaoPorHora: z.string().min(1, "Informe o custo de manutenção (ou 0)"),
  observacoes: z.string(),
});

export type PrinterFormValues = z.infer<typeof printerFormSchema>;

export function buildDefaultPrinterFormValues(): PrinterFormValues {
  return {
    nome: "",
    marca: "",
    modelo: "",
    precoAquisicao: "",
    consumoWatts: 200,
    vidaUtilHoras: 8000,
    manutencaoPorHora: "0,50",
    observacoes: "",
  };
}

export function printerToFormValues(printer: Printer): PrinterFormValues {
  return {
    nome: printer.nome,
    marca: printer.marca ?? "",
    modelo: printer.modelo ?? "",
    precoAquisicao: centavosToReais(printer.precoAquisicaoCentavos).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    }),
    consumoWatts: printer.consumoWatts,
    vidaUtilHoras: printer.vidaUtilHoras,
    manutencaoPorHora: centavosToReais(printer.manutencaoPorHoraCentavos).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    }),
    observacoes: printer.observacoes ?? "",
  };
}

export function formValuesToPrinter(
  values: PrinterFormValues,
): Omit<Printer, "id" | "createdAt" | "updatedAt"> {
  return {
    nome: values.nome.trim(),
    marca: values.marca.trim(),
    modelo: values.modelo.trim(),
    precoAquisicaoCentavos: reaisToCentavos(values.precoAquisicao),
    consumoWatts: values.consumoWatts,
    vidaUtilHoras: values.vidaUtilHoras,
    manutencaoPorHoraCentavos: reaisToCentavos(values.manutencaoPorHora),
    observacoes: values.observacoes.trim(),
  };
}
