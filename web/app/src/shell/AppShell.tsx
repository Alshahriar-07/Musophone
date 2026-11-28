import { lazy, Suspense, useEffect } from 'react';
import { resumeSession } from '@/party/listenTogether';
import { startPartySync } from '@/party/partySync';
import { useDiscordPresence } from '@/playback/discordPresence';
import { startHistoryReporting } from '@/playback/historyReporting';
import { startLivePresence } from '@/playback/livePresence';
import { Outlet, useLocation } from 'react-router';
import { PrefetchLink } from '@/components/PrefetchLink';
import { config } from '@/config';
import { useExtension } from '@/extension/useExtension';
import { isMobileBrowser } from '@/lib/platform';
import { useUi } from '@/state/ui';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { Banner, bannerButtonClass } from './Banner';
import { pageTitleFor } from './TopBar';
import { PlayerBar } from './PlayerBar';
import { SidePanel } from './SidePanel';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const mobile = isMobileBrowser();

// It carries am-lyrics; loaded the first time it opens, as the side panel's lyrics are.
const FullScreenPlayer = lazy(() => import('./FullScreenPlayer').then((m) => ({ default: m.FullScreenPlayer })));

/**
 * The document title follows the page, so tabs, history and shared links read
 * as MusoPhone pages rather than as one undifferentiated app.
 */
function useDocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = pageTitleFor(pathname);
    document.title = page ? `${page} · MusoPhone` : 'MusoPhone — Premium music, uninterrupted';
  }, [pathname]);
}

/**
 * The app frame: full-bleed artwork behind a glass rail attached to the left
 * edge, the command bar, and the page filling the rest of the window. The
 * content column takes back whatever the rail's collapsed state frees; the
 * player dock floats over the page's foot and Up Next / Lyrics over its edge.
 */
export function AppShell() {
  useDocumentTitle();
  const { pathname } = useLocation();
  useKeyboardShortcuts();
  useDiscordPresence();
  // Listen Together: pick a party back up after a reload, and keep the player in step with it.
  useEffect(() => {
    resumeSession();
    return startPartySync();
  }, []);
  // Plays into the account's YouTube Music history (Settings › Share Listening Activity).
  useEffect(() => startHistoryReporting(), []);
  // Counts this tab in the "listening now" figure beside the phone and PC apps.
  useEffect(() => startLivePresence(), []);
  const extension = useExtension();
  const bannerDismissed = useUi((s) => s.installBannerDismissed);
  const dismissBanner = useUi((s) => s.dismissInstallBanner);
  const fullScreen = useUi((s) => s.fullScreen);

  let banner = null;
  if (mobile) {
    banner = (
      <Banner
        title="MusoPhone is better in the app."
        detail="Phone browsers can’t run the MusoPhone extension. The Android app has everything."
        action={
          <a className={bannerButtonClass} href={config.androidAppUrl} target="_blank" rel="noreferrer">
            Get the App
          </a>
        }
      />
    );
  } else if (extension.state === 'missing' && !bannerDismissed) {
    banner = (
      <Banner
        title="Play YouTube Music with the extension."
        detail="Playback, YouTube Music sign-in, Spotify and Discord need it. Addons and lyrics work without it."
        action={
          <PrefetchLink className={bannerButtonClass} to="/extension">
            Get the Extension
          </PrefetchLink>
        }
        onDismiss={dismissBanner}
      />
    );
  }

  return (
    <div className="relative isolate flex h-full h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden">
      {/* The light field the glass refracts: three drifting lights and a beam. */}
      <div className="app-ambient" aria-hidden="true">
        <span className="app-ambient__light app-ambient__light--one" />
        <span className="app-ambient__light app-ambient__light--two" />
        <span className="app-ambient__light app-ambient__light--three" />
        <span className="app-ambient__beam" />
        <span className="app-ambient__vignette" />
      </div>

      <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
        <Sidebar />
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <main
              id="scrollable-page"
              className="content-veil absolute inset-0 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]"
            >
              {/* Clears the floating dock: its height, its offset, and safe margin. */}
              <div
                key={pathname}
                className="animate-page min-h-full pb-[calc(var(--player-pill-height)+max(var(--shell-inset),env(safe-area-inset-bottom,12px))+96px)]"
              >
                <Outlet />
              </div>
            </main>
            <PlayerBar />
            <SidePanel />
            {banner}
          </div>
        </div>
      </div>
      {fullScreen && (
        <Suspense fallback={null}>
          <FullScreenPlayer />
        </Suspense>
      )}
    </div>
  );
}
