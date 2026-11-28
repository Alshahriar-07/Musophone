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
import { MiniPlayerWindow } from './MiniPlayerWindow';
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
    <div className="relative isolate flex h-full h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#000000]">
      {/* Spotify Desktop dark stage backdrop */}
      <div className="app-ambient" aria-hidden="true">
        <span className="app-ambient__light app-ambient__light--one" />
        <span className="app-ambient__light app-ambient__light--two" />
        <span className="app-ambient__light app-ambient__light--three" />
        <span className="app-ambient__beam" />
        <span className="app-ambient__vignette" />
      </div>

      {/* Main Desktop Grid: Sidebar + Scrollable View + Persistent Bottom Player Bar */}
      <div className="flex h-[calc(100%-84px)] min-h-0 w-full flex-1 overflow-hidden p-2 gap-2 max-sm:p-0 max-sm:gap-0 max-sm:h-[calc(100%-72px)]">
        <Sidebar />
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[8px] bg-[#121212] shadow-sm max-sm:rounded-none">
          <TopBar />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <main
              id="scrollable-page"
              className="content-veil absolute inset-0 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]"
            >
              <div
                key={pathname}
                className="animate-page min-h-full pb-8"
              >
                <Outlet />
              </div>
            </main>
            <SidePanel />
            {banner}
          </div>
        </div>
      </div>

      {/* Spotify-style persistent bottom playback bar */}
      <div className="relative z-(--z-web-chrome) h-[84px] w-full shrink-0 bg-[#000000] px-4 max-sm:h-[72px] max-sm:px-2">
        <PlayerBar />
      </div>
      <MiniPlayerWindow />
      {fullScreen && (
        <Suspense fallback={null}>
          <FullScreenPlayer />
        </Suspense>
      )}
    </div>
  );
}
