"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/useSettings";

import { ColorField } from "./ColorField";
import {
  formValuesToSettings,
  settingsFormSchema,
  settingsToFormValues,
  type SettingsFormValues,
} from "./schema";

/** Tela de Configurações: identidade da empresa, identidade visual e padrões de precificação/orçamento. */
export function ConfiguracoesPage() {
  const { settings, loading, save } = useSettings();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settingsToFormValues(settings),
  });

  useEffect(() => {
    if (!loading) {
      reset(settingsToFormValues(settings));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só deve resetar quando o carregamento inicial termina
  }, [loading]);

  async function onSubmit(values: SettingsFormValues) {
    setSaveState("saving");
    await save(formValuesToSettings(values));
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2500);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Configurações" description="Empresa, identidade visual e padrões de orçamento." />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24 md:pb-6">
      <PageHeader
        title="Configurações"
        description="Dados da empresa, identidade visual e padrões usados nos orçamentos."
        actions={
          <Button type="submit">
            {saveState === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saveState === "saved" ? "Salvo!" : "Salvar configurações"}
          </Button>
        }
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Identidade da empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <FieldShell label="Logo" htmlFor="logo">
            <Controller
              control={control}
              name="empresa.logoDataUrl"
              render={({ field }) => (
                <ImageUploadField
                  value={field.value}
                  onChange={field.onChange}
                  optimizeOptions={{ maxWidth: 400, maxHeight: 400, outputType: "image/png" }}
                  emptyLabel="PNG, JPG ou WEBP — usada no cabeçalho do PDF"
                />
              )}
            />
          </FieldShell>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Nome da empresa" htmlFor="empresa.nome" error={errors.empresa?.nome?.message}>
              <Input id="empresa.nome" {...register("empresa.nome")} />
            </FieldShell>
            <FieldShell label="Nome fantasia" htmlFor="empresa.nomeFantasia">
              <Input id="empresa.nomeFantasia" {...register("empresa.nomeFantasia")} />
            </FieldShell>
            <FieldShell label="CNPJ" htmlFor="empresa.cnpj">
              <Input id="empresa.cnpj" {...register("empresa.cnpj")} />
            </FieldShell>
            <FieldShell label="Telefone" htmlFor="empresa.telefone">
              <Input id="empresa.telefone" {...register("empresa.telefone")} />
            </FieldShell>
            <FieldShell label="WhatsApp" htmlFor="empresa.whatsapp">
              <Input id="empresa.whatsapp" placeholder="(11) 98888-1234" {...register("empresa.whatsapp")} />
            </FieldShell>
            <FieldShell label="E-mail" htmlFor="empresa.email" error={errors.empresa?.email?.message}>
              <Input id="empresa.email" type="email" {...register("empresa.email")} />
            </FieldShell>
            <FieldShell label="Instagram" htmlFor="empresa.instagram">
              <Input id="empresa.instagram" placeholder="@suaempresa" {...register("empresa.instagram")} />
            </FieldShell>
            <FieldShell label="Site" htmlFor="empresa.site">
              <Input id="empresa.site" placeholder="https://" {...register("empresa.site")} />
            </FieldShell>
            <FieldShell label="Endereço" htmlFor="empresa.endereco" className="sm:col-span-2">
              <Input id="empresa.endereco" {...register("empresa.endereco")} />
            </FieldShell>
            <FieldShell label="Cidade" htmlFor="empresa.cidade">
              <Input id="empresa.cidade" {...register("empresa.cidade")} />
            </FieldShell>
            <FieldShell label="Estado" htmlFor="empresa.estado">
              <Input id="empresa.estado" placeholder="SP" {...register("empresa.estado")} />
            </FieldShell>
            <FieldShell label="CEP" htmlFor="empresa.cep">
              <Input id="empresa.cep" {...register("empresa.cep")} />
            </FieldShell>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Personalização visual do orçamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Cor principal" htmlFor="branding.corPrincipal" error={errors.branding?.corPrincipal?.message}>
              <Controller
                control={control}
                name="branding.corPrincipal"
                render={({ field }) => (
                  <ColorField id="branding.corPrincipal" value={field.value} onChange={field.onChange} />
                )}
              />
            </FieldShell>
            <FieldShell label="Cor secundária" htmlFor="branding.corSecundaria" error={errors.branding?.corSecundaria?.message}>
              <Controller
                control={control}
                name="branding.corSecundaria"
                render={({ field }) => (
                  <ColorField id="branding.corSecundaria" value={field.value} onChange={field.onChange} />
                )}
              />
            </FieldShell>
          </div>

          <FieldShell
            label="Mensagem de agradecimento"
            htmlFor="branding.mensagemAgradecimento"
            hint="Exibida no rodapé do PDF"
            error={errors.branding?.mensagemAgradecimento?.message}
          >
            <Input id="branding.mensagemAgradecimento" {...register("branding.mensagemAgradecimento")} />
          </FieldShell>

          <FieldShell
            label="Texto do rodapé"
            htmlFor="branding.textoRodape"
            error={errors.branding?.textoRodape?.message}
          >
            <Input id="branding.textoRodape" {...register("branding.textoRodape")} />
          </FieldShell>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <div>
              <Label htmlFor="branding.mostrarAssinatura">Mostrar assinatura no orçamento</Label>
              <p className="text-xs text-muted-foreground">
                Adiciona um bloco de aprovação do cliente (nome, assinatura e data) no PDF.
              </p>
            </div>
            <Controller
              control={control}
              name="branding.mostrarAssinatura"
              render={({ field }) => (
                <Switch
                  id="branding.mostrarAssinatura"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Padrões de precificação</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          <FieldShell label="Margem padrão" htmlFor="precificacao.margemPadraoPercentual">
            <Controller
              control={control}
              name="precificacao.margemPadraoPercentual"
              render={({ field }) => (
                <SuffixNumberInput id="precificacao.margemPadraoPercentual" suffix="%" value={field.value} onChange={field.onChange} />
              )}
            />
          </FieldShell>
          <FieldShell label="Markup padrão" htmlFor="precificacao.markupPadraoPercentual">
            <Controller
              control={control}
              name="precificacao.markupPadraoPercentual"
              render={({ field }) => (
                <SuffixNumberInput id="precificacao.markupPadraoPercentual" suffix="%" value={field.value} onChange={field.onChange} />
              )}
            />
          </FieldShell>
          <FieldShell label="Taxa padrão" htmlFor="precificacao.taxaPadraoPercentual">
            <Controller
              control={control}
              name="precificacao.taxaPadraoPercentual"
              render={({ field }) => (
                <SuffixNumberInput id="precificacao.taxaPadraoPercentual" suffix="%" value={field.value} onChange={field.onChange} />
              )}
            />
          </FieldShell>
          <FieldShell label="Percentual de perdas padrão" htmlFor="precificacao.percentualPerdasPadrao">
            <Controller
              control={control}
              name="precificacao.percentualPerdasPadrao"
              render={({ field }) => (
                <SuffixNumberInput id="precificacao.percentualPerdasPadrao" suffix="%" value={field.value} onChange={field.onChange} />
              )}
            />
          </FieldShell>
          <FieldShell label="Custo de mão de obra padrão" htmlFor="precificacao.custoMaoDeObraPadrao">
            <Controller
              control={control}
              name="precificacao.custoMaoDeObraPadrao"
              render={({ field }) => (
                <CurrencyInput id="precificacao.custoMaoDeObraPadrao" value={field.value} onChange={field.onChange} />
              )}
            />
          </FieldShell>
          <FieldShell label="Custo de embalagem padrão" htmlFor="precificacao.custoEmbalagemPadrao">
            <Controller
              control={control}
              name="precificacao.custoEmbalagemPadrao"
              render={({ field }) => (
                <CurrencyInput id="precificacao.custoEmbalagemPadrao" value={field.value} onChange={field.onChange} />
              )}
            />
          </FieldShell>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Padrões de orçamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 px-4 sm:grid-cols-2 sm:px-6">
          <FieldShell
            label="Validade padrão"
            htmlFor="orcamento.validadePadraoDias"
            error={errors.orcamento?.validadePadraoDias?.message}
          >
            <Controller
              control={control}
              name="orcamento.validadePadraoDias"
              render={({ field }) => (
                <SuffixNumberInput id="orcamento.validadePadraoDias" suffix="dias" step={1} value={field.value} onChange={field.onChange} />
              )}
            />
          </FieldShell>
          <FieldShell label="Prazo de entrega padrão" htmlFor="orcamento.prazoPadraoTexto">
            <Input id="orcamento.prazoPadraoTexto" {...register("orcamento.prazoPadraoTexto")} />
          </FieldShell>
          <FieldShell label="Forma de pagamento padrão" htmlFor="orcamento.formaPagamentoPadrao">
            <Input id="orcamento.formaPagamentoPadrao" {...register("orcamento.formaPagamentoPadrao")} />
          </FieldShell>
          <FieldShell
            label="Texto de observação padrão"
            htmlFor="orcamento.textoObservacaoPadrao"
            className="sm:col-span-2"
          >
            <Textarea id="orcamento.textoObservacaoPadrao" rows={2} {...register("orcamento.textoObservacaoPadrao")} />
          </FieldShell>
        </CardContent>
      </Card>
    </form>
  );
}
