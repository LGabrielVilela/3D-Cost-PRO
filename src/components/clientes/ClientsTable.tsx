import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@/types/entities";

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

/** Tabela de clientes cadastrados. */
export function ClientsTable({ clients, onEdit, onDelete }: ClientsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Empresa</TableHead>
            <TableHead className="hidden sm:table-cell">WhatsApp</TableHead>
            <TableHead className="hidden lg:table-cell">E-mail</TableHead>
            <TableHead className="w-20 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.nome}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {client.empresa || "—"}
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {client.whatsapp || "—"}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {client.email || "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${client.nome}`}
                    onClick={() => onEdit(client)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${client.nome}`}
                    onClick={() => onDelete(client)}
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
