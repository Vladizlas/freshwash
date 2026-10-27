import type { NextConfig } from "next";

// Sequelize/mysql2 dibiarkan sebagai paket Node.js agar tidak dibundel Turbopack.
const nextConfig: NextConfig = {
  serverExternalPackages: ["sequelize", "mysql2", "bcryptjs"],
};
export default nextConfig;
