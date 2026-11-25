import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('app');
const pages = ['index.html', 'launch/index.html', 'registry/index.html', 'bonds/index.html', 'docs/index.html'];
const image = 'https://dellmodrun.github.io/v2-nonce/v2nonce.png';

for (const page of pages) {
  const file = path.join(root, page);
  let html = fs.readFileSync(file, 'utf8');
  html = html
    .replaceAll('<title>v2</title>', '<title>v2/nonce — launch coin</title>')
    .replaceAll('content="v2"', 'content="v2/nonce launch coin"')
    .replaceAll('href="/favicon.png"', 'href="/v2-nonce/v2nonce.png"')
    .replaceAll('src="/assets/', 'src="/v2-nonce/app/assets/')
    .replaceAll('href="/assets/', 'href="/v2-nonce/app/assets/')
    .replace(/<script defer src="\/~flock\.js"[\s\S]*?<\/script><script defer src="\/__l5e\/[\s\S]*?<\/script>/, '')
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${image}">`)
    .replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${image}">`);
  if (!html.includes('/v2-nonce/app/assets/') || html.includes('src="/assets/') || html.includes('/~flock.js')) {
    throw new Error(`App asset paths were not prepared: ${page}`);
  }
  fs.writeFileSync(file, html);
}

const bundle = path.join(root, 'assets/index-RIUbksyq.js');
let javascript = fs.readFileSync(bundle, 'utf8');
const oldRouter = 'x.jsx(SB,{children:x.jsxs(gB,{children:[';
const newRouter = 'x.jsx(SB,{basename:"/v2-nonce/app",children:x.jsxs(gB,{children:[';
if (!javascript.includes(oldRouter)) throw new Error('App router entry not found');
javascript = javascript.replace(oldRouter, newRouter);
javascript = javascript.replace('href:"/",className:"text-blue-500 underline hover:text-blue-700"', 'href:"/v2-nonce/app/",className:"text-blue-500 underline hover:text-blue-700"');
fs.writeFileSync(bundle, javascript);

console.log(`Prepared ${pages.length} pages and the app router for /v2-nonce/app/`);
