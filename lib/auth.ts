import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

// Auth.js v5 — lê AUTH_SECRET e AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET do ambiente.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Google],
  pages: { signIn: "/sign-in" },
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
