"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { ClientFormDialog } from "@/components/clientes/ClientFormDialog";
import { formValuesToClient } from "@/components/clientes/schema";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";

import type { QuoteFormValues } from "./schema";

/**
 * Seleciona um cliente já cadastrado ou permite cadastrar um novo sem sair
 * do orçamento — reutiliza o mesmo `ClientFormDialog` e `clientsRepository`
 * da tela de Clientes, então nada é duplicado.
 */
export function ClientPickerField() {
  const { control, formState, setValue } = useFormContext<QuoteFormValues>();
  const { clients, create, reload } = useClients();
  const [dialogAberto, setDialogAberto] = useState(false);
  const error = formState.errors.clientId?.message;

  return (
    <>
      <FieldShell label="Cliente" htmlFor="clientId" error={error}>
        <Controller
          control={control}
          name="clientId"
          render={({ field }) => (
            <div className="flex gap-2">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="clientId" className="w-full">
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nome}
                      {client.empresa ? ` — ${client.empresa}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={() => setDialogAberto(true)}>
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo cliente</span>
              </Button>
            </div>
          )}
        />
      </FieldShell>

      <ClientFormDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        onSubmit={async (values) => {
          const created = await create(formValuesToClient(values));
          await reload();
          setValue("clientId", created.id, { shouldValidate: true });
        }}
      />
    </>
  );
}
