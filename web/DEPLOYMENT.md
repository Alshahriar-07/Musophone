# MusoPhone Web — Deployment

The web player is a Vite + React single-page app in `web/app`. The browser
extension in `web/extension` and the Android app are separate builds and are not
part of the Vercel deployment.

## Vercel project settings

Create the Vercel project from the repository root and set:

| Setting | Value |
| --- | --- |
| Root Directory | `web` |
| Framework Preset | Vite |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build:site` |
| Output Directory | `app/dist` |
| Node.js Version | 22 |

`web/vercel.json` already declares the install command, build command, output
directory, download headers and the SPA rewrite to `index.html`. The Root
Directory must still be set in the Vercel project because Vercel does not read
that setting from a `vercel.json` outside the selected root.

### Why the extension is built too

`pnpm build:site` builds the Chromium and Firefox extension targets, writes the
downloadable zips and `extension.json` into `app/public/downloads/`, then builds
the Web Player. Vercel has no browser-extension runtime, but it does serve those
static files: the Extension page's download links are real ZIPs, not the SPA's
`index.html`.

Downloaded files are matched by the `headers` block in `vercel.json`:
`Content-Type: application/zip` and `Content-Disposition: attachment` for the
zips, and `application/json` for `extension.json`. Without these, some hosts
serve a zip as `text/html`, and the browser saves an unopenable file. The SPA
rewrite still serves every application route; existing files take precedence
over it.

The workspace package is `@musophone/app`. A filter of `app` selects by package
name and would not match this workspace, which is why the root script is used.

## Party Server URL

Listen Together and the live-listener presence ping share one server:

```text
https://api.bitchord.kushagrasingh.in
```

That is the live production server documented in `backend/README.md` (Oracle
Cloud + Caddy). It answers `/healthz`, `/api/presence`, the party REST API and
the party WebSocket. The Android app's older
`https://bitchord-listen-together.onrender.com` default is also live, but its
CORS policy rejects the deployed web origin, so it must not be used for the
browser build.

### Default and override

`web/app/.env.production` sets the public production default:

```dotenv
VITE_PARTY_SERVER_URL=https://api.bitchord.kushagrasingh.in
```

Vite reads that file for every production build, including Vercel. No dashboard
variable is required for the canonical server.

To point a deployment at another party server, add a Vercel Project →
Settings → Environment Variables entry (Production and Preview as appropriate):

```text
VITE_PARTY_SERVER_URL=https://your-party-server.example
```

Redeploy after changing it; Vite inlines the value at build time.

The variable is optional. If it is missing, the app still builds and music,
authentication, search, lyrics, playlists and playback are unaffected.
Listen Together requires a server address in its own Settings, and the presence
ping is skipped. A production build never invents a fallback URL.

### Required backend allowlist

The Party Server only accepts browser requests from explicitly listed origins.
Add every deployed MusoPhone web origin to the server's
`JAM_ALLOWED_ORIGINS` environment variable, comma-separated, for example:

```dotenv
JAM_ALLOWED_ORIGINS=https://bitchord.in,https://bitchord-8bw.pages.dev,https://your-project.vercel.app
```

Restart the backend after changing it. Without this, Listen Together requests
and presence pings receive `403` from the server; ordinary playback is not
affected because it does not use the party server.

Use the final production domain, not only a Vercel preview URL. If preview
deployments need parties, add a stable preview alias or list each origin.

## Other build-time variables

All are optional and have working defaults:

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_EXTENSION_ID_CHROMIUM` | Chromium extension id for store builds | Pinned development id |
| `VITE_EXTENSION_CHROME_URL` | Chrome extension download link | `/downloads/musophone-extension-chrome.zip` |
| `VITE_EXTENSION_FIREFOX_URL` | Firefox extension download link | `/downloads/musophone-extension-firefox.zip` |
| `VITE_EXTENSION_MANIFEST_URL` | Extension version manifest | `/downloads/extension.json` |

Do not put secrets in any `VITE_*` variable: Vite embeds them in the client
bundle.

## Local verification

From `web/`:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm -r typecheck
corepack pnpm -r test
corepack pnpm build:site
```

The output is `web/app/dist`, including `downloads/*.zip`. The build does not
need `VITE_PARTY_SERVER_URL` on the command line because `.env.production`
supplies the canonical value. Run `corepack pnpm --dir web/extension icons` only
after the official icon changes; the PNGs are committed.

## Domain, canonical URL and social sharing

`web/app/index.html` sets the canonical URL and the Open Graph/Twitter URLs to
`https://musophone.vercel.app/`. On that domain nothing needs changing. On a
different domain, update the canonical link, the three Open Graph URLs, the
Twitter image and the `<loc>` entries in `app/public/sitemap.xml`; the social
card itself is `app/public/og-image.png` and is regenerated from
`web/scripts/brand/og-image.html` (see `web/README.md`, "Brand and assets").

The extension's default origins start with `https://musophone.vercel.app` and
keep the site's earlier addresses (`bitchord.in` and its pages.dev deploy) so
extensions already installed keep answering the player there too.
`MUSOPHONE_SITE_ORIGINS` replaces the list for another domain, and the legacy
`BITCHORD_SITE_ORIGINS` is still read.
