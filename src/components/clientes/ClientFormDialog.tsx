"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@/types/entities";

import {
  buildDefaultClientFormValues,
  clientFormSchema,
  clientToFormValues,
  type ClientFormValues,
} from "./schema";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSubmit: (values: ClientFormValues) => Promise<void>;
}

/**
 * Formulário de criação/edição de cliente, em um Dialog reutilizado tanto na
 * tela de Clientes quanto no fluxo "cadastrar novo cliente" do orçamento —
 * um único formulário, uma única fonte de dados (`clientsRepository`).
 */
export function ClientFormDialog({ open, onOpenChange, client, onSubmit }: ClientFormDialogProps) {
  const isEditing = Boolean(client);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: buildDefaultClientFormValues(),
  });

  useEffect(() => {
    if (open) {
      reset(client ? clientToFormValues(client) : buildDefaultClientFormValues());
    }
  }, [open, client, reset]);

  async function onValidSubmit(values: ClientFormValues) {
    await onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Nome" htmlFor="nome" error={errors.nome?.message} className="sm:col-span-2">
              <Input id="nome" placeholder="Ex: Maria Silva" {...register("nome")} />
            </FieldShell>

            <FieldShell label="Empresa" htmlFor="empresa">
              <Input id="empresa" {...register("empresa")} />
            </FieldShell>

            <FieldShell label="CPF/CNPJ" htmlFor="cpfCnpj">
              <Input id="cpfCnpj" {...register("cpfCnpj")} />
            </FieldShell>

            <FieldShell label="Telefone" htmlFor="telefone">
              <Input id="telefone" placeholder="(11) 4000-0000" {...register("telefone")} />
            </FieldShell>

            <FieldShell label="WhatsApp" htmlFor="whatsapp">
              <Input id="whatsapp" placeholder="(11) 98888-1234" {...register("whatsapp")} />
            </FieldShell>

            <FieldShell label="E-mail" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} />
            </FieldShell>

            <FieldShell label="Endereço" htmlFor="endereco">
              <Input id="endereco" {...register("endereco")} />
            </FieldShell>

            <FieldShell label="Observações" htmlFor="observacoes" className="sm:col-span-2">
              <Textarea id="observacoes" rows={2} {...register("observacoes")} />
            </FieldShell>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? "Salvar alterações" : "Adicionar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
