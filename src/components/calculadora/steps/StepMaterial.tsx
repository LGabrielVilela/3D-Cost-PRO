"use client";

import { Controller, useFormContext } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMaterials } from "@/hooks/useMaterials";
import { formatCentavos } from "@/lib/money";

/** Etapa 1 — dados do material e da impressão em si. */
export function StepMaterial() {
  const { control, register, setValue, formState } = useFormContext<CalculatorFormValues>();
  const { materials } = useMaterials();
  const errors = formState.errors;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FieldShell label="Material cadastrado" htmlFor="materialId" className="sm:col-span-2">
        <Controller
          control={control}
          name="materialId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(materialId) => {
                const material = materials.find((m) => m.id === materialId);
                if (!material) return;
                field.onChange(materialId);
                setValue("materialNome", material.nome, { shouldValidate: true });
                setValue(
                  "filamentoPreco",
                  (material.precoCentavos / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  }),
                  { shouldValidate: true },
                );
                setValue("filamentoPesoRolo", material.pesoRoloGramas, { shouldValidate: true });
              }}
            >
              <SelectTrigger id="materialId" className="w-full">
                <SelectValue placeholder="Selecionar material cadastrado (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.nome} — {formatCentavos(material.precoCentavos)} / {material.pesoRoloGramas}g
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Selecionar preenche preço e peso automaticamente — você ainda pode ajustar os valores.
        </p>
      </FieldShell>

      <FieldShell
        label="Material utilizado"
        htmlFor="materialNome"
        error={errors.materialNome?.message}
      >
        <Input
          id="materialNome"
          placeholder="Ex: PLA Basic"
          aria-invalid={Boolean(errors.materialNome)}
          {...register("materialNome")}
        />
      </FieldShell>

      <FieldShell
        label="Preço pago no rolo"
        htmlFor="filamentoPreco"
        hint="Quanto você pagou neste rolo?"
        error={errors.filamentoPreco?.message}
      >
        <Controller
          control={control}
          name="filamentoPreco"
          render={({ field }) => (
            <CurrencyInput id="filamentoPreco" value={field.value} onChange={field.onChange} />
          )}
        />
      </FieldShell>

      <FieldShell
        label="Peso do rolo"
        htmlFor="filamentoPesoRolo"
        hint="Peso total do rolo, geralmente 1.000g"
        error={errors.filamentoPesoRolo?.message}
      >
        <Controller
          control={control}
          name="filamentoPesoRolo"
          render={({ field }) => (
            <SuffixNumberInput
              id="filamentoPesoRolo"
              suffix="g"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </FieldShell>

      <FieldShell
        label="Quantidade utilizada"
        htmlFor="gramasUtilizadas"
        hint="Quantos gramas foram utilizados nesta impressão?"
        error={errors.gramasUtilizadas?.message}
      >
        <Controller
          control={control}
          name="gramasUtilizadas"
          render={({ field }) => (
            <SuffixNumberInput
              id="gramasUtilizadas"
              suffix="g"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </FieldShell>

      <FieldShell
        label="Tempo de impressão"
        htmlFor="tempoImpressaoHoras"
        hint="Duração total da impressão (o lote inteiro, se imprimir várias peças juntas)"
        error={errors.tempoImpressaoMinutos?.message}
      >
        <Controller
          control={control}
          name="tempoImpressaoMinutos"
          render={({ field }) => (
            <SuffixNumberInput
              id="tempoImpressaoHoras"
              suffix="h"
              value={Number.isFinite(field.value) ? field.value / 60 : field.value}
              onChange={(horas) => field.onChange(Number.isFinite(horas) ? horas * 60 : horas)}
            />
          )}
        />
      </FieldShell>

      <FieldShell
        label="Quantidade de peças"
        htmlFor="quantidadePecas"
        hint="Quantas peças saem deste lote/impressão?"
        error={errors.quantidadePecas?.message}
      >
        <Controller
          control={control}
          name="quantidadePecas"
          render={({ field }) => (
            <SuffixNumberInput
              id="quantidadePecas"
              suffix="un."
              step={1}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </FieldShell>
    </div>
  );
}
