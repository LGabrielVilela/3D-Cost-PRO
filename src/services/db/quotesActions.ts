"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { quotes } from "@/db/schema";
import { normalizeRow, normalizeRows } from "@/db/utils";
import { requireSession } from "@/lib/session";
import type { Quote } from "@/types/entities";

export async function list(): Promise<Quote[]> {
  await requireSession();
  const rows = await db.select().from(quotes);
  return normalizeRows<Quote>(rows);
}

export async function getById(id: string): Promise<Quote | undefined> {
  await requireSession();
  const [row] = await db.select().from(quotes).where(eq(quotes.id, id));
  return normalizeRow<Quote>(row);
}

export async function create(item: Quote): Promise<Quote> {
  await requireSession();
  const [row] = await db.insert(quotes).values(item).returning();
  return normalizeRow<Quote>(row) as Quote;
}

export async function update(id: string, patch: Partial<Quote>): Promise<Quote | undefined> {
  await requireSession();
  const [row] = await db.update(quotes).set(patch).where(eq(quotes.id, id)).returning();
  return normalizeRow<Quote>(row);
}

export async function remove(id: string): Promise<void> {
  await requireSession();
  await db.delete(quotes).where(eq(quotes.id, id));
}

/**
 * O driver `neon-http` não suporta `db.transaction()` — delete/insert
 * rodam como duas operações sequenciais, não atômicas. Aceitável aqui:
 * `replaceAll` só é usado pela ferramenta de migração (uso único).
 */
export async function replaceAll(items: Quote[]): Promise<void> {
  await requireSession();
  await db.delete(quotes);
  if (items.length > 0) {
    await db.insert(quotes).values(items);
  }
}
