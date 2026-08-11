import { realpathSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Caminho **canónico** do `libonnxruntime.so.1`, relativo à raiz do projeto.
 *
 * Porque não um glob: `node_modules/onnxruntime-node` é um symlink para o store
 * do pnpm, e um padrão com `**` faz o resolver emitir duas entradas para o
 * mesmo ficheiro (a do symlink e a real). No deploy as duas escrevem no mesmo
 * destino e a Vercel morre com `EEXIST`. Resolver o symlink aqui dá uma entrada
 * só, sem fixar a versão no caminho.
 */
function onnxRuntimeLib(): string[] {
  try {
    const real = realpathSync(
      path.join(
        __dirname,
        "node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1",
      ),
    );
    return ["./" + path.relative(__dirname, real)];
  } catch {
    // Sem o binário de Linux (ex.: instalação noutra plataforma) não há nada a
    // incluir; o build continua e só falharia em runtime nessa plataforma.
    return [];
  }
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
      // Só o `.so`: o `onnxruntime_binding.node` já vem pelo tracing natural
      // (é um require), e incluí-lo outra vez duplicava-o.
      ...onnxRuntimeLib(),
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
