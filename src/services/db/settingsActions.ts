"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { SETTINGS_ROW_ID, settings } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { AppSettings } from "@/types/entities";

export async function getSettings(): Promise<AppSettings | undefined> {
  await requireSession();
  const [row] = await db.select().from(settings).where(eq(settings.id, SETTINGS_ROW_ID));
  if (!row) return undefined;
  return {
    empresa: row.empresa,
    precificacao: row.precificacao,
    orcamento: row.orcamento,
    branding: row.branding,
  };
}

export async function saveSettings(next: AppSettings): Promise<AppSettings> {
  await requireSession();
  const now = new Date().toISOString();
  await db
    .insert(settings)
    .values({ id: SETTINGS_ROW_ID, ...next, updatedAt: now })
    .onConflictDoUpdate({
      target: settings.id,
      set: { ...next, updatedAt: now },
    });
  return next;
}
