"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { GarmentCapture } from "@/components/camera/garment-capture";
import { Button } from "@/components/ui/button";

export default function AddGarmentPage() {
  const [cutout, setCutout] = useState<string | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10">
      <header className="flex items-center gap-3 py-4">
        <Link
          href="/wardrobe"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:bg-secondary"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-heading text-2xl font-bold">Adicionar peça</h1>
      </header>

      <GarmentCapture onCutout={setCutout} />

      {cutout && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="mt-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 rounded-2xl bg-secondary/60 p-4 text-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
              <Check className="h-4 w-4" />
            </span>
            <p className="text-muted-foreground">
              Peça recortada! A seguir, a IA vai reconhecer os atributos (tipo,
              cor, formalidade) para confirmares.
            </p>
          </div>

          <Button
            disabled
            className="h-13 w-full rounded-2xl bg-brand-gradient text-base font-semibold text-white opacity-60"
          >
            Guardar no guarda-roupa
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            O reconhecimento por IA e a gravação ligam-se quando configurares a
            chave Gemini e a base de dados.
          </p>
        </motion.section>
      )}
    </main>
  );
}
