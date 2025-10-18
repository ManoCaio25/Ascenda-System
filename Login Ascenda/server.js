import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST ?? '127.0.0.1';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
]);

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES.get(ext) ?? 'application/octet-stream';
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(__dirname, pathname);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acesso negado');
    return;
  }

  const data = await readFileSafe(filePath);

  if (!data) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Arquivo não encontrado');
    return;
  }

  res.writeHead(200, { 'Content-Type': getContentType(filePath) });
  res.end(data);
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error('Erro ao atender a requisição', error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erro interno do servidor');
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor disponível em http://${HOST}:${PORT}`);
});
