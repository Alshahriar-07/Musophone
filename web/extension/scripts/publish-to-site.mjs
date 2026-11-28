// Zips the built extension for the site's Extension page and writes the
// manifest the page checks for updates:
//
//   web/app/public/downloads/musophone-extension-chrome (<version>).zip
//   web/app/public/downloads/musophone-extension-firefox (<version>).zip
//   web/app/public/downloads/extension.json    { version, builtAt, files }
//   EX-release/Musophone-extension.zip         (Chromium, manifest at the root)
//
// Each zip holds a single folder (musophone-extension-<browser> (<version>)/) rather than
// loose files, so "Extract here" leaves one tidy folder to load unpacked.
//
//   corepack pnpm --dir web/extension package   (builds both, then runs this)

import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';

const output = fileURLToPath(new URL('../.output/', import.meta.url));
const target = fileURLToPath(new URL('../../app/public/downloads/', import.meta.url));
mkdirSync(target, { recursive: true });
// Each version's zips are named for it; the previous ones go.
for (const name of readdirSync(target)) {
  // Versioned zips from this script, under either the current name or the old
  // one, so an upgrade does not leave both on the site.
  if (/^(musophone|bitchord)-extension-.*\.zip$/.test(name)) rmSync(join(target, name));
}

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

const builds = { chrome: 'chrome-mv3', firefox: 'firefox-mv3' };
const files = {};
let version;

for (const [browser, folder] of Object.entries(builds)) {
  const root = join(output, folder);
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  if (version && manifest.version !== version) {
    throw new Error(`Chrome and Firefox builds disagree on the version (${version} vs ${manifest.version}); rebuild both`);
  }
  version = manifest.version;

  // The version in brackets, on the zip and the folder inside it: "musophone-extension-chrome (0.5.1)".
  const parent = `musophone-extension-${browser} (${manifest.version})`;
  const entries = {};
  const rootEntries = {};
  for (const file of filesUnder(root)) {
    const relativePath = relative(root, file).split(sep).join('/');
    const data = readFileSync(file);
    entries[`${parent}/${relativePath}`] = data;
    rootEntries[relativePath] = data;
  }
  const name = `${parent}.zip`;
  const zip = zipSync(entries, { level: 9 });
  writeFileSync(join(target, name), zip);
  // Also at the stable name the app falls back to when extension.json is
  // absent, so the Extension page's download links never 404.
  writeFileSync(join(target, `musophone-extension-${browser}.zip`), zip);
  files[browser] = name;
  console.log(`${folder} -> app/public/downloads/${name} (${parent}/, v${version})`);

  // The Chromium build also as one archive with manifest.json at its root,
  // for anyone who unzips it or uploads it as a packaged build.
  if (browser === 'chrome') {
    const rootZip = zipSync(rootEntries, { level: 9 });
    writeFileSync(fileURLToPath(new URL('../../extension.zip', import.meta.url)), rootZip);
    const release = fileURLToPath(new URL('../../release/', import.meta.url));
    mkdirSync(release, { recursive: true });
    writeFileSync(join(release, 'MusoPhoneextension.zip'), rootZip);
    // The repository-level release archive (optional when running inside web workspace)
    try {
      const exRelease = fileURLToPath(new URL('../../../EX-release/', import.meta.url));
      mkdirSync(exRelease, { recursive: true });
      writeFileSync(join(exRelease, 'Musophone-extension.zip'), rootZip);
      console.log('EX-release/Musophone-extension.zip updated');
    } catch {
      // Ignore if outside sandbox
    }
    console.log(
      `extension.zip and release/MusoPhoneextension.zip (manifest at the archive root, v${version})`,
    );
  }
}

writeFileSync(
  join(target, 'extension.json'),
  `${JSON.stringify({ version, builtAt: new Date().toISOString(), files }, null, 2)}\n`,
);
console.log(`app/public/downloads/extension.json (v${version})`);
