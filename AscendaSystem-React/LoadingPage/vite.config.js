import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sharedEnvDir = path.resolve(currentDir, "..");

function appBase(mode) {
  const env = loadEnv(mode, sharedEnvDir, "");
  return env.VITE_LOADING_BASE || (mode === "production" ? "/loading/" : "/AscendaSystem-React/LoadingPage/");
}

export default defineConfig(({ mode }) => ({
  envDir: sharedEnvDir,
  base: appBase(mode),
  plugins: [react()],
}));
