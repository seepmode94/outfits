import path from "node:path";
import ort from "onnxruntime-node";
import sharp from "sharp";

/**
 * Faz o **Recorte** de uma Peça: recebe a Foto original e devolve um PNG com
 * fundo transparente.
 *
 * Corre no servidor por decisão do [ADR-0001]; o modelo é o `u2netp`
 * (Apache-2.0, 4,5 MB) — ver `models/README.md` para o porquê da escolha e as
 * medições. Não importar isto de Client Components: puxa binários nativos.
 */

const SIZE = 320; // o u2netp espera 320x320
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

/** Lado maior do Recorte devolvido. É o que a interface mostra, não precisa de mais. */
const MAX_OUTPUT_EDGE = 1024;

let sessionPromise: Promise<ort.InferenceSession> | null = null;

/**
 * A sessão é criada uma vez e reaproveitada. Com Fluid Compute a instância
 * sobrevive entre invocações, logo os ~65 ms de carregar o modelo pagam-se
 * só no arranque a frio.
 */
function getSession(): Promise<ort.InferenceSession> {
  sessionPromise ??= ort.InferenceSession.create(
    path.join(process.cwd(), "models", "u2netp.onnx"),
    { executionProviders: ["cpu"], graphOptimizationLevel: "all" },
  );
  return sessionPromise;
}

export type CutoutResult = {
  /** PNG com canal alpha. */
  png: Buffer;
  width: number;
  height: number;
  /** Fração de píxeis totalmente transparentes — serve para detetar recortes falhados. */
  transparentRatio: number;
  ms: number;
};

export async function cutout(input: Buffer | Uint8Array): Promise<CutoutResult> {
  const t0 = Date.now();
  const session = await getSession();

  // Limita o lado maior antes de tudo: o Recorte não precisa de ser maior do
  // que aquilo que a interface mostra, e cada píxel a mais é Blob e rede.
  const base = sharp(Buffer.from(input)).rotate(); // rotate() aplica o EXIF do telemóvel
  const meta = await base.metadata();
  if (!meta.width || !meta.height) {
    throw new Error("não consegui ler as dimensões da imagem");
  }

  const scale = Math.min(1, MAX_OUTPUT_EDGE / Math.max(meta.width, meta.height));
  const width = Math.max(1, Math.round(meta.width * scale));
  const height = Math.max(1, Math.round(meta.height * scale));

  const rgbFull = await base
    .clone()
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();

  // ── pré-processamento para o modelo ──
  const small = await base
    .clone()
    .resize(SIZE, SIZE, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();

  let max = 0;
  for (const v of small) if (v > max) max = v;
  if (max === 0) throw new Error("imagem completamente preta");

  const tensor = new Float32Array(3 * SIZE * SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    for (let c = 0; c < 3; c++) {
      tensor[c * SIZE * SIZE + i] = (small[i * 3 + c] / max - MEAN[c]) / STD[c];
    }
  }

  // ── inferência ──
  const out = await session.run({
    [session.inputNames[0]]: new ort.Tensor("float32", tensor, [1, 3, SIZE, SIZE]),
  });
  const pred = out[session.outputNames[0]].data as Float32Array;

  let lo = Infinity;
  let hi = -Infinity;
  for (const v of pred) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const range = hi - lo || 1;

  const mask = Buffer.alloc(SIZE * SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    mask[i] = Math.round(((pred[i] - lo) / range) * 255);
  }

  // ── máscara → alpha no tamanho de saída ──
  // `toColourspace("b-w")` é obrigatório: sem ele o sharp converte para sRGB e
  // devolve 3 canais, e ler o buffer byte a byte produz um alpha com padrão
  // periódico que se confunde facilmente com um defeito do modelo.
  const alpha = await sharp(mask, {
    raw: { width: SIZE, height: SIZE, channels: 1 },
  })
    .resize(width, height, { fit: "fill" })
    .toColourspace("b-w")
    .raw()
    .toBuffer();

  if (alpha.length !== width * height) {
    throw new Error(
      `máscara com ${alpha.length} bytes, esperava ${width * height} ` +
        `(${(alpha.length / (width * height)).toFixed(2)} canais por píxel)`,
    );
  }

  // Interliga-se o RGBA à mão: o `joinChannel()` do sharp reordena etapas do
  // pipeline e falhou de duas formas diferentes durante o desenvolvimento.
  const rgba = Buffer.alloc(width * height * 4);
  let transparent = 0;
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = rgbFull[i * 3];
    rgba[i * 4 + 1] = rgbFull[i * 3 + 1];
    rgba[i * 4 + 2] = rgbFull[i * 3 + 2];
    rgba[i * 4 + 3] = alpha[i];
    if (alpha[i] < 15) transparent++;
  }

  const png = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return {
    png,
    width,
    height,
    transparentRatio: transparent / (width * height),
    ms: Date.now() - t0,
  };
}
