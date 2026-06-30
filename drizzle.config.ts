import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Carrega .env.local (onde o Next guarda os segredos em desenvolvimento)
config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
