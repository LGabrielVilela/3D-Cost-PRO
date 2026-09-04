import { z } from "zod";

import type { Client } from "@/types/entities";

export const clientFormSchema = z.object({
  nome: z.string().min(1, "Informe o nome do cliente"),
  empresa: z.string(),
  cpfCnpj: z.string(),
  telefone: z.string(),
  whatsapp: z.string(),
  email: z.string().refine((v) => v === "" || /.+@.+\..+/.test(v), "E-mail inválido"),
  endereco: z.string(),
  observacoes: z.string(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export function buildDefaultClientFormValues(): ClientFormValues {
  return {
    nome: "",
    empresa: "",
    cpfCnpj: "",
    telefone: "",
    whatsapp: "",
    email: "",
    endereco: "",
    observacoes: "",
  };
}

export function clientToFormValues(client: Client): ClientFormValues {
  return {
    nome: client.nome,
    empresa: client.empresa ?? "",
    cpfCnpj: client.cpfCnpj ?? "",
    telefone: client.telefone ?? "",
    whatsapp: client.whatsapp ?? "",
    email: client.email ?? "",
    endereco: client.endereco ?? "",
    observacoes: client.observacoes ?? "",
  };
}

export function formValuesToClient(
  values: ClientFormValues,
): Omit<Client, "id" | "createdAt" | "updatedAt"> {
  return {
    nome: values.nome.trim(),
    empresa: values.empresa.trim(),
    cpfCnpj: values.cpfCnpj.trim(),
    telefone: values.telefone.trim(),
    whatsapp: values.whatsapp.trim(),
    email: values.email.trim(),
    endereco: values.endereco.trim(),
    observacoes: values.observacoes.trim(),
  };
}
