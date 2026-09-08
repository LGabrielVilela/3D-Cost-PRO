"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/hooks/useClients";
import type { Order, OrderStatus } from "@/types/entities";

import {
  buildDefaultOrderFormValues,
  NO_CLIENT_VALUE,
  ORDER_STATUS_OPTIONS,
  orderFormSchema,
  orderToFormValues,
  type OrderFormValues,
} from "./schema";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order;
  /** Coluna em que o novo pedido deve nascer (ignorado ao editar). */
  defaultStatus?: OrderStatus;
  onSubmit: (values: OrderFormValues) => Promise<void>;
}

/** Formulário de criação/edição de um pedido do Painel de Pedidos. */
export function OrderFormDialog({
  open,
  onOpenChange,
  order,
  defaultStatus = "agendado",
  onSubmit,
}: OrderFormDialogProps) {
  const isEditing = Boolean(order);
  const { clients } = useClients();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: buildDefaultOrderFormValues(defaultStatus),
  });

  useEffect(() => {
    if (open) {
      reset(order ? orderToFormValues(order) : buildDefaultOrderFormValues(defaultStatus));
    }
  }, [open, order, defaultStatus, reset]);

  async function onValidSubmit(values: OrderFormValues) {
    await onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar pedido" : "Novo pedido"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Título" htmlFor="titulo" error={errors.titulo?.message} className="sm:col-span-2">
              <Input id="titulo" placeholder="Ex: Vaso geométrico grande" {...register("titulo")} />
            </FieldShell>

            <FieldShell label="Cliente" htmlFor="clientId">
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="clientId" className="w-full">
                      <SelectValue placeholder="Sem cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CLIENT_VALUE}>Sem cliente</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldShell>

            <FieldShell label="Valor" htmlFor="valor" error={errors.valor?.message}>
              <Controller
                control={control}
                name="valor"
                render={({ field }) => (
                  <CurrencyInput id="valor" value={field.value} onChange={field.onChange} />
                )}
              />
            </FieldShell>

            <FieldShell label="Data de entrega" htmlFor="dataEntrega">
              <Input id="dataEntrega" type="date" {...register("dataEntrega")} />
            </FieldShell>

            <FieldShell label="Coluna" htmlFor="status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldShell>

            <FieldShell label="Descrição" htmlFor="descricao" className="sm:col-span-2">
              <Textarea id="descricao" rows={2} placeholder="O que precisa ser montado/entregue" {...register("descricao")} />
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
              {isEditing ? "Salvar alterações" : "Adicionar pedido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
