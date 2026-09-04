"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { printers } from "@/db/schema";
import { normalizeRow, normalizeRows } from "@/db/utils";
import { requireSession } from "@/lib/session";
import type { Printer } from "@/types/entities";

export async function list(): Promise<Printer[]> {
  await requireSession();
  const rows = await db.select().from(printers);
  return normalizeRows<Printer>(rows);
}

export async function getById(id: string): Promise<Printer | undefined> {
  await requireSession();
  const [row] = await db.select().from(printers).where(eq(printers.id, id));
  return normalizeRow<Printer>(row);
}

export async function create(item: Printer): Promise<Printer> {
  await requireSession();
  const [row] = await db.insert(printers).values(item).returning();
  return normalizeRow<Printer>(row) as Printer;
}

export async function update(id: string, patch: Partial<Printer>): Promise<Printer | undefined> {
  await requireSession();
  const [row] = await db.update(printers).set(patch).where(eq(printers.id, id)).returning();
  return normalizeRow<Printer>(row);
}

export async function remove(id: string): Promise<void> {
  await requireSession();
  await db.delete(printers).where(eq(printers.id, id));
}

/**
 * O driver `neon-http` não suporta `db.transaction()` — delete/insert
 * rodam como duas operações sequenciais, não atômicas. Aceitável aqui:
 * `replaceAll` só é usado pela ferramenta de migração (uso único).
 */
export async function replaceAll(items: Printer[]): Promise<void> {
  await requireSession();
  await db.delete(printers);
  if (items.length > 0) {
    await db.insert(printers).values(items);
  }
}
