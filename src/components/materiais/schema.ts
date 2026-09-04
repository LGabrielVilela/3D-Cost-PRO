import { z } from "zod";

import { centavosToReais, reaisToCentavos } from "@/lib/money";
import type { Material, MaterialType } from "@/types/entities";

export const MATERIAL_TYPES: MaterialType[] = [
  "PLA",
  "PETG",
  "ABS",
  "TPU",
  "ASA",
  "Resina",
  "Nylon",
  "Outro",
];

export const materialFormSchema = z.object({
  nome: z.string().min(1, "Informe o nome do material"),
  tipo: z.enum(MATERIAL_TYPES as [MaterialType, ...MaterialType[]], {
    error: "Selecione o tipo",
  }),
  marca: z.string(),
  cor: z.string(),
  preco: z
    .string()
    .min(1, "Informe o preço")
    .refine((v) => reaisToCentavos(v) > 0, "O preço deve ser maior que zero"),
  pesoRolo: z
    .number({ error: "Informe o peso do rolo" })
    .positive("O peso do rolo deve ser maior que zero"),
  fornecedor: z.string(),
  observacoes: z.string(),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;

export function buildDefaultMaterialFormValues(): MaterialFormValues {
  return {
    nome: "",
    tipo: "PLA",
    marca: "",
    cor: "",
    preco: "",
    pesoRolo: 1000,
    fornecedor: "",
    observacoes: "",
  };
}

export function materialToFormValues(material: Material): MaterialFormValues {
  return {
    nome: material.nome,
    tipo: material.tipo,
    marca: material.marca ?? "",
    cor: material.cor ?? "",
    preco: centavosToReais(material.precoCentavos).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    }),
    pesoRolo: material.pesoRoloGramas,
    fornecedor: material.fornecedor ?? "",
    observacoes: material.observacoes ?? "",
  };
}

export function formValuesToMaterial(
  values: MaterialFormValues,
): Omit<Material, "id" | "createdAt" | "updatedAt"> {
  return {
    nome: values.nome.trim(),
    tipo: values.tipo,
    marca: values.marca.trim(),
    cor: values.cor.trim(),
    precoCentavos: reaisToCentavos(values.preco),
    pesoRoloGramas: values.pesoRolo,
    fornecedor: values.fornecedor.trim(),
    observacoes: values.observacoes.trim(),
  };
}
