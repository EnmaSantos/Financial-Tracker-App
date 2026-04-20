import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ledger/db", "@ledger/shared"],
};

export default nextConfig;
