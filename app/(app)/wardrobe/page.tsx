import { auth } from "@/lib/auth";
import { listWardrobe, type WardrobeGarment } from "@/lib/db/wardrobe";
import { WardrobeView } from "./wardrobe-view";

export default async function WardrobePage() {
  let signedIn = false;
  // `null` distingue "não consegui ler" de "está vazio" — o segundo mostra o
  // convite para adicionar a primeira peça, o primeiro seria uma mentira.
  let garments: WardrobeGarment[] | null = [];

  const session = await auth().catch(() => null);

  if (session?.user?.id) {
    signedIn = true;
    garments = await listWardrobe(session.user.id).catch(() => null);
  }

  return <WardrobeView garments={garments} signedIn={signedIn} />;
}
