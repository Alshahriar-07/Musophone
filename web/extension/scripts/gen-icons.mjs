// Renders the extension's toolbar/store icons and the site's PWA icons from
// the project's official app icon (web/assets/icon.png). WXT picks up
// public/icon/<size>.png on its own. The
// PNGs are committed; run this again only when the official logo changes:
//
//   corepack pnpm --dir web/extension icons

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const png = readFileSync(new URL('../../assets/icon.png', import.meta.url));
const target = fileURLToPath(new URL('../public/icon/', import.meta.url));
mkdirSync(target, { recursive: true });

// resvg renders the official bitmap unchanged inside an SVG wrapper; only its
// size changes, so no part of the mark is redrawn.
const source = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><image width="1024" height="1024" href="data:image/png;base64,${png.toString('base64')}"/></svg>`;

for (const size of [16, 32, 48, 96, 128]) {
  const rendered = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(`${target}${size}.png`, rendered);
  console.log(`public/icon/${size}.png`);
}

// The site's own PWA and touch icons come from the same official file, so a
// browser tab, an installed app, a phone's home screen and the extension
// toolbar all show one mark. Apple's touch icon is 180.
const site = fileURLToPath(new URL('../../app/public/', import.meta.url));
for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  const rendered = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(`${site}${name}`, rendered);
  console.log(`app/public/${name}`);
}
