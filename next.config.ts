import { readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Bibliotecas nativas que os módulos `.node` carregam por **dlopen**.
 *
 * O `outputFileTracing` faz análise estática: segue `require`, e por isso apanha
 * os `.node`, mas **não** apanha os `.so` que esses `.node` abrem em runtime.
 * Sem isto a função arranca e morre com "cannot open shared object file" — foi
 * o que aconteceu com o onnxruntime e, no deploy seguinte, com o libvips.
 *
 * Resolve-se sempre o **caminho real** (`realpathSync`) e nunca um glob com
 * `**`: o pnpm liga `node_modules/<pkg>` ao seu store, e um glob emite duas
 * entradas para o mesmo ficheiro (a do symlink e a real). No deploy as duas
 * escrevem no mesmo destino e a Vercel morre com `EEXIST`. E não se fixam
 * versões: os nomes das pastas do store incluem hashes de peer deps
 * (`sharp@0.35.3_@types+node@20.19.43`).
 */
function dlopenLibs(): string[] {
  const found: string[] = [];

  const collect = (dir: string, match: RegExp) => {
    // realpathSync em CADA ficheiro, não só na pasta de entrada. O pnpm
    // encadeia symlinks: `sharp@X/node_modules/@img/sharp-libvips-linux-x64` é
    // ele próprio um link para outra entrada do store. Um caminho que atravesse
    // um link faz a Vercel rejeitar o pacote inteiro com "invalid deployment
    // package ... files in symlinked directories".
    for (const entry of readdirSync(realpathSync(dir), { withFileTypes: true })) {
      const abs = realpathSync(path.join(realpathSync(dir), entry.name));
      if (entry.isDirectory()) collect(abs, match);
      else if (match.test(entry.name)) {
        found.push("./" + path.relative(__dirname, abs));
      }
    }
  };

  const tryCollect = (dir: string, match: RegExp) => {
    try {
      collect(dir, match);
    } catch {
      // Plataforma sem estes binários (ex.: instalar em macOS): não há nada a
      // incluir e o build continua, em vez de rebentar aqui.
    }
  };

  // onnxruntime-node → libonnxruntime.so.1 (38 MB)
  tryCollect(
    realpathSync(
      path.join(__dirname, "node_modules/onnxruntime-node/bin/napi-v6/linux/x64"),
    ),
    /^libonnxruntime\.so/,
  );

  // sharp → @img/sharp-libvips-linux-x64/lib/libvips-cpp.so (18 MB). Vive ao
  // lado do sharp dentro do store do pnpm, daí resolver-se pelo symlink.
  try {
    const sharpReal = realpathSync(path.join(__dirname, "node_modules/sharp"));
    tryCollect(
      path.join(path.dirname(sharpReal), "@img", "sharp-libvips-linux-x64", "lib"),
      /\.so(\.|$)/,
    );
  } catch {
    // idem
  }

  return found;
}

const nextConfig: NextConfig = {
  // Fixa a raiz do projeto (há um package-lock.json na pasta home que confundia
  // a deteção automática do Turbopack).
  turbopack: {
    root: __dirname,
  },

  // O onnxruntime-node traz binários nativos e o sharp liga-se ao libvips:
  // nenhum dos dois pode ser empacotado pelo bundler.
  serverExternalPackages: ["onnxruntime-node", "sharp"],

  outputFileTracingIncludes: {
    "/*": [
      // O modelo do Recorte é lido do disco em runtime, logo o tracing não o vê.
      "./models/u2netp.onnx",

      // O `libonnxruntime.so.1` (38 MB) é carregado por dlopen a partir do
      // binding nativo, e a análise estática do tracing não o segue. Sem isto
      // a função arranca e morre com "libonnxruntime.so.1: cannot open shared
      // object file" — foi o que aconteceu no deploy de 2026-08-11.
      //
      // Só linux/x64: é o que as Vercel Functions correm. Se algum dia
      // passarem a arm64, o erro é exactamente o mesmo e a correção é
      // acrescentar linux/arm64 aqui.
      //
      // Só os `.so`: os `.node` já vêm pelo tracing natural (são requires), e
      // incluí-los outra vez duplicava-os.
      ...dlopenLibs(),
    ],
  },

  outputFileTracingExcludes: {
    // O pacote traz binários de todas as plataformas: ~186 MB de dylibs do
    // macOS e DLLs do Windows que numa função Linux são peso morto no bundle
    // e no arranque a frio.
    "/*": [
      "./node_modules/onnxruntime-node/bin/napi-v6/win32/**/*",
      "./node_modules/onnxruntime-node/bin/napi-v6/darwin/**/*",
    ],
  },
};

export default nextConfig;
