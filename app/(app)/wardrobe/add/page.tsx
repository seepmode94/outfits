"use client";

import Link from "next/link";
import { useState } from "react";
import { Shirt } from "lucide-react";
import { GarmentCapture } from "@/components/camera/garment-capture";
import type { CaptureResult } from "@/lib/capture";
import { AttributesForm } from "./attributes-form";

export default function AddGarmentPage() {
  const [capture, setCapture] = useState<CaptureResult | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6 pb-24">
      <header className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="font-heading text-[26px] font-extrabold">
            Adicionar peça
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft">
            Uma foto é uma peça
          </p>
        </div>
        <Link
          href="/profile"
          aria-label="Perfil"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white"
        >
          <Shirt className="h-5 w-5" />
        </Link>
      </header>

      <div className="px-5">
        <GarmentCapture
          onCaptured={setCapture}
          onReset={() => setCapture(null)}
        />
      </div>

      {capture && <AttributesForm capture={capture} />}
    </main>
  );
}
