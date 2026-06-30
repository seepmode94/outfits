import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixa a raiz do projeto (há um package-lock.json na pasta home que confundia
  // a deteção automática do Turbopack).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
