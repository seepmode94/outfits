"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { GarmentCapture } from "@/components/camera/garment-capture";

export default function AddGarmentPage() {
  const [cutout, setCutout] = useState<string | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6 pb-24">
      <header className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="font-heading text-[26px] font-extrabold">
            Adicionar peça
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft">Aponta e fotografa</p>
        </div>
        <Link
          href="/profile"
          aria-label="Perfil"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-base font-extrabold text-white"
        >
          AS
        </Link>
      </header>

      <div className="px-5">
        <GarmentCapture onCutout={setCutout} />
      </div>

      {cutout && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <div className="px-5 pt-5">
            <button
              disabled
              className="w-full rounded-full bg-coral py-4 text-sm font-extrabold text-white opacity-60"
            >
              📸 Guardar no armário
            </button>
            <p className="pt-3 text-center text-xs text-ink-soft">
              O recorte já é feito no servidor. Falta o armazenamento de imagens
              para a peça poder ficar guardada — até lá este recorte vive só
              neste ecrã.
            </p>
          </div>
        </motion.section>
      )}
    </main>
  );
}
