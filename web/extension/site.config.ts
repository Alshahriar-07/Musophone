/** The web player's production origin, and the one the popup links to. */
export const PRODUCTION_ORIGIN = 'https://musophone.vercel.app';

/**
 * The site's previous addresses. They stay trusted so extensions already
 * installed keep working on them (and on old bookmarks); `bitchord://` invites
 * and `bitchord:*` storage keys are kept for the same reason.
 */
const LEGACY_ORIGIN = 'https://bitchord.in';
const PAGES_ORIGIN = 'https://bitchord-8bw.pages.dev';

/** The Vite dev server (web/app/vite.config.ts pins the port). */
const DEV_ORIGIN = 'http://localhost:5173';

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
    PRODUCTION_ORIGIN,
    LEGACY_ORIGIN,
    PAGES_ORIGIN,
    ...(env('MUSOPHONE_STORE_BUILD', 'BITCHORD_STORE_BUILD') === '1' ? [] : [DEV_ORIGIN]),
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
