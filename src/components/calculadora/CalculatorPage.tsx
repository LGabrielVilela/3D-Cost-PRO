"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Check, FileText, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { runCalculationEngine } from "@/calculators/engine";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { calculationsRepository } from "@/services/repositories/calculationsRepository";
import { formatCentavos } from "@/lib/money";

import { AlertsPanel } from "./results/AlertsPanel";
import { CostBreakdownCard } from "./results/CostBreakdownCard";
import { DiscountImpactCard } from "./results/DiscountImpactCard";
import { PaymentFeesTable } from "./results/PaymentFeesTable";
import { QuantityPricingTable } from "./results/QuantityPricingTable";
import { SuggestedPricesCards } from "./results/SuggestedPricesCards";
import {
  buildDefaultFormValues,
  calculatorFormSchema,
  toCalculationInput,
  type CalculatorFormValues,
} from "./schema";
import { StepPricingMethod } from "./pricing/StepPricingMethod";
import { StepPaymentFees } from "./pricing/StepPaymentFees";
import { StepDiscount } from "./pricing/StepDiscount";
import { StepQuantityTiers } from "./pricing/StepQuantityTiers";
import { StepMaterial } from "./steps/StepMaterial";
import { StepEnergy } from "./steps/StepEnergy";
import { StepDepreciation } from "./steps/StepDepreciation";
import { StepMaintenance } from "./steps/StepMaintenance";
import { StepLosses } from "./steps/StepLosses";
import { StepLabor } from "./steps/StepLabor";
import { StepPackaging } from "./steps/StepPackaging";
import { StepOtherCosts } from "./steps/StepOtherCosts";

const COST_STEPS = [
  { value: "material", title: "1. Informações da impressão", component: StepMaterial },
  { value: "energy", title: "2. Energia", component: StepEnergy },
  { value: "depreciation", title: "3. Depreciação", component: StepDepreciation },
  { value: "maintenance", title: "4. Manutenção", component: StepMaintenance },
  { value: "losses", title: "5. Perdas e falhas", component: StepLosses },
  { value: "labor", title: "6. Mão de obra", component: StepLabor },
  { value: "packaging", title: "7. Embalagem", component: StepPackaging },
  { value: "other", title: "8. Outros custos", component: StepOtherCosts },
] as const;

const PRICING_STEPS = [
  { value: "pricing-method", title: "Formação do preço", component: StepPricingMethod },
  { value: "payment-fees", title: "Taxas e formas de pagamento", component: StepPaymentFees },
  { value: "discount", title: "Desconto", component: StepDiscount },
  { value: "quantity", title: "Preços por quantidade", component: StepQuantityTiers },
] as const;

const ALL_STEP_VALUES = [...COST_STEPS, ...PRICING_STEPS].map((s) => s.value);

