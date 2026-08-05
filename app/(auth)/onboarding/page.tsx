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
  activeClass,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
        active ? activeClass : "border-ink/10 bg-white text-ink-soft shadow-soft"
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
              activeClass="border-coral bg-coral text-white"
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
              activeClass="border-ink bg-lime text-ink"
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
          className="h-13 w-full rounded-full bg-white px-5 text-base shadow-soft outline-none placeholder:text-ink-soft/60 focus:ring-3 focus:ring-coral/40"
        />
      ),
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-extrabold">
          Vamos <span className="text-brand-gradient">conhecer-te</span>
        </h1>
        <p className="text-sm text-ink-soft">Para sugestões mais à tua cara.</p>
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
            <p className="text-sm font-bold">{s.title}</p>
            {s.body}
          </motion.section>
        ))}
      </div>

      <button
        onClick={() => router.push("/today")}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-coral text-base font-extrabold text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-[0.98]"
      >
        Concluir
        <ArrowRight className="h-5 w-5" />
      </button>
    </main>
  );
}
