"use client";

import { Package, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaterials } from "@/hooks/useMaterials";
import type { Material } from "@/types/entities";

import { MaterialFormDialog } from "./MaterialFormDialog";
import { MaterialsTable } from "./MaterialsTable";
import { formValuesToMaterial } from "./schema";

function matchesSearch(material: Material, termo: string): boolean {
  const alvo = `${material.nome} ${material.tipo} ${material.marca ?? ""} ${material.cor ?? ""}`.toLowerCase();
  return alvo.includes(termo.toLowerCase());
}

/** Tela de cadastro de materiais: busca, criação, edição e exclusão. */
export function MaterialsPage() {
  const { materials, loading, create, update, remove } = useMaterials();
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [materialEmEdicao, setMaterialEmEdicao] = useState<Material | undefined>(undefined);
  const [materialParaExcluir, setMaterialParaExcluir] = useState<Material | undefined>(undefined);

  const materiaisFiltrados = useMemo(
    () => materials.filter((material) => matchesSearch(material, busca)),
    [materials, busca],
  );

  const nomesExistentes = useMemo(
    () =>
      materials
        .filter((material) => material.id !== materialEmEdicao?.id)
        .map((material) => material.nome),
    [materials, materialEmEdicao],
  );

  function abrirNovo() {
    setMaterialEmEdicao(undefined);
    setDialogAberto(true);
  }

  function abrirEdicao(material: Material) {
    setMaterialEmEdicao(material);
    setDialogAberto(true);
  }

  async function salvar(values: Parameters<typeof formValuesToMaterial>[0]) {
    const data = formValuesToMaterial(values);
    if (materialEmEdicao) {
      await update(materialEmEdicao.id, data);
    } else {
      await create(data);
    }
  }

  async function confirmarExclusao() {
    if (!materialParaExcluir) return;
    await remove(materialParaExcluir.id);
    setMaterialParaExcluir(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materiais"
        description="Cadastro de filamentos e materiais usados nos cálculos."
        actions={
          <Button onClick={abrirNovo}>
            <Plus className="h-4 w-4" />
            Novo material
          </Button>
        }
      />

      <SearchInput value={busca} onChange={setBusca} placeholder="Pesquisar por nome, tipo, marca ou cor…" />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : materials.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum material cadastrado"
          description="Cadastre os filamentos que você usa para preenchê-los automaticamente na calculadora."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4" />
              Novo material
            </Button>
          }
        />
      ) : materiaisFiltrados.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum resultado"
          description={`Nenhum material encontrado para "${busca}".`}
        />
      ) : (
        <MaterialsTable materials={materiaisFiltrados} onEdit={abrirEdicao} onDelete={setMaterialParaExcluir} />
      )}

      <MaterialFormDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        material={materialEmEdicao}
        existingNames={nomesExistentes}
        onSubmit={salvar}
      />

      <ConfirmDeleteDialog
        open={Boolean(materialParaExcluir)}
        onOpenChange={(open) => !open && setMaterialParaExcluir(undefined)}
        title={`Excluir "${materialParaExcluir?.nome}"?`}
        description="Cálculos já salvos que usam este material não serão afetados, mas ele deixará de aparecer na lista de seleção da calculadora."
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}
