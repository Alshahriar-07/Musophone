import { lazy, Suspense } from 'react';
import { useUi } from '@/state/ui';
import { UpNext } from './UpNext';

// am-lyrics is large; it loads the first time the panel opens (prompt §3).
const LyricsPanel = lazy(() => import('./LyricsPanel').then((m) => ({ default: m.LyricsPanel })));

/**
 * Up Next / Lyrics: a glass tray floating over the sheet, inset from its edges
 * rather than flush against them. Hidden under the full-screen player, which
 * has its own lyrics.
 */
export function SidePanel() {
  const panel = useUi((s) => s.sidePanel);
  const fullScreen = useUi((s) => s.fullScreen);
  if (!panel || fullScreen) return null;

  return (
    <aside
      className="glass-material absolute inset-y-2 right-2 z-(--z-web-chrome) flex w-(--side-panel-width) animate-slide-in flex-col overflow-hidden rounded-[24px] max-sm:inset-x-1 max-sm:inset-y-1 max-sm:w-auto"
      aria-label={panel === 'up-next' ? 'Up Next' : 'Lyrics'}
    >
      {panel === 'up-next' ? (
        <UpNext />
      ) : (
        <Suspense fallback={null}>
          <LyricsPanel />
        </Suspense>
      )}
    </aside>
  );
}
