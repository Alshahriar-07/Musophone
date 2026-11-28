import { ArrowUpRight, Maximize2, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Artwork } from '@/components/music/Artwork';
import { ExplicitBadge } from '@/components/music/ExplicitBadge';
import { useMiniPlayer } from '@/state/miniPlayer';
import { usePlayer } from '@/state/player';
import { useScrubber } from '@/shell/useScrubber';

/**
 * Windows Desktop Floating Mini Player:
 * - Real desktop-grade floating window appearance
 * - Translucent Regular Liquid Glass styling
 * - Always visible, draggable, bounds-checked
 * - Controls: Play/Pause, Next/Prev, Progress bar, Restore main window, Close mini-player
 */
export function MiniPlayerWindow() {
  const { enabled, active, position, setActive, setPosition } = useMiniPlayer();
  const nowPlaying = usePlayer((s) => s.nowPlaying);
  const status = usePlayer((s) => s.status);
  const hasTrack = nowPlaying !== null;
  const playing = status === 'playing' || status === 'buffering';
  const { togglePlay, next, previous } = usePlayer.getState();
  const { bar, elapsed, remaining, handlers } = useScrubber();

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState(() => position ?? { x: window.innerWidth - 360, y: window.innerHeight - 150 });

  // Update bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => ({
        x: Math.max(16, Math.min(prev.x, window.innerWidth - 350)),
        y: Math.max(16, Math.min(prev.y, window.innerHeight - 120)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, [data-scrubber]')) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = Math.max(12, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 350));
    const newY = Math.max(12, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 120));
    const newPos = { x: newX, y: newY };
    setPos(newPos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    setPosition(pos);
  };

  // Only render when enabled and active (or triggered via desktop minimize)
  if (!enabled || !active || !hasTrack) return null;

  return (
    <div
      tabIndex={-1}
      role="dialog"
      aria-label="MusoPhone Mini Player"
      className="fixed z-[10000] select-none flex w-[330px] flex-col overflow-hidden rounded-[14px] bg-[#14151a]/85 p-3 text-white backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow duration-200"
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Top Header Row: Drag indicator, Restore App, Close Mini Player */}
      <div className="flex items-center justify-between pb-1 text-[#727272]">
        <div className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing">
          <span className="size-2 rounded-full bg-key" />
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#a4a4a4]">Mini Player</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="grid size-6 place-items-center rounded-full hover:bg-white/10 hover:text-white transition-colors"
            title="Restore MusoPhone"
            aria-label="Restore MusoPhone"
            onClick={() => setActive(false)}
          >
            <Maximize2 size={12} />
          </button>
          <button
            type="button"
            className="grid size-6 place-items-center rounded-full hover:bg-white/10 hover:text-white transition-colors"
            title="Hide Mini Player (Music keeps playing)"
            aria-label="Hide Mini Player"
            onClick={() => setActive(false)}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Main Track & Controls Area */}
      <div className="flex items-center gap-3 pt-1">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-[8px] bg-[#222] shadow-md">
          <Artwork src={nowPlaying.artworkUrl} displayWidth={48} className="size-full object-cover" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="truncate text-[13.5px] font-bold text-white">{nowPlaying.title}</span>
          <span className="truncate text-[11.5px] text-[#b3b3b3]">{nowPlaying.artist}</span>
        </div>

        {/* Transport buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="grid size-7 place-items-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Previous track"
            onClick={previous}
          >
            <SkipBack size={15} />
          </button>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform shadow-sm"
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={togglePlay}
          >
            {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button
            type="button"
            className="grid size-7 place-items-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Next track"
            onClick={next}
          >
            <SkipForward size={15} />
          </button>
        </div>
      </div>

      {/* Seek Progress Bar */}
      <div className="flex items-center gap-2 pt-2.5">
        <span ref={elapsed} className="w-7 text-right text-[10px] tabular-nums text-[#727272]">
          0:00
        </span>
        <div
          className="relative flex h-2.5 flex-1 cursor-pointer touch-none items-center"
          data-scrubber
          {...handlers}
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              ref={bar}
              className="relative size-full origin-left scale-x-(--progress) rounded-full bg-key transition-colors [--progress:0]"
            />
          </div>
        </div>
        <span ref={remaining} className="w-7 text-left text-[10px] tabular-nums text-[#727272]">
          0:00
        </span>
      </div>
    </div>
  );
}
