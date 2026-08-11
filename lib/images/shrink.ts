/**
 * Reduz uma imagem no **browser** antes do upload (usa canvas — só pode ser
 * importado por Client Components). Uma foto de telemóvel são 2–5 MB e a rede
 * móvel paga-a; 2048px é mais do que o servidor precisa (ADR-0002).
 *
 * Partilhado entre a captura de Peças e o upload de Inspirações.
 */

const MAX_EDGE = 2048;
const JPEG_QUALITY = 0.85;

export async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("sem contexto 2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new Error("não consegui codificar a imagem");
  return blob;
}
