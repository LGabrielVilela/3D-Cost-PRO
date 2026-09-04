"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { calculations } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { Calculation } from "@/types/entities";

export async function list(): Promise<Calculation[]> {
  await requireSession();
  return db.select().from(calculations);
}

export async function getById(id: string): Promise<Calculation | undefined> {
  await requireSession();
  const [row] = await db.select().from(calculations).where(eq(calculations.id, id));
  return row;
}

export async function create(item: Calculation): Promise<Calculation> {
  await requireSession();
  const [row] = await db.insert(calculations).values(item).returning();
  return row;
}

export async function update(id: string, patch: Partial<Calculation>): Promise<Calculation | undefined> {
  await requireSession();
  const [row] = await db.update(calculations).set(patch).where(eq(calculations.id, id)).returning();
  return row;
}

export async function remove(id: string): Promise<void> {
  await requireSession();
  await db.delete(calculations).where(eq(calculations.id, id));
}

export async function replaceAll(items: Calculation[]): Promise<void> {
  await requireSession();
  await db.transaction(async (tx) => {
    await tx.delete(calculations);
    if (items.length > 0) {
      await tx.insert(calculations).values(items);
    }
  });
}
