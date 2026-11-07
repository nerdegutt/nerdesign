// Local preview of a static site. Copy this file into a project
// (`cp ~/dev/nerdegutt/nerdesign/tools/dev-server.mjs .`) and run:
//
//   node dev-server.mjs            → http://127.0.0.1:3000
//   PORT=3111 node dev-server.mjs  → another port
//
// It serves `public/` when that directory exists, otherwise the project root.
// Only this Mac can reach it (127.0.0.1, not the network), and a path with a
// segment that starts with a dot (.env, .git/, .DS_Store) is never served.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const project = import.meta.dirname;
const root = existsSync(join(project, 'public')) ? join(project, 'public') : project;
const port = +(process.env.PORT || 3000);
const host = '127.0.0.1';

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.txt': 'text/plain',
};

createServer(async (req, res) => {
  try {
    const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (p.split('/').some((s) => s.startsWith('.'))) throw new Error('dotfile');
    const file = join(root, p);
    if (!file.startsWith(root)) throw new Error('outside root');
    const target = (await stat(file)).isDirectory() ? join(file, 'index.html') : file;
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
}).listen(port, host, () => console.log(`${root.split('/').slice(-2).join('/')} → http://${host}:${port}`));
