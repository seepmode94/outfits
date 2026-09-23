"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { signInWithGoogle, signInWithEmail } from "./actions";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.29 9.14 4.75 12 4.75z"
      />
    </svg>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  Verification: "Esse link expirou ou já foi usado. Pede um novo.",
  OAuthAccountNotLinked:
    "Esse email já entrou por outro método. Usa o mesmo de antes.",
  AccessDenied: "Acesso recusado. Tenta com outra conta.",
  Configuration: "Erro do nosso lado. Tenta de novo daqui a pouco.",
  EmailSignin: "Não conseguimos enviar o email. Tenta outra vez.",
  EmailSignInError: "Não conseguimos enviar o email. Tenta outra vez.",
};

function AuthErrorNotice() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <p className="w-full rounded-2xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-deep">
      {ERROR_MESSAGES[error] ?? "Não foi possível entrar. Tenta outra vez."}
    </p>
  );
}

// `emailLogin` vem do servidor (page.tsx) — o magic link só aparece quando o
// provider Resend está ligado, para não mostrar um botão que dá erro.
export function SignInScreen({ emailLogin }: { emailLogin: boolean }) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6">
      {/* glow coral→grape no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-gradient opacity-25 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="z-10 flex w-full max-w-sm flex-col items-center gap-7 text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center gap-2 font-heading text-2xl font-extrabold">
            <span className="h-2.5 w-2.5 rounded-full bg-coral shadow-[0_0_0_5px_rgba(255,86,56,0.18)]" />
            outfits
          </span>
          <h1 className="font-heading text-3xl font-extrabold">
            Entra no <span className="text-brand-gradient">Outfits</span>
          </h1>
          <p className="text-sm text-ink-soft">
            Guarda o teu armário e recebe sugestões todos os dias.
          </p>
        </div>

        <Suspense fallback={null}>
          <AuthErrorNotice />
        </Suspense>

        <div className="flex w-full flex-col gap-3">
          <form action={signInWithGoogle} className="w-full">
            <button
              type="submit"
              className="flex h-13 w-full items-center justify-center gap-3 rounded-full bg-white font-bold shadow-soft transition-transform active:scale-[0.98]"
            >
              <GoogleIcon />
              Continuar com Google
            </button>
          </form>

          {emailLogin && (
            <>
              <div className="flex items-center gap-3 py-1 text-xs text-ink-soft">
                <span className="h-px flex-1 bg-ink/10" />
                ou
                <span className="h-px flex-1 bg-ink/10" />
              </div>

              <form action={signInWithEmail} className="flex flex-col gap-3">
                <input
                  type="email"
                  name="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  placeholder="o-teu@email.com"
                  className="h-13 w-full rounded-full bg-white px-5 text-base shadow-soft outline-none placeholder:text-ink-soft/60 focus:ring-3 focus:ring-coral/40"
                />
                <button
                  type="submit"
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral font-extrabold text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-[0.98]"
                >
                  <Mail className="h-5 w-5" />
                  Receber link de acesso
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-xs text-ink-soft">
          {emailLogin
            ? "Ao continuar aceitas os termos. O link chega por email e é válido 24 horas."
            : "Ao continuar aceitas os termos."}
        </p>
      </motion.div>
    </main>
  );
}
