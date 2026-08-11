import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { countByFormality, countWardrobe } from "@/lib/db/wardrobe";
import { getWeatherForDistrict, type Weather } from "@/lib/weather";
import { TodayView } from "./today-view";

export default async function TodayPage() {
  let signedIn = false;
  let totalGarments = 0;
  let formalityCounts: Record<string, number> = {};
  let district: string | null = null;
  let weather: Weather | null = null;

  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (userId) {
      signedIn = true;
      const [counts, byFormality, [profile]] = await Promise.all([
        countWardrobe(userId),
        countByFormality(userId),
        db
          .select({ district: profiles.district })
          .from(profiles)
          .where(eq(profiles.userId, userId)),
      ]);
      totalGarments = counts.total;
      formalityCounts = byFormality;
      district = profile?.district ?? null;
      if (district) weather = await getWeatherForDistrict(district);
    }
  } catch {
    // Sem BD acessível — o ecrã degrada para o estado de convite em vez de rebentar.
  }

  return (
    <TodayView
      signedIn={signedIn}
      totalGarments={totalGarments}
      formalityCounts={formalityCounts}
      weather={weather}
      district={district}
    />
  );
}
