import { auth } from "@/lib/auth";
import { ProfileView, type ProfileUser } from "./profile-view";

export default async function ProfilePage() {
  let user: ProfileUser | null = null;
  try {
    const session = await auth();
    if (session?.user) {
      user = {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      };
    }
  } catch {
    // Sem BD acessível (ex.: dev local sem DATABASE_URL) — trata como anónimo
    // em vez de rebentar a página.
  }

  return <ProfileView user={user} />;
}
