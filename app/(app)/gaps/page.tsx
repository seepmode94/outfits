import { auth } from "@/lib/auth";
import { countWardrobe } from "@/lib/db/wardrobe";
import { GapsView } from "./gaps-view";

export default async function GapsPage() {
  let signedIn = false;
  let totalGarments = 0;

  try {
    const session = await auth();
    if (session?.user?.id) {
      signedIn = true;
      totalGarments = (await countWardrobe(session.user.id)).total;
    }
  } catch {
    // Sem BD acessível — degrada para o convite em vez de rebentar.
  }

  return <GapsView signedIn={signedIn} totalGarments={totalGarments} />;
}
