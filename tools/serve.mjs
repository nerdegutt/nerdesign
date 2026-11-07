// Tiny static server for tests and local preview: serves the repo root so
// site/ and examples/ resolve their relative paths (../dist/nd.css).
//   node tools/serve.mjs [port]   → http://127.0.0.1:4173/site/index.html
// Only this Mac can reach it (127.0.0.1), and dotfiles (.git/, .env) are never served.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = +(process.argv[2] || 4173);
const host = '127.0.0.1';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (p.split('/').some((s) => s.startsWith('.'))) throw new Error('dotfile');
    if (p.endsWith('/')) p += 'index.html';
    const file = join(root, p);
    if (!file.startsWith(root)) throw new Error('outside root');
    if ((await stat(file)).isDirectory()) { res.writeHead(301, { Location: p + '/' }); return res.end(); }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(port, host, () => console.log(`serving ${root} at http://${host}:${port}/site/`));
