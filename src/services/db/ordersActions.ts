"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { normalizeRow, normalizeRows } from "@/db/utils";
import { requireSession } from "@/lib/session";
import type { Order } from "@/types/entities";

export async function list(): Promise<Order[]> {
  await requireSession();
  const rows = await db.select().from(orders);
  return normalizeRows<Order>(rows);
}

export async function getById(id: string): Promise<Order | undefined> {
  await requireSession();
  const [row] = await db.select().from(orders).where(eq(orders.id, id));
  return normalizeRow<Order>(row);
}

export async function create(item: Order): Promise<Order> {
  await requireSession();
  const [row] = await db.insert(orders).values(item).returning();
  return normalizeRow<Order>(row) as Order;
}

export async function update(id: string, patch: Partial<Order>): Promise<Order | undefined> {
  await requireSession();
  const [row] = await db.update(orders).set(patch).where(eq(orders.id, id)).returning();
  return normalizeRow<Order>(row);
}

export async function remove(id: string): Promise<void> {
  await requireSession();
  await db.delete(orders).where(eq(orders.id, id));
}

/**
 * O driver `neon-http` não suporta `db.transaction()` — delete/insert
 * rodam como duas operações sequenciais, não atômicas. Aceitável aqui:
 * `replaceAll` só é usado pela ferramenta de migração (uso único).
 */
export async function replaceAll(items: Order[]): Promise<void> {
  await requireSession();
  await db.delete(orders);
  if (items.length > 0) {
    await db.insert(orders).values(items);
  }
}
