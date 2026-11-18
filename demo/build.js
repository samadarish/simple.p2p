// Builds the demo from demo/src into two files:
//   demo/index.html          full page: open it straight in a browser
//   demo/simple-p2p-demo.html page body only: the file published as the Artifact
// Run: node demo/build.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = __dirname;
const src = path.join(dir, 'src');
const read = f => fs.readFileSync(path.join(src, f), 'utf8');

// Order matters: CSS and markup first, then scripts (each script can use what came before it).
const HTML = ['p1-head.html', 'p2-css.html', 'p2b-css.html', 'p3-shell.html'];
const JS = ['j1-data.js', 'j2-shell.js', 'j3-list.js', 'j4-trade.js', 'j5-order.js', 'j6-ads.js', 'j7-wallet.js',
  'j8-account.js', 'j9-help.js', 'j10-market.js', 'j11-admin.js', 'j12-telegram.js', 'j13-modals.js', 'j14-actions.js'];

const js = '(function(){\n' + JS.map(read).join('\n') + '\n})();\n';
new vm.Script(js, { filename: 'demo-app.js' }); // throws on a syntax error, so a broken build never gets written

const body = HTML.map(read).join('\n') + '\n<script>\n' + js + '</script>\n';
fs.writeFileSync(path.join(dir, 'simple-p2p-demo.html'), body);

// Same base styles the Artifact host wraps around the page, so both look identical.
const page = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
  '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}' +
  'body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}' +
  '[hidden]:not([hidden=until-found i]){display:none!important}</style>\n</head><body>\n' + body + '</body></html>\n';
fs.writeFileSync(path.join(dir, 'index.html'), page);

console.log('built demo/index.html (' + Math.round(page.length / 1024) + ' KB) and demo/simple-p2p-demo.html');
