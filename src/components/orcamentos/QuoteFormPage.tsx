"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Download, Eye, EyeOff, Save } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";

import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/hooks/useClients";
import { useSettings } from "@/hooks/useSettings";
import { generateId } from "@/lib/id";
import { downloadQuotePdf } from "@/pdf/downloadQuotePdf";
import { buildQuotationPublicData } from "@/quotation/buildQuotationPublicData";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import type { Calculation, Quote } from "@/types/entities";
import { buildQuoteDraftFromCalculation } from "@/quotation/fromCalculation";

import { ClientPickerField } from "./ClientPickerField";
import { QuoteDiscountEditor } from "./QuoteDiscountEditor";
import { QuoteItemsEditor } from "./QuoteItemsEditor";
import { QuotePaymentTermsEditor } from "./QuotePaymentTermsEditor";
import {
  buildDefaultQuoteFormValues,
  formValuesToQuoteData,
  quoteFormSchema,
  quoteToFormValues,
  type QuoteFormValues,
} from "./schema";

const QuotePdfPreview = dynamic(
  () => import("@/pdf/QuotePdfPreview").then((mod) => mod.QuotePdfPreview),
  { ssr: false },
);

interface QuoteFormPageProps {
  /** Presente ao editar um orçamento existente. */
  quote?: Quote;
  /** Presente ao criar um orçamento a partir de um cálculo salvo (?calculoId=...). */
  initialCalculation?: Calculation;
}

