"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Material } from "@/types/entities";

import {
  MATERIAL_TYPES,
  buildDefaultMaterialFormValues,
  materialFormSchema,
  materialToFormValues,
  type MaterialFormValues,
} from "./schema";

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material;
  /** Nomes já cadastrados (exceto o do item em edição) — evita materiais duplicados. */
  existingNames: string[];
  onSubmit: (values: MaterialFormValues) => Promise<void>;
}

/** Formulário de criação/edição de material, em um Dialog reutilizado nos dois fluxos. */
export function MaterialFormDialog({
  open,
  onOpenChange,
  material,
  existingNames,
  onSubmit,
}: MaterialFormDialogProps) {
  const isEditing = Boolean(material);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: buildDefaultMaterialFormValues(),
  });

  useEffect(() => {
    if (open) {
      reset(material ? materialToFormValues(material) : buildDefaultMaterialFormValues());
    }
  }, [open, material, reset]);

  async function onValidSubmit(values: MaterialFormValues) {
    const nomeNormalizado = values.nome.trim().toLowerCase();
    if (existingNames.some((nome) => nome.toLowerCase() === nomeNormalizado)) {
      setError("nome", { message: "Já existe um material cadastrado com esse nome" });
      return;
    }
    await onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar material" : "Novo material"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Nome" htmlFor="nome" error={errors.nome?.message} className="sm:col-span-2">
              <Input id="nome" placeholder="Ex: PLA Basic" {...register("nome")} />
            </FieldShell>

            <FieldShell label="Tipo" htmlFor="tipo" error={errors.tipo?.message}>
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tipo" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_TYPES.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldShell>

            <FieldShell label="Marca" htmlFor="marca">
              <Input id="marca" placeholder="Ex: Genérico" {...register("marca")} />
            </FieldShell>

            <FieldShell label="Cor" htmlFor="cor">
              <Input id="cor" placeholder="Ex: Branco" {...register("cor")} />
            </FieldShell>

            <FieldShell label="Fornecedor" htmlFor="fornecedor">
              <Input id="fornecedor" {...register("fornecedor")} />
            </FieldShell>

            <FieldShell label="Preço do rolo" htmlFor="preco" error={errors.preco?.message}>
              <Controller
                control={control}
                name="preco"
                render={({ field }) => (
                  <CurrencyInput id="preco" value={field.value} onChange={field.onChange} />
                )}
              />
            </FieldShell>

            <FieldShell label="Peso do rolo" htmlFor="pesoRolo" error={errors.pesoRolo?.message}>
              <Controller
                control={control}
                name="pesoRolo"
                render={({ field }) => (
                  <SuffixNumberInput id="pesoRolo" suffix="g" value={field.value} onChange={field.onChange} />
                )}
              />
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
              {isEditing ? "Salvar alterações" : "Adicionar material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
