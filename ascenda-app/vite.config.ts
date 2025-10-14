import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@padrinho": path.resolve(__dirname, "../Ascenda Padrinho att/src"),
      "@estagiario": path.resolve(__dirname, "../Ascenda Estagiario/src"),
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