/** Formulário completo de orçamento — usado tanto para criar quanto para editar. */
export function QuoteFormPage({ quote, initialCalculation }: QuoteFormPageProps) {
  const router = useRouter();
  const isEditing = Boolean(quote);
  const { clients } = useClients();
  const { settings, loading: loadingSettings } = useSettings();

  const [numeroReservado, setNumeroReservado] = useState<number | undefined>(quote?.numero);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [pdfState, setPdfState] = useState<"idle" | "gerando" | "erro">("idle");

  useEffect(() => {
    if (!isEditing) {
      quotesRepository.nextNumero().then(setNumeroReservado);
    }
  }, [isEditing]);

  const calculationDraft = initialCalculation
    ? buildQuoteDraftFromCalculation(initialCalculation)
    : undefined;

  const methods = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: quote
      ? quoteToFormValues(quote)
      : buildDefaultQuoteFormValues(
          calculationDraft
            ? {
                clientId: "",
                descricaoServico: calculationDraft.descricaoServico,
                itens: calculationDraft.itens.map((item) => ({
                  id: item.id,
                  descricao: item.descricao,
                  material: item.material ?? "",
                  cor: item.cor ?? "",
                  quantidade: item.quantidade,
                  precoUnitario: (item.precoUnitarioCentavos / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  }),
                })),
              }
            : { itens: [{ id: generateId(), descricao: "", material: "", cor: "", quantidade: 1, precoUnitario: "0,00" }] },
        ),
    mode: "onBlur",
  });

  const values = useWatch({ control: methods.control });
  const selectedClient = clients.find((c) => c.id === values.clientId);

  const previewData = useMemo(() => {
    if (loadingSettings || numeroReservado === undefined) return null;
    try {
      const quoteData = formValuesToQuoteData(values as QuoteFormValues);
      const fakeQuote: Quote = {
        id: quote?.id ?? "preview",
        createdAt: quote?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        numero: numeroReservado,
        subtotalCentavos: 0,
        totalCentavos: 0,
        calculationId: quote?.calculationId ?? initialCalculation?.id,
        ...quoteData,
      };
      return buildQuotationPublicData(fakeQuote, selectedClient, settings);
    } catch {
      return null;
    }
  }, [values, settings, loadingSettings, numeroReservado, selectedClient, quote, initialCalculation]);

  async function persistQuote(formValues: QuoteFormValues): Promise<Quote> {
    const data = formValuesToQuoteData(formValues);
    const publicData = buildQuotationPublicData(
      { ...data, id: "tmp", numero: 0, createdAt: "", updatedAt: "", subtotalCentavos: 0, totalCentavos: 0 },
      clients.find((c) => c.id === formValues.clientId),
      settings,
    );

    if (quote) {
      const updated = await quotesRepository.update(quote.id, {
        ...data,
        subtotalCentavos: publicData.totais.subtotalCentavos,
        descontoCentavos: publicData.totais.descontoCentavos,
        totalCentavos: publicData.totais.totalCentavos,
      });
      return updated!;
    }

    const numero = numeroReservado ?? (await quotesRepository.nextNumero());
    return quotesRepository.create({
      ...data,
      numero,
      subtotalCentavos: publicData.totais.subtotalCentavos,
      descontoCentavos: publicData.totais.descontoCentavos,
      totalCentavos: publicData.totais.totalCentavos,
    });
  }

  async function handleSalvar(formValues: QuoteFormValues) {
    setSaveState("saving");
    const saved = await persistQuote(formValues);
    setSaveState("saved");
    router.push(`/orcamentos/${saved.id}`);
  }

  async function handleGerarPdf() {
    if (!previewData) return;
    setPdfState("gerando");
    try {
      await downloadQuotePdf(previewData);
      setPdfState("idle");
    } catch {
      setPdfState("erro");
      setTimeout(() => setPdfState("idle"), 3000);
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSalvar)} className="space-y-6 pb-24 md:pb-6">
        <PageHeader
          title={isEditing ? `Editar orçamento #${String(quote!.numero).padStart(6, "0")}` : "Novo orçamento"}
          description={
            initialCalculation
              ? "Dados carregados automaticamente do cálculo — complete cliente, prazo e pagamento."
              : "Preencha os dados do cliente, do produto e das condições comerciais."
          }
        />

        {initialCalculation ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-primary">
            <Calculator className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Item, quantidade e preço de anúncio foram transferidos automaticamente da calculadora.
            </span>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
          <div className="space-y-6 lg:col-span-3">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <ClientPickerField />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Produto / serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <FieldShell
                  label="Descrição do serviço"
                  htmlFor="descricaoServico"
                  error={methods.formState.errors.descricaoServico?.message}
                >
                  <Textarea
                    id="descricaoServico"
                    rows={2}
                    placeholder="Ex: Confecção de chaveiros personalizados"
                    {...methods.register("descricaoServico")}
                  />
                </FieldShell>

                <QuoteItemsEditor />

                <FieldShell label="Foto do produto" htmlFor="imagemDataUrl">
                  <Controller
                    control={methods.control}
                    name="imagemDataUrl"
                    render={({ field }) => (
                      <ImageUploadField
                        value={field.value}
                        onChange={field.onChange}
                        shape="wide"
                        optimizeOptions={{ maxWidth: 900, maxHeight: 900, outputType: "image/jpeg", quality: 0.85 }}
                        emptyLabel="Opcional — aparece na pré-visualização e no PDF"
                      />
                    )}
                  />
                </FieldShell>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Prazos e datas</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 px-4 sm:grid-cols-3 sm:px-6">
                <FieldShell
                  label="Data do orçamento"
                  htmlFor="dataOrcamento"
                  error={methods.formState.errors.dataOrcamento?.message}
                >
                  <Input id="dataOrcamento" type="date" {...methods.register("dataOrcamento")} />
                </FieldShell>
                <FieldShell
                  label="Validade"
                  htmlFor="validadeDias"
                  error={methods.formState.errors.validadeDias?.message}
                >
                  <Controller
                    control={methods.control}
                    name="validadeDias"
                    render={({ field }) => (
                      <Input
                        id="validadeDias"
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    )}
                  />
                </FieldShell>
                <FieldShell label="Prazo de entrega" htmlFor="prazoEntrega">
                  <Input id="prazoEntrega" placeholder="Ex: 7 dias úteis" {...methods.register("prazoEntrega")} />
                </FieldShell>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Condições de pagamento</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <QuotePaymentTermsEditor />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Desconto</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <QuoteDiscountEditor />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Textarea
                  rows={3}
                  placeholder="Ex: Produto personalizado conforme modelo aprovado pelo cliente."
                  {...methods.register("observacoes")}
                />
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" size="lg" disabled={saveState === "saving"}>
                <Save className="h-4 w-4" />
                {saveState === "saving" ? "Salvando..." : "Salvar orçamento"}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => setMostrarPreview((v) => !v)}
              >
                {mostrarPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {mostrarPreview ? "Ocultar pré-visualização" : "Pré-visualizar orçamento"}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleGerarPdf}
                disabled={!previewData || pdfState === "gerando"}
              >
                <Download className="h-4 w-4" />
                {pdfState === "gerando" ? "Gerando PDF..." : pdfState === "erro" ? "Erro ao gerar" : "Gerar PDF"}
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:col-span-2 lg:self-start">
            {mostrarPreview && previewData ? (
              <div className="h-[70vh] overflow-hidden rounded-xl border shadow-sm lg:h-[calc(100vh-3rem)]">
                <QuotePdfPreview data={previewData} className="h-full w-full" />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center text-sm text-muted-foreground">
                Toque em &ldquo;Pré-visualizar orçamento&rdquo; para ver exatamente como o PDF vai ficar.
              </div>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
