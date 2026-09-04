import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não configurada — confira as variáveis de ambiente do banco Neon.");
}

const sql = neon(process.env.DATABASE_URL);

/** Cliente Drizzle único do processo — só deve ser importado por código de servidor (Server Actions). */
export const db = drizzle(sql, { schema });
