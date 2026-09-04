import { Copy, Download, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateBr } from "@/lib/date";
import { formatCentavos } from "@/lib/money";
import type { Client, Quote, QuoteStatus } from "@/types/entities";

import { QUOTE_STATUS_OPTIONS } from "./schema";

const STATUS_BADGE_VARIANT: Record<QuoteStatus, "default" | "secondary" | "destructive" | "outline"> = {
  rascunho: "outline",
  enviado: "secondary",
  aguardando_aprovacao: "secondary",
  aprovado: "default",
  recusado: "destructive",
  expirado: "outline",
  cancelado: "destructive",
};

interface QuotesTableProps {
  quotes: Quote[];
  clientsById: Map<string, Client>;
  onDuplicate: (quote: Quote) => void;
  onGeneratePdf: (quote: Quote) => void;
  onDelete: (quote: Quote) => void;
}

/** Tabela de orçamentos: número, cliente, data, validade, valor e status. */
export function QuotesTable({ quotes, clientsById, onDuplicate, onGeneratePdf, onDelete }: QuotesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden sm:table-cell">Data</TableHead>
            <TableHead className="hidden md:table-cell">Validade</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-14 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => {
            const client = quote.clientId ? clientsById.get(quote.clientId) : undefined;
            return (
              <TableRow key={quote.id}>
                <TableCell className="font-medium tabular-nums">
                  <Link href={`/orcamentos/${quote.id}`} className="hover:underline">
                    #{String(quote.numero).padStart(6, "0")}
                  </Link>
                </TableCell>
                <TableCell>{client?.nome ?? "—"}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDateBr(quote.dataOrcamento)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDateBr(quote.validadeData)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCentavos(quote.totalCentavos)}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANT[quote.status]}>
                    {QUOTE_STATUS_OPTIONS.find((o) => o.value === quote.status)?.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Ações do orçamento #${quote.numero}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/orcamentos/${quote.id}`}>
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/orcamentos/${quote.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onDuplicate(quote)}>
                        <Copy className="h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onGeneratePdf(quote)}>
                        <Download className="h-4 w-4" />
                        Gerar PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => onDelete(quote)}>
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
