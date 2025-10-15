import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
      "@padrinho": resolve(rootDir, "../Ascenda Padrinho att/src"),
      "@estagiario": resolve(rootDir, "../Ascenda Estagiario/src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  optimizeDeps: {
    include: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "date-fns",
      "@hello-pangea/dnd",
    ],
  },
});
