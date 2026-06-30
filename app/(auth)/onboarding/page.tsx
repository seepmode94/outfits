"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const GENDERS = ["Mulher", "Homem", "Não-binário", "Prefiro não dizer"];
const STYLES = [
  "Casual",
  "Streetwear",
  "Clássico",
  "Formal",
  "Desportivo",
  "Boho",
  "Minimalista",
  "Vintage",
];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-transparent bg-brand-gradient text-white"
          : "border-border bg-background text-foreground/70 hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [gender, setGender] = useState<string | null>(null);
  const [styles, setStyles] = useState<string[]>([]);
  const [district, setDistrict] = useState("");

  function toggleStyle(s: string) {
    setStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  const sections = [
    {
      title: "Como te identificas?",
      body: (
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <Chip
              key={g}
              label={g}
              active={gender === g}
              onClick={() => setGender(g)}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Que estilos gostas? (escolhe os que quiseres)",
      body: (
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Chip
              key={s}
              label={s}
              active={styles.includes(s)}
              onClick={() => toggleStyle(s)}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Qual é o teu distrito? (para o tempo)",
      body: (
        <input
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="ex: Porto"
          className="h-13 w-full rounded-2xl border border-border bg-background px-4 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/40"
        />
      ),
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold">
          Vamos <span className="text-brand-gradient">conhecer-te</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Para sugestões mais à tua cara.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-7">
        {sections.map((s, i) => (
          <motion.section
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm font-medium">{s.title}</p>
            {s.body}
          </motion.section>
        ))}
      </div>

      <button
        onClick={() => router.push("/today")}
        className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient text-base font-semibold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
      >
        Concluir
        <ArrowRight className="h-5 w-5" />
      </button>
    </main>
  );
}