/** Tela completa da Calculadora: formulário em etapas + resumo de custos e preços ao vivo. */
export function CalculatorPage() {
  const router = useRouter();
  const methods = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorFormSchema),
    defaultValues: buildDefaultFormValues(),
    mode: "onBlur",
  });

  const [hasCalculated, setHasCalculated] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [criandoOrcamento, setCriandoOrcamento] = useState(false);

  const values = useWatch({ control: methods.control });

  const result = useMemo(() => {
    try {
      return runCalculationEngine(toCalculationInput(values as CalculatorFormValues));
    } catch {
      return null;
    }
  }, [values]);

  async function handleCalcular() {
    const valid = await methods.trigger();
    if (!valid) {
      // Abre a primeira etapa que contém erro, para o usuário localizar rápido.
      return;
    }
    setHasCalculated(true);
    document.getElementById("resultado-calculadora")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  /** Persiste o cálculo atual e devolve o registro criado — usado por "Salvar" e por "Criar orçamento". */
  async function salvarCalculo() {
    if (!result) return undefined;
    const formValues = methods.getValues();
    return calculationsRepository.create({
      nome: formValues.materialNome
        ? `${formValues.materialNome} — ${new Date().toLocaleDateString("pt-BR")}`
        : `Cálculo — ${new Date().toLocaleDateString("pt-BR")}`,
      input: toCalculationInput(formValues),
      custos: result.custos,
      precos: result.precos,
    });
  }

  async function handleSalvar() {
    const valid = await methods.trigger();
    if (!valid || !result) return;

    setSaveState("saving");
    await salvarCalculo();
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2500);
  }

  /** Etapa 10 da especificação: transfere o cálculo direto para um novo orçamento, sem redigitar nada. */
  async function handleCriarOrcamento() {
    const valid = await methods.trigger();
    if (!valid || !result) return;

    setCriandoOrcamento(true);
    const calculo = await salvarCalculo();
    setCriandoOrcamento(false);
    if (calculo) {
      router.push(`/orcamentos/novo?calculoId=${calculo.id}`);
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-24 md:pb-6">
        <PageHeader
          title="Calculadora"
          description="Preencha os dados da sua impressão para descobrir o custo real e o preço ideal de venda."
        />

        <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
          <div className="space-y-6 lg:col-span-3">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Dados da impressão</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Accordion type="multiple" defaultValue={[...ALL_STEP_VALUES]}>
                  {COST_STEPS.map((step) => (
                    <AccordionItem key={step.value} value={step.value}>
                      <AccordionTrigger>{step.title}</AccordionTrigger>
                      <AccordionContent>
                        <step.component />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Precificação e vendas</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Accordion type="multiple" defaultValue={[...ALL_STEP_VALUES]}>
                  {PRICING_STEPS.map((step) => (
                    <AccordionItem key={step.value} value={step.value}>
                      <AccordionTrigger>{step.title}</AccordionTrigger>
                      <AccordionContent>
                        <step.component />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="hidden items-center gap-3 md:flex">
              <Button type="button" size="lg" onClick={handleCalcular}>
                <Calculator className="h-4 w-4" />
                {hasCalculated ? "Recalcular custo" : "Calcular custo"}
              </Button>
              {hasCalculated ? (
                <Button type="button" size="lg" variant="outline" onClick={handleSalvar}>
                  {saveState === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saveState === "saved" ? "Cálculo salvo!" : "Salvar cálculo"}
                </Button>
              ) : null}
              {hasCalculated ? (
                <Button type="button" size="lg" variant="outline" onClick={handleCriarOrcamento} disabled={criandoOrcamento}>
                  <FileText className="h-4 w-4" />
                  {criandoOrcamento ? "Criando orçamento..." : "Criar orçamento"}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:col-span-2 lg:self-start">
            <div id="resultado-calculadora" className="scroll-mt-6">
              {hasCalculated && result ? (
                <div className="animate-in fade-in-0 zoom-in-95 space-y-4 duration-300">
                  <AlertsPanel alerts={result.alerts} />
                  <CostBreakdownCard
                    custos={result.custos}
                    quantidadePecas={methods.getValues("quantidadePecas") || 1}
                  />
                  <SuggestedPricesCards
                    precos={result.precos}
                    margemRealPercentual={result.margemRealRecomendadoPercentual}
                  />
                  <DiscountImpactCard discount={result.discount} />
                  <PaymentFeesTable rows={result.paymentFeeRows} />
                  <QuantityPricingTable rows={result.quantityPricing} />
                </div>
              ) : (
                <EmptyState
                  icon={Calculator}
                  title="Pronto para calcular"
                  description={'Preencha os dados da impressão ao lado e toque em "Calcular custo" para ver o resumo de custos e os preços sugeridos.'}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra fixa no celular: sempre visível, com o custo total e o botão principal. */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t bg-card/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Custo total</p>
            <p className="truncate text-sm font-semibold tabular-nums">
              {result ? formatCentavos(result.custos.custoTotalCentavos) : "R$ 0,00"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasCalculated ? (
              <Button type="button" size="sm" variant="outline" onClick={handleSalvar} aria-label="Salvar cálculo">
                {saveState === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              </Button>
            ) : null}
            {hasCalculated ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCriarOrcamento}
                disabled={criandoOrcamento}
                aria-label="Criar orçamento"
              >
                <FileText className="h-4 w-4" />
              </Button>
            ) : null}
            <Button type="button" size="sm" onClick={handleCalcular}>
              <Calculator className="h-4 w-4" />
              {hasCalculated ? "Recalcular" : "Calcular"}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
