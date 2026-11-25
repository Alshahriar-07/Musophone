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
| Build Command | `pnpm --filter @bitchord/app build` |
| Output Directory | `app/dist` |
| Node.js Version | 22 |

`web/vercel.json` already declares the install command, build command, output
directory and the SPA rewrite to `index.html`. The Root Directory must still be
set in the Vercel project because Vercel does not read that setting from a
`vercel.json` outside the selected root.

The package is named `@bitchord/app`, so the build filter is
`pnpm --filter @bitchord/app build`. A filter of `app` selects by package name
and would not match this workspace.

### Why only the app is built

`pnpm --filter @bitchord/app build` runs TypeScript and Vite for the Web Player
only. It does not build Chrome or Firefox extension targets, and Vercel has no
browser-extension runtime.

If the Extension page must offer downloadable zips, use
`pnpm build:site` instead (it packages the extension first and copies the zips
into `app/public/downloads/`). That is a separate product decision; the default
Vercel configuration intentionally deploys only the Web Player.

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
| `VITE_ANDROID_APP_URL` | Mobile Android download banner target | GitHub latest release |
| `VITE_EXTENSION_CHROME_URL` | Chrome extension download link | `/downloads/bitchord-extension-chrome.zip` |
| `VITE_EXTENSION_FIREFOX_URL` | Firefox extension download link | `/downloads/bitchord-extension-firefox.zip` |
| `VITE_EXTENSION_MANIFEST_URL` | Extension version manifest | `/downloads/extension.json` |

Do not put secrets in any `VITE_*` variable: Vite embeds them in the client
bundle.

## Local verification

From `web/`:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm --filter @bitchord/app typecheck
corepack pnpm --filter @bitchord/app test
corepack pnpm --filter @bitchord/app build
```

The output is `web/app/dist`. The build does not need
`VITE_PARTY_SERVER_URL` on the command line because `.env.production` supplies
the canonical value.
