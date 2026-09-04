"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { clients } from "@/db/schema";
import { normalizeRow, normalizeRows } from "@/db/utils";
import { requireSession } from "@/lib/session";
import type { Client } from "@/types/entities";

export async function list(): Promise<Client[]> {
  await requireSession();
  const rows = await db.select().from(clients);
  return normalizeRows<Client>(rows);
}

export async function getById(id: string): Promise<Client | undefined> {
  await requireSession();
  const [row] = await db.select().from(clients).where(eq(clients.id, id));
  return normalizeRow<Client>(row);
}

export async function create(item: Client): Promise<Client> {
  await requireSession();
  const [row] = await db.insert(clients).values(item).returning();
  return normalizeRow<Client>(row) as Client;
}

export async function update(id: string, patch: Partial<Client>): Promise<Client | undefined> {
  await requireSession();
  const [row] = await db.update(clients).set(patch).where(eq(clients.id, id)).returning();
  return normalizeRow<Client>(row);
}

export async function remove(id: string): Promise<void> {
  await requireSession();
  await db.delete(clients).where(eq(clients.id, id));
}

/**
 * O driver `neon-http` não suporta `db.transaction()` — delete/insert
 * rodam como duas operações sequenciais, não atômicas. Aceitável aqui:
 * `replaceAll` só é usado pela ferramenta de migração (uso único).
 */
export async function replaceAll(items: Client[]): Promise<void> {
  await requireSession();
  await db.delete(clients);
  if (items.length > 0) {
    await db.insert(clients).values(items);
  }
}
