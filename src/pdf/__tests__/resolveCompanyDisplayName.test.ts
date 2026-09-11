import { describe, expect, it } from "vitest";

import { resolveCompanyDisplayName } from "../resolveCompanyDisplayName";

describe("resolveCompanyDisplayName", () => {
  it("usa o nome fantasia como destaque quando os dois nomes estão preenchidos", () => {
    const resultado = resolveCompanyDisplayName({ nome: "Meteora Studio 3D Ltda", nomeFantasia: "Meteora 3D" });
    expect(resultado.destaque).toBe("Meteora 3D");
    expect(resultado.secundario).toBe("Meteora Studio 3D Ltda");
  });

  it("usa o nome da empresa como destaque quando não há nome fantasia", () => {
    const resultado = resolveCompanyDisplayName({ nome: "Minha Empresa 3D", nomeFantasia: "" });
    expect(resultado.destaque).toBe("Minha Empresa 3D");
    expect(resultado.secundario).toBeUndefined();
  });

  it("usa o nome fantasia como destaque quando 'Nome da empresa' está vazio", () => {
    const resultado = resolveCompanyDisplayName({ nome: "", nomeFantasia: "Meteora 3D" });
    expect(resultado.destaque).toBe("Meteora 3D");
    expect(resultado.secundario).toBeUndefined();
  });

  it("não repete o mesmo nome como destaque e subtítulo", () => {
    const resultado = resolveCompanyDisplayName({ nome: "", nomeFantasia: "" });
    expect(resultado.destaque).toBe("");
    expect(resultado.secundario).toBeUndefined();
  });
});
