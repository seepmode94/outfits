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
    // O modelo do Recorte é lido do disco em runtime, logo o tracing não o vê
    // e tem de ser incluído à mão (ver lib/images/cutout.ts).
    "/*": ["./models/u2netp.onnx"],
  },

  outputFileTracingExcludes: {
    // 240 dos 297 MB do onnxruntime para Linux são o provider CUDA. As Vercel
    // Functions não têm GPU e nós pedimos explicitamente o provider "cpu",
    // por isso isto é peso morto no bundle e no arranque a frio.
    "/*": [
      "./node_modules/onnxruntime-node/bin/napi-v6/**/libonnxruntime_providers_cuda.so",
      "./node_modules/onnxruntime-node/bin/napi-v6/**/libonnxruntime_providers_tensorrt.so",
      "./node_modules/onnxruntime-node/bin/napi-v6/win32/**/*",
      "./node_modules/onnxruntime-node/bin/napi-v6/darwin/**/*",
    ],
  },
};

export default nextConfig;
