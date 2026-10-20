import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // 90 — для мангустов (components/ui/Mascot.tsx): на контурах 75 даёт заметное мыло
    qualities: [75, 90],
  },
};

export default nextConfig;
