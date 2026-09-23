"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { EMAIL_LOGIN_ENABLED, signIn } from "@/lib/auth";

// Falhas conhecidas do Auth.js voltam ao sign-in com uma mensagem amigável;
// o redirect de sucesso (NEXT_REDIRECT) e erros inesperados seguem o curso.
async function signInOrExplain(
  provider: string,
  options: Record<string, unknown>,
) {
  try {
    await signIn(provider, options);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/sign-in?error=${encodeURIComponent(error.type)}`);
    }
    throw error;
  }
}

export async function signInWithGoogle() {
  await signInOrExplain("google", { redirectTo: "/today" });
}

export async function signInWithEmail(formData: FormData) {
  // O formulário não é renderizado sem a flag; isto só apanha pedidos forjados.
  if (!EMAIL_LOGIN_ENABLED) return;
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;
  await signInOrExplain("resend", { email, redirectTo: "/today" });
}
