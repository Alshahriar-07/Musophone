/** The site's own version, kept level with the Android release (v2.6). */
export const WEB_VERSION = '2.6';

/**
 * The official MusoPhone site. The Android download lives there, so every
 * "Get the Android app" link stays on the project's own domain instead of
 * sending people to a release page.
 */
export const WEBSITE_URL = 'https://musophone.vercel.app/';

/** Build-time configuration, from Vite's `VITE_*` environment variables. */
export const config = {
  /** Shown in the sidebar and on Settings, so the site and the app agree. */
  version: WEB_VERSION,
  /** Pinned in development by the manifest `key` (web/extension/wxt.config.ts). */
  chromiumExtensionId: import.meta.env.VITE_EXTENSION_ID_CHROMIUM || DEV_EXTENSION_ID,
  /** The unpacked development build's id, always tried as well. */
  devChromiumExtensionId: DEV_EXTENSION_ID,
  /** The extension packages (web/extension: `pnpm package` copies them into public/downloads). */
  extensionChromeUrl: import.meta.env.VITE_EXTENSION_CHROME_URL || '/downloads/musophone-extension-chrome.zip',
  extensionFirefoxUrl: import.meta.env.VITE_EXTENSION_FIREFOX_URL || '/downloads/musophone-extension-firefox.zip',
  /** The version the zips above hold, for the "update available" notice. */
  extensionManifestUrl: import.meta.env.VITE_EXTENSION_MANIFEST_URL || '/downloads/extension.json',
  androidAppUrl: WEBSITE_URL,
  /**
   * The Listen Together server and presence host. Production's default is in
   * app/.env.production; a Vercel project variable overrides it. Empty is
   * supported: Listen Together then asks for a server, and presence is off.
   */
  partyServerUrl: import.meta.env.VITE_PARTY_SERVER_URL ?? '',
} as const;
