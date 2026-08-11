"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { findDistrict } from "@/lib/districts";
import { type Gender, GENDER_LABELS } from "@/lib/genders";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// Grava os estilos preferidos no perfil do utilizador com sessão.
// Sem sessão é um no-op silencioso (o toggle fica só local, modo protótipo).
export async function updatePreferredStyles(styles: string[]) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  await db
    .insert(profiles)
    .values({ userId, preferredStyles: styles })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { preferredStyles: styles, updatedAt: new Date() },
    });
}

/**
 * Grava o **distrito**, que é o que a meteorologia precisa para o "Veste-me
 * hoje". Editável aqui e não só no onboarding: quem já passou pelo primeiro
 * login nunca mais o vê (`pages.newUser` só dispara uma vez), e sem isto ficaria
 * sem forma de o definir.
 */
export async function updateDistrict(district: string | null) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  // Lista fechada: só distritos com coordenadas conhecidas.
  const valid = findDistrict(district)?.name ?? null;

  await db
    .insert(profiles)
    .values({ userId, district: valid })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { district: valid, updatedAt: new Date() },
    });

  revalidatePath("/today");
  revalidatePath("/profile");
}

/** Grava o género. Alimenta o contexto do `suggestOutfit`. */
export async function updateGender(gender: Gender | null) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  const valid = gender && gender in GENDER_LABELS ? gender : null;

  await db
    .insert(profiles)
    .values({ userId, gender: valid })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { gender: valid, updatedAt: new Date() },
    });

  revalidatePath("/profile");
}
