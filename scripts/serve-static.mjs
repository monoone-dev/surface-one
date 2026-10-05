// A dependency-free static server for the built site (clean URLs → index.html,
// unknown paths → 404.html), used by the Playwright accessibility run.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "dist/docs/browser");
const port = Number(process.argv[3] ?? 4310);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let path = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!path.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(path) && statSync(path).isDirectory())
    path = join(path, "index.html");
  let status = 200;
  if (!existsSync(path)) {
    status = 404;
    path = join(root, "404.html");
  }
  res.writeHead(status, {
    "content-type": TYPES[extname(path)] ?? "application/octet-stream",
  });
  createReadStream(path).pipe(res);
}).listen(port, "127.0.0.1", () =>
  console.log(`serving ${root} on http://127.0.0.1:${port}`),
);
