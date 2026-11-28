/** The web player's production origin, and the one the popup links to. */
export const PRODUCTION_ORIGIN = 'https://musophone.vercel.app';

/**
 * Every production address the site answers on. Vercel serves the project at
 * `musophone-web.vercel.app` as well as the canonical `musophone.vercel.app`,
 * and both are live; an install has to work on whichever one the user opens.
 * Leaving one out is not a degraded state — Chrome refuses to expose
 * `chrome.runtime` to the page at all, so the site reads "not installed".
 */
export const PRODUCTION_ORIGINS = ['https://musophone-web.vercel.app', PRODUCTION_ORIGIN] as const;

/**
 * The site's previous addresses. They stay trusted so extensions already
 * installed keep working on them (and on old bookmarks); `bitchord://` invites
 * and `bitchord:*` storage keys are kept for the same reason.
 */
const LEGACY_ORIGIN = 'https://bitchord.in';
const PAGES_ORIGIN = 'https://bitchord-8bw.pages.dev';

/**
 * The dev servers: Vite's own (web/app/vite.config.ts pins the port) and the
 * ports a preview or a Vercel local run listens on. `[::1]` is what some
 * browsers report for localhost; the explicit IPv4 spellings are listed
 * because the page's origin is compared exactly at runtime.
 */
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

/**
 * The web app origins this extension serves. Every message is checked against
 * this list, and it becomes externally_connectable (Chromium), the relay's
 * content-script matches (Firefox) and the DNR rules' initiatorDomains.
 *
 * The production origins the extension trusts always, and the dev server too
 * except in a store build (MUSOPHONE_STORE_BUILD=1), so a published extension
 * never answers a page on localhost. MUSOPHONE_SITE_ORIGINS (comma-separated)
 * replaces the list; the older BITCHORD_* names are still read, so an existing
 * deployment keeps building without changes. The first origin is the one the
 * popup and homepage_url link to.
 */
const env = (name: string, legacy: string) => process.env[name] ?? process.env[legacy];

export const SITE_ORIGINS: string[] = (
  env('MUSOPHONE_SITE_ORIGINS', 'BITCHORD_SITE_ORIGINS') ??
  [
    ...PRODUCTION_ORIGINS,
    LEGACY_ORIGIN,
    PAGES_ORIGIN,
    ...(env('MUSOPHONE_STORE_BUILD', 'BITCHORD_STORE_BUILD') === '1' ? [] : DEV_ORIGINS),
  ].join(',')
)
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

/**
 * Match patterns can't carry a port, so `http://localhost:5173` becomes
 * `http://localhost/*`. The exact origin, port included, is still enforced at
 * runtime against SITE_ORIGINS.
 */
export function matchPatternsFor(origins: string[]): string[] {
  return [...new Set(origins.map((o) => {
    const url = new URL(o);
    return `${url.protocol}//${url.hostname}/*`;
  }))];
}
