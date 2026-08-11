"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { genderFromLabel } from "@/lib/genders";
import { findDistrict } from "@/lib/districts";

/**
 * Grava o que o onboarding recolhe.
 *
 * Até 2026-08-11 o onboarding não tinha server action nenhuma: o botão
 * "Concluir" fazia `router.push("/today")` e o género, os estilos e o distrito
 * escolhidos eram atirados fora com o estado do componente. O utilizador
 * escolhia e a app perdia — daí `gender` e `district` estarem a `null` em
 * perfis que passaram pelo ecrã.
 */
export async function saveOnboarding(input: {
  genderLabel: string | null;
  styles: string[];
  district: string | null;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  // Só se aceitam valores da lista fechada: o género tem de existir no enum e o
  // distrito tem de ser um dos que têm coordenadas para a meteorologia.
  const gender = input.genderLabel ? genderFromLabel(input.genderLabel) : null;
  const district = findDistrict(input.district)?.name ?? null;

  const values = {
    userId,
    gender,
    district,
    preferredStyles: input.styles,
  };

  await db
    .insert(profiles)
    .values(values)
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { gender, district, preferredStyles: input.styles, updatedAt: new Date() },
    });
}
