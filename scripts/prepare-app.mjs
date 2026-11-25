import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('app');
const pages = ['index.html', 'launch/index.html', 'registry/index.html', 'bonds/index.html', 'docs/index.html'];
const image = 'https://v2nonce.run/v2nonce.png';

for (const page of pages) {
  const file = path.join(root, page);
  const isRoot = page === 'index.html';
  const assetPrefix = isRoot ? './assets/' : '../assets/';
  const faviconPath = isRoot ? '../v2nonce.png' : '../../v2nonce.png';
  let html = fs.readFileSync(file, 'utf8');
  html = html
    .replaceAll('<title>v2</title>', '<title>v2/nonce — launch coin</title>')
    .replaceAll('content="v2"', 'content="v2/nonce launch coin"')
    .replaceAll('href="/favicon.png"', `href="${faviconPath}"`)
    .replaceAll('src="/assets/', `src="${assetPrefix}`)
    .replaceAll('href="/assets/', `href="${assetPrefix}`)
    .replace(/<script defer src="\/~flock\.js"[\s\S]*?<\/script><script defer src="\/__l5e\/[\s\S]*?<\/script>/, '')
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${image}">`)
    .replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${image}">`);
  if (!html.includes(assetPrefix) || html.includes('src="/assets/') || html.includes('/~flock.js')) {
    throw new Error(`App asset paths were not prepared: ${page}`);
  }
  fs.writeFileSync(file, html);
}

const bundle = path.join(root, 'assets/index-RIUbksyq.js');
let javascript = fs.readFileSync(bundle, 'utf8');
const oldRouter = 'x.jsx(SB,{children:x.jsxs(gB,{children:[';
const newRouter = 'x.jsx(SB,{basename:location.hostname==="dellmodrun.github.io"?"/v2-nonce/app":"/app",children:x.jsxs(gB,{children:[';
if (!javascript.includes(oldRouter)) throw new Error('App router entry not found');
javascript = javascript.replace(oldRouter, newRouter);
javascript = javascript.replace('href:"/",className:"text-blue-500 underline hover:text-blue-700"', 'href:location.hostname==="dellmodrun.github.io"?"/v2-nonce/app/":"/app/",className:"text-blue-500 underline hover:text-blue-700"');
fs.writeFileSync(bundle, javascript);

console.log(`Prepared ${pages.length} pages for GitHub Pages and the custom domain`);
