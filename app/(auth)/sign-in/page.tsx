import { EMAIL_LOGIN_ENABLED } from "@/lib/auth";
import { SignInScreen } from "./sign-in-screen";

// Server component só para ler a flag do ambiente; o ecrã em si é cliente
// (animação) e vive em sign-in-screen.tsx.
export default function SignInPage() {
  return <SignInScreen emailLogin={EMAIL_LOGIN_ENABLED} />;
}
