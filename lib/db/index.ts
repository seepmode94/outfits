import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Em produção, DATABASE_URL vem do Vercel/Neon.
// O fallback (placeholder) só existe para o build/import não falhar enquanto a
// variável ainda não estiver definida — qualquer query real precisa da
// DATABASE_URL verdadeira (caso contrário a ligação falha em runtime).
const url =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@db.placeholder.neon.tech/placeholder?sslmode=require";

const sql = neon(url);

export const db = drizzle(sql, { schema });

export * from "./schema";
