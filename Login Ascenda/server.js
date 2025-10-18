import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Raiz = pasta-pai que contém as 4 pastas
const ROOT = path.resolve(__dirname, "..");

const app = express();
app.use(express.static(ROOT, { extensions: ["html"] }));

// Atalho: abrir diretamente o Login Ascenda
app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT, "Login Ascenda", "index.html"));
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, async () => {
  console.log(`Dev server on http://localhost:${PORT}`);
  await open(`http://localhost:${PORT}/`);
});
