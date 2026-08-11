import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGarment } from "@/lib/db/wardrobe";
import { GarmentView } from "./garment-view";

export default async function GarmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  const userId = session?.user?.id;
  // Uma Peça é de alguém: sem sessão não há nada a mostrar aqui.
  if (!userId) redirect("/sign-in");

  const garment = await getGarment(userId, id);
  if (!garment) notFound();

  return <GarmentView garment={garment} />;
}
