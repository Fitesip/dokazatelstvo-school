import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PGlite грузит свой .wasm с диска — не даём сборщику его упаковывать
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    // 90 — для мангустов (components/ui/Mascot.tsx): на контурах 75 даёт заметное мыло
    qualities: [75, 90],
  },
};

export default nextConfig;
