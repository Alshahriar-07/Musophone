# MusoPhone Web

The MusoPhone web player and its companion browser extension — the browser
half of the v2.5 release. The plan, and the decisions behind it, are in
[`docs/web-app-build-prompt.md`](../docs/web-app-build-prompt.md).

| Package | What it is |
|---|---|
| `app/` | The site: Vite, React 19, TypeScript, React Router, TanStack Query, Zustand, Tailwind CSS v4 |
| `extension/` | Manifest V3 extension for Chromium and Firefox, built with WXT |
| `shared/` | The page ↔ extension bridge contract and client, used by both |
| `docs/` | `apple-music-dom.md` (the design measurements), `kira-notes.md` (how the reference YouTube web client plays), `youtube-playback.md`, `youtube-signin.md`, `queue-and-player.md`, `lyrics.md`, `spotify-and-discord.md` |
| `fixtures/` | Real captured responses for parser tests (see its README) |
| `scripts/` | `capture-fixtures.mjs`, and `scripts/brand/` for the site's social card |

## Setup

Node 22 or newer. pnpm comes through corepack, so nothing needs a global install:

```bash
corepack pnpm --dir web install
```

## Run the site

```bash
corepack pnpm --dir web/app dev
```

It serves on `http://localhost:5173`, and only there (`strictPort`): the extension trusts that exact origin.

## Run the extension

Build both targets:

```bash
corepack pnpm --dir web/extension build
```

- **Chrome, Edge, Brave:** `chrome://extensions` → Developer mode → *Load unpacked* → `web/extension/.output/chrome-mv3`. The id is always `pkddffeebcmhhanjcigilehaeonkkfih`, pinned by the manifest `key` (`extension/dev-key/`), so the site finds it without configuration.
- **Firefox:** `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on* → `web/extension/.output/firefox-mv3/manifest.json`.

To offer the extension as a download from the site's Extension page, package it:

```bash
corepack pnpm --dir web/extension package
```

This builds both targets and writes to `app/public/downloads/` (git-ignored):

- `musophone-extension-<browser> (<version>).zip`, named for this build, plus a copy at the stable `musophone-extension-<browser>.zip` the page falls back to. Each holds a single folder (`musophone-extension-<browser> (<version>)/`), so extracting it in place leaves one folder to load unpacked.
- The previous version's zips are removed, so the folder never holds two builds.
- `extension.json`, with the version. The site compares it with the installed extension's version and shows **Update** in the sidebar and an update row on the Extension page when the zip is newer. Bump `version` in `extension/package.json` to publish an update.

`VITE_EXTENSION_CHROME_URL`, `VITE_EXTENSION_FIREFOX_URL` and `VITE_EXTENSION_MANIFEST_URL` override those links, for example to point at store listings.

### Distributable zip

`extension.zip` at the root of `web/` is the Chromium build packaged as one
archive: the built MV3 files sit at the zip root, with `manifest.json` at the
top level, so it can be uploaded to a store or extracted and loaded unpacked.
`release/extension.zip` is the same file, kept with the release artifacts.
Rebuild the extension before repacking so the archive matches the sources:

```bash
corepack pnpm --dir web/extension build
```

## Brand and assets

Everything the site shows as MusoPhone is one set, sourced from one mark:

| Asset | File | Made from |
|---|---|---|
| Header / sidebar mark | `app/src/assets/logo-mark.svg` | The waveform-M, drawn with `currentColor` |
| Favicon and app tile | `app/public/favicon.svg` | The same M on an AMOLED-black rounded tile |
| PWA and touch icons | `app/public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Rendered from `favicon.svg` |
| Extension toolbar icons | `extension/public/icon/{16,32,48,96,128}.png` | The same, for either browser |
| Social card | `app/public/og-image.png` | `scripts/brand/og-image.html` |
| Colours and type | `app/src/styles/tokens.css`, `global.css` | The MusoPhone palette: true black, neutral charcoal surfaces, crimson accent |
| Full-resolution originals | `assets/` | The app icon, Windows icon, wordmark and both promotional banners |

Regenerate the raster icons after changing `favicon.svg`:

```bash
corepack pnpm --dir web/extension icons
```

Regenerate the social card (1200 × 630), from `web/`:

```bash
chrome --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --screenshot=app/public/og-image.png \
  scripts/brand/og-image.html
```

There is no BitChord artwork left in the site: the old crescent mark, the
red-gradient favicon and the toolbar PNGs made from it are replaced by the
files above, and the page sets them in `index.html`.

### Metadata and sharing

`app/index.html` carries the page title, description, canonical URL, Open
Graph and Twitter cards, `theme-color`, the manifest link and JSON-LD for the
application. `app/public/site.webmanifest` declares the installable web app;
`robots.txt` and `sitemap.xml` sit beside it. The canonical and share URLs use
`https://musophone.vercel.app/`; a deployment on another domain should change
the five URLs in `index.html` and the sitemap.

## Configuration

| Variable | Where | Default |
|---|---|---|
| `MUSOPHONE_SITE_ORIGINS` | extension build | `https://musophone.vercel.app,https://bitchord.in,https://bitchord-8bw.pages.dev,http://localhost:5173` (store builds leave out localhost). Comma-separated origins the extension serves; the first is the popup's link. Replaces the default. The older `BITCHORD_SITE_ORIGINS` is still read |
| `MUSOPHONE_STORE_BUILD=1` | extension build | Leaves out the dev `key` for a Chrome Web Store upload. `BITCHORD_STORE_BUILD` still works |
| `VITE_EXTENSION_ID_CHROMIUM` | app (`app/.env.local`) | The pinned dev id. Set it for a store-built extension |
| `VITE_ANDROID_APP_URL` | app | The MusoPhone GitHub releases page |
| `VITE_PARTY_SERVER_URL` | app (`app/.env.local`, Pages env) | None. The Listen Together server; `vite build` fails without it |

Some identifiers deliberately keep their old names because changing them would
break working installs: the `bitchord://party/<CODE>` invite scheme (shared
with the Android app), the extension's Firefox add-on id, its trusted
production origins, and the `bitchord:*` `localStorage` keys that hold an
existing listener's settings. They are protocol and storage names, not
branding, and none of them is shown on screen.

## Deploy (Vercel)

`web/vercel.json` declares the install command, the build command
(`pnpm --filter @musophone/app build`), the output directory and the SPA
rewrite. Set the project's Root Directory to `web`; Vercel does not read that
from a `vercel.json` outside the selected root. See
[`DEPLOYMENT.md`](DEPLOYMENT.md) for the full settings, the party server
allowlist and the environment variables.

## Deploy (Cloudflare Pages)

| Setting | Value |
| --- | --- |
| Root directory | `web` |
| Build command | `pnpm build:site` |
| Output directory | `app/dist` |
| Environment | `NODE_VERSION=22`, `VITE_PARTY_SERVER_URL` |

`build:site` packages the extension first, so each deploy publishes the zips and `downloads/extension.json` with the version from `web/extension/package.json`. The Extension page polls that file and offers the update when it's newer than the installed one. Bump that version to make an update show.

## Checks

```bash
corepack pnpm --dir web -r typecheck
corepack pnpm --dir web -r test
corepack pnpm --dir web/app build
```
