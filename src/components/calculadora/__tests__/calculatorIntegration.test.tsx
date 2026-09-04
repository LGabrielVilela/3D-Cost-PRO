// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { buildDefaultFormValues, type CalculatorFormValues } from "@/components/calculadora/schema";
import { StepEnergy } from "@/components/calculadora/steps/StepEnergy";
import { StepMaterial } from "@/components/calculadora/steps/StepMaterial";
import { materialsRepository } from "@/services/repositories/materialsRepository";
import { printersRepository } from "@/services/repositories/printersRepository";
import { __resetSeedCacheForTests, SEED_VERSION } from "@/services/seed/demoData";
import { STORAGE_KEYS } from "@/services/storage/localStorageAdapter";

function skipDemoSeed() {
  window.localStorage.setItem(STORAGE_KEYS.seedVersion, SEED_VERSION);
}

/** Expõe os valores atuais do formulário como texto, para facilitar as asserções do teste. */
function FormDebug() {
  const { watch } = useFormContext<CalculatorFormValues>();
  const values = watch();
  return (
    <dl>
      <dt>materialNome</dt>
      <dd data-testid="materialNome">{values.materialNome}</dd>
      <dt>filamentoPreco</dt>
      <dd data-testid="filamentoPreco">{values.filamentoPreco}</dd>
      <dt>filamentoPesoRolo</dt>
      <dd data-testid="filamentoPesoRolo">{values.filamentoPesoRolo}</dd>
      <dt>printerNome</dt>
      <dd data-testid="printerNome">{values.printerNome}</dd>
      <dt>consumoWatts</dt>
      <dd data-testid="consumoWatts">{values.consumoWatts}</dd>
      <dt>precoImpressora</dt>
      <dd data-testid="precoImpressora">{values.precoImpressora}</dd>
      <dt>vidaUtilHoras</dt>
      <dd data-testid="vidaUtilHoras">{values.vidaUtilHoras}</dd>
    </dl>
  );
}

function StepMaterialHarness() {
  const methods = useForm<CalculatorFormValues>({ defaultValues: buildDefaultFormValues() });
  return (
    <FormProvider {...methods}>
      <StepMaterial />
      <FormDebug />
    </FormProvider>
  );
}

function StepEnergyHarness() {
  const methods = useForm<CalculatorFormValues>({ defaultValues: buildDefaultFormValues() });
  return (
    <FormProvider {...methods}>
      <StepEnergy />
      <FormDebug />
    </FormProvider>
  );
}

describe("Integração calculadora ↔ cadastros", () => {
  beforeEach(() => {
    window.localStorage.clear();
    __resetSeedCacheForTests();
    skipDemoSeed();
  });

  it("selecionar um material cadastrado preenche nome, preço e peso automaticamente", async () => {
    await materialsRepository.create({
      nome: "PLA Integração",
      tipo: "PLA",
      marca: "",
      cor: "",
      precoCentavos: 12345,
      pesoRoloGramas: 750,
      fornecedor: "",
      observacoes: "",
    });

    const user = userEvent.setup();
    render(<StepMaterialHarness />);

    await user.click(await screen.findByRole("combobox", { name: "Material cadastrado" }));
    await user.click(await screen.findByRole("option", { name: /PLA Integração/ }));

    expect(screen.getByTestId("materialNome")).toHaveTextContent("PLA Integração");
    expect(screen.getByTestId("filamentoPreco")).toHaveTextContent("123,45");
    expect(screen.getByTestId("filamentoPesoRolo")).toHaveTextContent("750");
  });

  it("selecionar uma impressora cadastrada preenche consumo, preço e vida útil automaticamente", async () => {
    await printersRepository.create({
      nome: "Impressora Integração",
      marca: "",
      modelo: "",
      precoAquisicaoCentavos: 300000,
      consumoWatts: 175,
      vidaUtilHoras: 9000,
      manutencaoPorHoraCentavos: 40,
      observacoes: "",
    });

    const user = userEvent.setup();
    render(<StepEnergyHarness />);

    await user.click(await screen.findByRole("combobox", { name: "Impressora cadastrada" }));
    await user.click(await screen.findByRole("option", { name: /Impressora Integração/ }));

    expect(screen.getByTestId("printerNome")).toHaveTextContent("Impressora Integração");
    expect(screen.getByTestId("consumoWatts")).toHaveTextContent("175");
    expect(screen.getByTestId("precoImpressora")).toHaveTextContent("3.000,00");
    expect(screen.getByTestId("vidaUtilHoras")).toHaveTextContent("9000");
  });

  it("dados editados no cadastro de materiais chegam à calculadora sem duplicar a fonte de dados", async () => {
    const material = await materialsRepository.create({
      nome: "PLA Sincronizado",
      tipo: "PLA",
      marca: "",
      cor: "",
      precoCentavos: 10000,
      pesoRoloGramas: 1000,
      fornecedor: "",
      observacoes: "",
    });

    // Simula uma edição feita na tela de Materiais antes de abrir a calculadora.
    await materialsRepository.update(material.id, { precoCentavos: 15000 });

    const user = userEvent.setup();
    render(<StepMaterialHarness />);

    await user.click(await screen.findByRole("combobox", { name: "Material cadastrado" }));
    await user.click(await screen.findByRole("option", { name: /PLA Sincronizado/ }));

    // R$150,00 — o preço atualizado, não o original de R$100,00.
    expect(screen.getByTestId("filamentoPreco")).toHaveTextContent("150,00");
  });
});
