import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

// O remetente segue esta ordem de preferência:
//  1. AUTH_EMAIL_FROM — endereço completo, tem prioridade sobre tudo
//  2. RESEND_EMAIL_DOMAIN — domínio verificado no Resend (definido pela
//     integração); daqui deriva-se no-reply@<domínio>
//  3. onboarding@resend.dev — remetente partilhado do Resend, que só entrega
//     ao dono da conta. É por isto que o magic link não chega a mais ninguém
//     enquanto não houver domínio verificado.
const RESEND_DOMAIN = process.env.RESEND_EMAIL_DOMAIN;
const EMAIL_FROM =
  process.env.AUTH_EMAIL_FROM ||
  (RESEND_DOMAIN
    ? `Outfits <no-reply@${RESEND_DOMAIN}>`
    : "Outfits <onboarding@resend.dev>");

// Magic link só com AUTH_EMAIL_LOGIN=1: o Resend exige um domínio verificado e
// sem ele o pedido dá erro. Desligado, o formulário desaparece do /sign-in e
// /api/auth/signin/resend responde "provider not found" sem chamar o Resend.
export const EMAIL_LOGIN_ENABLED = process.env.AUTH_EMAIL_LOGIN === "1";

// Auth.js v5 — lê AUTH_SECRET e AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET do ambiente.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    // O linking por email é seguro com o Google porque este garante que o
    // email é verificado — permite que quem se registou por magic link
    // entre depois com o botão Google (mesma conta, sem OAuthAccountNotLinked).
    Google({ allowDangerousEmailAccountLinking: true }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY,
      from: EMAIL_FROM,
      async sendVerificationRequest({ identifier: to, provider, url }) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to,
            subject: "O teu link de acesso ao Outfits",
            text: `Entra no Outfits com este link (válido 24 horas):\n\n${url}\n\nSe não pediste este email, ignora-o.`,
            html: `<div style="font-family:system-ui,sans-serif;max-width:440px;margin:0 auto;padding:32px 24px;background:#FFF4EC;border-radius:24px;color:#17121F">
  <p style="font-weight:800;font-size:20px;margin:0 0 4px">● outfits</p>
  <h1 style="font-size:24px;margin:16px 0 8px">O teu link de acesso</h1>
  <p style="color:#5A5266;font-size:14px;line-height:1.5;margin:0 0 24px">Toca no botão para entrares. O link é válido durante 24 horas.</p>
  <a href="${url}" style="display:block;text-align:center;background:#FF5638;color:#fff;font-weight:800;text-decoration:none;padding:14px;border-radius:100px">Entrar no Outfits</a>
  <p style="color:#5A5266;font-size:12px;margin:24px 0 0">Se não pediste este email, ignora-o.</p>
</div>`,
          }),
        });
        if (!res.ok)
          throw new Error("Resend error: " + JSON.stringify(await res.json()));
      },
    }),
  ].filter((provider) => EMAIL_LOGIN_ENABLED || provider.id !== "resend"),
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/check-email",
    // Utilizadores acabados de criar passam primeiro pelo onboarding.
    newUser: "/onboarding",
  },
  // O Auth.js embrulha as falhas do callback em CallbackRouteError e só expõe a
  // origem real em `cause`. Sem isto, os logs mostram apenas o invólucro.
  logger: {
    error(error) {
      const cause = (error as { cause?: unknown }).cause;
      console.error(
        "[auth:error]",
        error.name,
        error.message,
        "| cause:",
        cause instanceof Error
          ? `${cause.name}: ${cause.message}`
          : JSON.stringify(cause),
        "| stack:",
        cause instanceof Error ? cause.stack : undefined,
      );
    },
  },
});
