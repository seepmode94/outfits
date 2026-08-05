import Link from "next/link";

// Página de "verifica o teu email" (pages.verifyRequest do Auth.js) —
// mostrada logo após o envio do magic link.
export default function CheckEmailPage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-gradient opacity-25 blur-3xl"
      />

      <div className="z-10 flex w-full max-w-sm flex-col items-center gap-5">
        <span className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-4xl shadow-soft">
          ✉️
        </span>
        <h1 className="font-heading text-3xl font-extrabold">
          Vê o teu email
        </h1>
        <p className="text-sm leading-relaxed text-ink-soft">
          Enviámos-te um link de acesso. Abre-o no
          <b className="text-ink"> mesmo dispositivo </b>
          onde queres usar o Outfits. É válido durante 24 horas.
        </p>
        <p className="text-xs text-ink-soft">
          Não chegou? Vê o spam ou{" "}
          <Link href="/sign-in" className="font-bold text-coral">
            pede outro link
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
