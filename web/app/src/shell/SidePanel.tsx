import { lazy, Suspense } from 'react';
import { useUi } from '@/state/ui';
import { UpNext } from './UpNext';
import { LyricsSkeleton } from './LyricsPanel';

// am-lyrics is large; it loads the first time the panel opens.
const LyricsPanel = lazy(() => import('./LyricsPanel').then((m) => ({ default: m.LyricsPanel })));

/**
 * Up Next / Lyrics: a refined glass tray floating over the page sheet with Spotify-inspired borders and blur.
 * Hidden under the full-screen player, which has its own full-screen lyrics layout.
 */
export function SidePanel() {
  const panel = useUi((s) => s.sidePanel);
  const fullScreen = useUi((s) => s.fullScreen);
  if (!panel || fullScreen) return null;

  return (
    <aside
      className="absolute inset-y-2 right-2 z-(--z-web-chrome) flex w-(--side-panel-width) animate-slide-in flex-col overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#121212]/95 backdrop-blur-2xl shadow-2xl max-sm:inset-x-1 max-sm:inset-y-1 max-sm:w-auto"
      aria-label={panel === 'up-next' ? 'Up Next' : 'Lyrics'}
    >
      {panel === 'up-next' ? (
        <UpNext />
      ) : (
        <Suspense fallback={<LyricsSkeleton />}>
          <LyricsPanel />
        </Suspense>
      )}
    </aside>
  );
}
