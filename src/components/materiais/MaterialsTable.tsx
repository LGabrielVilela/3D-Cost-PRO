import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { centavosToReais, formatCentavos, formatPeso } from "@/lib/money";
import type { Material } from "@/types/entities";

interface MaterialsTableProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

function precoPorGrama(material: Material): string {
  if (material.pesoRoloGramas <= 0) return "—";
  const valor = centavosToReais(material.precoCentavos) / material.pesoRoloGramas;
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}/g`;
}

/** Tabela de materiais cadastrados, com preço por grama calculado automaticamente. */
export function MaterialsTable({ materials, onEdit, onDelete }: MaterialsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Marca / Cor</TableHead>
            <TableHead className="text-right">Preço do rolo</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Peso</TableHead>
            <TableHead className="text-right">Preço/g</TableHead>
            <TableHead className="w-20 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow key={material.id}>
              <TableCell className="font-medium">{material.nome}</TableCell>
              <TableCell>
                <Badge variant="secondary">{material.tipo}</Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {[material.marca, material.cor].filter(Boolean).join(" · ") || "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCentavos(material.precoCentavos)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                {formatPeso(material.pesoRoloGramas)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {precoPorGrama(material)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${material.nome}`}
                    onClick={() => onEdit(material)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${material.nome}`}
                    onClick={() => onDelete(material)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
