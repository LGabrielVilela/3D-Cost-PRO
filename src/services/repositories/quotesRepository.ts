import { generateId } from "@/lib/id";
import { LocalStorageAdapter, STORAGE_KEYS } from "@/services/storage/localStorageAdapter";
import type { Quote } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

class QuotesRepository extends BaseRepository<Quote> {
  /** Próximo número sequencial de orçamento (para exibir "Orçamento Nº 000123"). */
  async nextNumero(): Promise<number> {
    const quotes = await this.list();
    const max = quotes.reduce((acc, q) => Math.max(acc, q.numero ?? 0), 0);
    return max + 1;
  }

  /**
   * Duplica um orçamento existente: mantém itens, valores, condições e
   * observações, mas gera um número novo e reseta o status para rascunho —
   * o usuário ainda pode trocar cliente, quantidade, preço, data e validade.
   */
  async duplicate(id: string): Promise<Quote | undefined> {
    const original = await this.getById(id);
    if (!original) return undefined;

    const numero = await this.nextNumero();
    const now = new Date().toISOString();
    const hoje = now.slice(0, 10);

    const duplicated: Quote = {
      ...original,
      id: generateId(),
      numero,
      status: "rascunho",
      dataOrcamento: hoje,
      itens: original.itens.map((item) => ({ ...item, id: generateId() })),
      formasPagamento: original.formasPagamento.map((forma) => ({ ...forma, id: generateId() })),
      createdAt: now,
      updatedAt: now,
    };

    return this.createRaw(duplicated);
  }
}

export const quotesRepository = new QuotesRepository(
  new LocalStorageAdapter<Quote>(STORAGE_KEYS.quotes),
);
