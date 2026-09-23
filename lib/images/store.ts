import { del, put } from "@vercel/blob";

/**
 * Guarda as imagens de uma Peça no Vercel Blob.
 *
 * **O nível de acesso é do _store_, não do ficheiro.** Um `put` com
 * `access: "private"` num store público falha com *"Cannot use private access on
 * a public store"* — medido a 2026-08-11, e contraria os exemplos da
 * documentação, que sugerem que se escolhe por ficheiro.
 *
 * Consequência: são precisos **dois stores**.
 *
 * - `outfits-pecas` (público) → o **Recorte**. Vai num `<img>` na grelha e no
 *   detalhe; servir isto de um store privado dá entrega lenta e egress caro,
 *   como a própria documentação avisa. O `addRandomSuffix: true` (explícito, ver abaixo)
 *   torna o URL não adivinhável.
 * - `outfits-originais` (privado) → a **Foto original**, que nunca é exibida e
 *   pode mostrar a casa do utilizador.
 *
 * O CLI só injeta um `BLOB_READ_WRITE_TOKEN` por projeto, por isso o token do
 * store privado tem de ser colado à mão como `BLOB_PRIVATE_TOKEN`. **Enquanto
 * não existir, a Foto original não é guardada** — em vez de a mandar para o
 * store público, que trocaria privacidade por conveniência sem ninguém decidir.
 */

const PRIVATE_TOKEN = process.env.BLOB_PRIVATE_TOKEN;

export function blobPrefix(userId: string): string {
  return `pecas/${userId}/`;
}

/** Diz se a Foto original pode ser persistida. Ver o comentário acima. */
export function canStoreOriginal(): boolean {
  return Boolean(PRIVATE_TOKEN);
}

/**
 * Guarda a **Foto original** no store privado. Devolve `null` quando não há
 * token privado configurado — a Peça nasce sem ela e fica por reprocessar.
 */
export async function storeCaptura(
  userId: string,
  bytes: Buffer,
  contentType: string,
): Promise<string | null> {
  if (!PRIVATE_TOKEN) return null;

  const { url } = await put(`${blobPrefix(userId)}original`, bytes, {
    access: "private",
    contentType,
    token: PRIVATE_TOKEN,
    addRandomSuffix: true,
  });
  return url;
}

/** Guarda o **Recorte** no store público — é o que a interface mostra. */
export async function storeRecorte(
  userId: string,
  png: Buffer,
): Promise<string> {
  const { url } = await put(`${blobPrefix(userId)}recorte.png`, png, {
    access: "public",
    contentType: "image/png",
    // Explícito: na v2 do @vercel/blob isto é `false` por omissão, apesar de a
    // tipagem dizer o contrário. Sem sufixo, a segunda Peça do mesmo
    // utilizador colidia no mesmo caminho e o `put` recusa sobrescrever — e o
    // URL passava a ser adivinhável a partir do userId.
    addRandomSuffix: true,
  });
  return url;
}

/**
 * Apaga as imagens de uma Peça: o **Recorte** (store público, token do CLI) e a
 * **Foto original** (store privado, token próprio). Corre *depois* de a linha
 * sair da base de dados e não desfaz nada se falhar: um blob órfão custa
 * cêntimos e ninguém o vê; uma Peça sem imagem seria um erro visível na grelha.
 * Sem `BLOB_PRIVATE_TOKEN` a Foto original fica órfã — não há como a apagar.
 */
export async function deleteGarmentImages(
  imageUrl: string,
  originalImageUrl: string | null,
): Promise<void> {
  const jobs: Promise<void>[] = [del(imageUrl)];
  if (originalImageUrl && PRIVATE_TOKEN) {
    jobs.push(del(originalImageUrl, { token: PRIVATE_TOKEN }));
  }
  for (const r of await Promise.allSettled(jobs)) {
    if (r.status === "rejected") {
      console.error("[store] blob não apagado", r.reason);
    }
  }
}

/**
 * Os URLs voltam do cliente para confirmar a Peça, logo não são de confiar: sem
 * esta verificação um pedido forjado gravava no Armário um URL arbitrário — ou
 * o Recorte de outra pessoa.
 */
export function ownsBlobUrl(url: string, userId: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    return (
      hostname.endsWith(".blob.vercel-storage.com") &&
      pathname.startsWith("/" + blobPrefix(userId))
    );
  } catch {
    return false;
  }
}
