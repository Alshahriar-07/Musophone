// Renders the extension's toolbar and store icons from the site's app icon
// (web/app/public/favicon.svg), so both carry the same MusoPhone mark. WXT
// picks up public/icon/<size>.png on its own. The PNGs are committed; run this
// again only when the logo changes:
//
//   corepack pnpm --dir web/extension icons

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const source = readFileSync(new URL('../../app/public/favicon.svg', import.meta.url), 'utf8');
const target = fileURLToPath(new URL('../public/icon/', import.meta.url));
mkdirSync(target, { recursive: true });

for (const size of [16, 32, 48, 96, 128]) {
  const png = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(`${target}${size}.png`, png);
  console.log(`public/icon/${size}.png`);
}

// The site's own PWA and touch icons come from the same file, so a browser
// tab, an installed app, a phone's home screen and the extension toolbar all
// show one mark. Apple's touch icon is 180.
const site = fileURLToPath(new URL('../../app/public/', import.meta.url));
for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  const png = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(`${site}${name}`, png);
  console.log(`app/public/${name}`);
}
