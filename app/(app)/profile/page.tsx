import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, type Profile } from "@/lib/db/schema";
import { countWardrobe } from "@/lib/db/wardrobe";
import { ProfileView, type ProfileUser } from "./profile-view";

export default async function ProfilePage() {
  let user: ProfileUser | null = null;
  let savedStyles: string[] | null = null;
  let counts: { total: number; favourites: number } | null = null;
  let district: string | null = null;
  let gender: Profile["gender"] = null;

  try {
    const session = await auth();
    if (session?.user) {
      user = {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      };
      if (session.user.id) {
        const [[profile], wardrobeCounts] = await Promise.all([
          db
            .select({
              preferredStyles: profiles.preferredStyles,
              district: profiles.district,
              gender: profiles.gender,
            })
            .from(profiles)
            .where(eq(profiles.userId, session.user.id)),
          countWardrobe(session.user.id),
        ]);
        savedStyles = profile?.preferredStyles ?? null;
        district = profile?.district ?? null;
        gender = profile?.gender ?? null;
        counts = wardrobeCounts;
      }
    }
  } catch {
    // Sem BD acessível (ex.: dev local sem DATABASE_URL) — trata como anónimo
    // em vez de rebentar a página.
  }

  return (
    <ProfileView
      user={user}
      initialStyles={savedStyles}
      counts={counts}
      initialDistrict={district}
      initialGender={gender}
    />
  );
}
