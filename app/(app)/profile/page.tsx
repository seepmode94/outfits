import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { ProfileView, type ProfileUser } from "./profile-view";

export default async function ProfilePage() {
  let user: ProfileUser | null = null;
  let savedStyles: string[] | null = null;

  try {
    const session = await auth();
    if (session?.user) {
      user = {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      };
      if (session.user.id) {
        const [profile] = await db
          .select({ preferredStyles: profiles.preferredStyles })
          .from(profiles)
          .where(eq(profiles.userId, session.user.id));
        savedStyles = profile?.preferredStyles ?? null;
      }
    }
  } catch {
    // Sem BD acessível (ex.: dev local sem DATABASE_URL) — trata como anónimo
    // em vez de rebentar a página.
  }

  return <ProfileView user={user} initialStyles={savedStyles} />;
}
