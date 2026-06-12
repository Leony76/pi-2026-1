
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { defineConfig, env } from "prisma/config";

const envPaths = [path.resolve(__dirname, ".env"), path.resolve(__dirname, "../.env")];
let loadedEnvPath: string | null = null;

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loadedEnvPath = envPath;
    break;
  }
}

if (!loadedEnvPath) {
  console.warn("Nenhum arquivo .env foi encontrado para o Prisma.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});