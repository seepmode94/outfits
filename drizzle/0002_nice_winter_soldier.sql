-- O `drizzle-kit generate` produziu:
--   ... USING "formality"::text::"public"."formality"[]
-- que falha com `malformed array literal: "casual"` — o Postgres espera sintaxe
-- de array (`{casual}`) e recebe o valor solto. Verificado com um SELECT antes
-- de aplicar. ARRAY[...] envolve o valor e preserva as Peças que já existem.
ALTER TABLE "garment"
  ALTER COLUMN "formality" SET DATA TYPE "public"."formality"[]
  USING CASE
    WHEN "formality" IS NULL THEN NULL
    ELSE ARRAY["formality"]
  END;
