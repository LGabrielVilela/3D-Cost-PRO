"use client";

import { Controller, useFormContext } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/** Etapa 6 — mão de obra: valor fixo ou calculado pelos tempos de trabalho. */
export function StepLabor() {
  const { control, watch, formState } = useFormContext<CalculatorFormValues>();
  const usarValorFixo = watch("maoDeObraUsarValorFixo");
  const errors = formState.errors;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <div>
          <Label htmlFor="maoDeObraUsarValorFixo">Usar valor fixo</Label>
          <p className="text-xs text-muted-foreground">
            Desligue para calcular pelo tempo de preparação, acabamento e embalagem.
          </p>
        </div>
        <Controller
          control={control}
          name="maoDeObraUsarValorFixo"
          render={({ field }) => (
            <Switch
              id="maoDeObraUsarValorFixo"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {usarValorFixo ? (
        <FieldShell
          label="Valor da mão de obra"
          htmlFor="maoDeObraValorFixo"
          hint="Quanto você cobra pelo seu trabalho nesta peça?"
          error={errors.maoDeObraValorFixo?.message}
          className="max-w-xs"
        >
          <Controller
            control={control}
            name="maoDeObraValorFixo"
            render={({ field }) => (
              <CurrencyInput
                id="maoDeObraValorFixo"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FieldShell>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FieldShell
            label="Tempo de preparação"
            htmlFor="tempoPreparacaoMinutos"
            error={errors.tempoPreparacaoMinutos?.message}
          >
            <Controller
              control={control}
              name="tempoPreparacaoMinutos"
              render={({ field }) => (
                <SuffixNumberInput
                  id="tempoPreparacaoMinutos"
                  suffix="min"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FieldShell>

          <FieldShell
            label="Tempo de acabamento"
            htmlFor="tempoAcabamentoMinutos"
            error={errors.tempoAcabamentoMinutos?.message}
          >
            <Controller
              control={control}
              name="tempoAcabamentoMinutos"
              render={({ field }) => (
                <SuffixNumberInput
                  id="tempoAcabamentoMinutos"
                  suffix="min"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FieldShell>

          <FieldShell
            label="Tempo de embalagem"
            htmlFor="tempoEmbalagemMinutos"
            error={errors.tempoEmbalagemMinutos?.message}
          >
            <Controller
              control={control}
              name="tempoEmbalagemMinutos"
              render={({ field }) => (
                <SuffixNumberInput
                  id="tempoEmbalagemMinutos"
                  suffix="min"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FieldShell>

          <FieldShell
            label="Valor da sua hora"
            htmlFor="valorHoraTrabalho"
            error={errors.valorHoraTrabalho?.message}
          >
            <Controller
              control={control}
              name="valorHoraTrabalho"
              render={({ field }) => (
                <CurrencyInput
                  id="valorHoraTrabalho"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FieldShell>
        </div>
      )}
    </div>
  );
}
