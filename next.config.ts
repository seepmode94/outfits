import type { NextConfig } from "next";

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
      // Dois caminhos de propósito: o pnpm põe um symlink em
      // node_modules/onnxruntime-node e o glob pode não o atravessar, por isso
      // aponta-se também ao caminho real no store. A versão fica com `@*`
      // para uma atualização não voltar a partir isto em silêncio.
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/**/*",
      "./node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v6/linux/x64/**/*",
    ],
  },

  outputFileTracingExcludes: {
    // O pacote traz binários de todas as plataformas: ~186 MB de dylibs do
    // macOS e DLLs do Windows que numa função Linux são peso morto no bundle
    // e no arranque a frio.
    "/*": [
      "./node_modules/onnxruntime-node/bin/napi-v6/win32/**/*",
      "./node_modules/onnxruntime-node/bin/napi-v6/darwin/**/*",
      "./node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v6/win32/**/*",
      "./node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v6/darwin/**/*",
    ],
  },
};

export default nextConfig;
