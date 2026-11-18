// Local preview of the demo. Run: node demo/serve.js
//   http://127.0.0.1:5174        the demo
//   http://127.0.0.1:5174/phone  phone (390px) and tablet (900px) side by side
// It rebuilds on every page load, so edits in demo/src show up on refresh.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = __dirname;
const TYPES = { '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u.startsWith('/img/')) {
    const p = path.join(dir, 'img', path.basename(u));
    if (!fs.existsSync(p)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
    res.end(fs.readFileSync(p));
    return;
  }
  if (u.startsWith('/phone')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><body style="margin:0;background:#888;display:flex;gap:16px;padding:8px">' +
      '<iframe src="/" style="width:390px;height:780px;border:0;background:#fff"></iframe>' +
      '<iframe src="/" style="width:900px;height:780px;border:0;background:#fff"></iframe></body>');
    return;
  }
  try {
    execFileSync(process.execPath, [path.join(dir, 'build.js')], { stdio: 'pipe' });
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Build failed:\n' + (e.stderr || e.message));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(fs.readFileSync(path.join(dir, 'index.html')));
}).listen(5174, '127.0.0.1', () => console.log('serving on http://127.0.0.1:5174  (phone + tablet: /phone)'));
