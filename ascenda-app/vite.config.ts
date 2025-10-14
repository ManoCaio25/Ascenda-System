import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@padrinho": path.resolve(__dirname, "../Ascenda Padrinho att/src"),
      "@estagiario": path.resolve(__dirname, "../Ascenda Estagiario"),
      "react-router-dom": path.resolve(__dirname, "node_modules/react-router-dom"),
      "lucide-react": path.resolve(__dirname, "../Ascenda Padrinho att/node_modules/lucide-react"),
      "@hello-pangea/dnd": path.resolve(__dirname, "src/shims/helloPangeaDnd.jsx"),
      "framer-motion": path.resolve(__dirname, "node_modules/framer-motion"),
      "date-fns": path.resolve(__dirname, "node_modules/date-fns"),
    },
  },
});
