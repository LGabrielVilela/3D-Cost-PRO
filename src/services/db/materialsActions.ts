"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { materials } from "@/db/schema";
import { normalizeRow, normalizeRows } from "@/db/utils";
import { requireSession } from "@/lib/session";
import type { Material } from "@/types/entities";

export async function list(): Promise<Material[]> {
  await requireSession();
  const rows = await db.select().from(materials);
  return normalizeRows<Material>(rows);
}

export async function getById(id: string): Promise<Material | undefined> {
  await requireSession();
  const [row] = await db.select().from(materials).where(eq(materials.id, id));
  return normalizeRow<Material>(row);
}

export async function create(item: Material): Promise<Material> {
  await requireSession();
  const [row] = await db.insert(materials).values(item).returning();
  return normalizeRow<Material>(row) as Material;
}

export async function update(id: string, patch: Partial<Material>): Promise<Material | undefined> {
  await requireSession();
  const [row] = await db.update(materials).set(patch).where(eq(materials.id, id)).returning();
  return normalizeRow<Material>(row);
}

export async function remove(id: string): Promise<void> {
  await requireSession();
  await db.delete(materials).where(eq(materials.id, id));
}

/**
 * O driver `neon-http` não suporta `db.transaction()` — delete/insert
 * rodam como duas operações sequenciais, não atômicas. Aceitável aqui:
 * `replaceAll` só é usado pela ferramenta de migração (uso único).
 */
export async function replaceAll(items: Material[]): Promise<void> {
  await requireSession();
  await db.delete(materials);
  if (items.length > 0) {
    await db.insert(materials).values(items);
  }
}
