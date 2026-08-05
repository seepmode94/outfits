"use server";

import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

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
