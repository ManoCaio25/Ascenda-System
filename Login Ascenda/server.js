import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");

const app = express();
app.use(express.static(ROOT, { extensions: ["html"] }));

app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT, "Login Ascenda", "index.html"));
});

const PORT = process.env.PORT || 5173;
const URL = `http://localhost:${PORT}/`;

app.listen(PORT, async () => {
  console.log(`Dev server on ${URL}`);
  try {
    // garante que estamos usando o default export correto do pacote
    await open(URL, { wait: false });
  } catch (err) {
    console.warn("Não consegui abrir o navegador automaticamente:", err?.message);
    console.log("Abra manualmente:", URL);
  }
});
