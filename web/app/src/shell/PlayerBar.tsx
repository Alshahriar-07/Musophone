import { Maximize2 } from 'lucide-react';
import { useState } from 'react';
import {
  BackwardIcon,
  ForwardIcon,
  LyricsActiveIcon,
  LyricsIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
  UpNextIcon,
} from '@/components/icons/Transport';
import { FavoriteButton } from '@/components/music/FavoriteButton';
import { TrackMenu } from '@/components/music/TrackMenu';
import { usePlayer } from '@/state/player';
import { useUi } from '@/state/ui';
import { Lcd } from './Lcd';
import { MixWindowHighlight } from './NerdStats';
import { useScrubber } from './useScrubber';
import { fadeForVolume, VolumeControl } from './VolumeControl';

const control =
  'grid place-items-center rounded-[11px] text-secondary transition-[color,background-color,transform] duration-(--duration-fast) hover:bg-quinary hover:text-primary active:scale-95 disabled:opacity-35 disabled:hover:bg-transparent';
// Shuffle and repeat: secondary, and the key colour when on, as Apple's toggles.
const toggle = `${control} size-8 aria-pressed:text-key`;
const transport = `${control} size-9 text-primary`;
const action = `${control} size-8 aria-pressed:text-key`;
// The actions the volume level slides in over: they fade out while it's open.
const fading = `${action} ${fadeForVolume}`;

// Elapsed and remaining, floating above the line's two ends while it's hovered.
const time =
  'pointer-events-none absolute -top-5 type-[600_10px/12px] tabular-nums text-secondary opacity-0 transition-opacity duration-200 group-hover/scrub:opacity-100 group-data-dragging/scrub:opacity-100';

/**
 * The seek line along the dock's bottom edge: a hairline of glass that fills
 * with the accent as the track plays. Hovering shows the times; pressing or
 * dragging seeks.
 */
function DockProgress() {
  const { bar, elapsed, remaining, dragging, handlers } = useScrubber();
  return (
    <div
      className="group/scrub absolute inset-x-6 bottom-[7px] h-3.5 cursor-pointer touch-none max-sm:inset-x-3 max-sm:bottom-[5px]"
      data-scrubber
      data-dragging={dragging || undefined}
      {...handlers}
    >
      <span ref={elapsed} className={`${time} left-0`}>
        0:00
      </span>
      <span ref={remaining} className={`${time} right-0`}>
        0:00
      </span>
      <div
        className="absolute inset-x-0 bottom-1 h-[3px] overflow-hidden rounded-full bg-quaternary transition-[height,opacity] duration-200 ease-out group-hover/scrub:h-[5px] group-data-dragging/scrub:h-[5px]"
        aria-hidden="true"
      >
        <MixWindowHighlight />
        <div
          ref={bar}
          className="relative size-full origin-left scale-x-(--progress) rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--keyColor)_55%,transparent),var(--keyColor))] shadow-[0_0_12px_-2px_var(--keyColor)] [--progress:0]"
        />
      </div>
    </div>
  );
}

/**
 * The floating glass dock: now playing on the left, transport in the middle,
 * the actions and the seek line on the right. It re-centres in what the side
 * panel leaves, and on a phone it folds down to artwork, names and play.
 */
export function PlayerBar() {
  const sidePanel = useUi((s) => s.sidePanel);
  const toggleSidePanel = useUi((s) => s.toggleSidePanel);
  const openFullScreen = useUi((s) => s.setFullScreen);
  const hasTrack = usePlayer((s) => s.nowPlaying !== null);
  const videoId = usePlayer((s) => s.nowPlaying?.videoId ?? null);
  // The queue's entry for what's playing: the track menu needs the full track.
  const track = usePlayer((s) => {
    const entry = s.queue[s.index]?.track;
    return entry && entry.videoId === s.nowPlaying?.videoId ? entry : null;
  });
  const playing = usePlayer((s) => s.status === 'playing' || s.status === 'buffering');
  const hasNext = usePlayer((s) => s.index + 1 < s.queue.length || s.repeat !== 'off' || (s.autoplay && s.index >= 0));
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const { togglePlay, next, previous, toggleShuffle, cycleRepeat } = usePlayer.getState();
  const [volumeOpen, setVolumeOpen] = useState(false);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-(--shell-inset) z-[calc(var(--z-web-chrome)-1)] flex px-(--shell-inset) transition-[padding-inline-end] duration-(--duration-panel) ease-glide data-[panel-open=true]:pe-[calc(var(--side-panel-width)+28px)]"
      data-panel-open={sidePanel !== null}
    >
      <div
        className="glass-dock pointer-events-auto relative grid h-(--player-pill-height) w-full animate-dock-in grid-cols-[minmax(0,1.15fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-dock px-4 max-sm:h-[70px] max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-2 max-sm:px-3"
        role="region"
        aria-label="Player"
      >
        <Lcd />

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            className={`${toggle} max-sm:hidden`}
            aria-label="Shuffle"
            aria-pressed={shuffle}
            onClick={toggleShuffle}
          >
            <ShuffleIcon size={18} />
          </button>
          <button className={`${transport} max-sm:size-8`} disabled={!hasTrack} aria-label="Previous" onClick={previous}>
            <BackwardIcon size={20} />
          </button>
          {/* The one solid accent surface in the chrome: the play control. */}
          <button
            className="mx-0.5 grid size-12 place-items-center rounded-full bg-[var(--playFill)] text-[var(--playInk)] shadow-[inset_0_1px_0_rgb(255_255_255/0.45),inset_0_-1px_0_rgb(0_0_0/0.15),0_12px_28px_-10px_var(--keyColor)] transition-[filter,transform] duration-(--duration-fast) hover:brightness-110 active:scale-95 disabled:opacity-35 disabled:hover:brightness-100 max-sm:size-10"
            disabled={!hasTrack}
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={togglePlay}
          >
            {playing ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
          </button>
          <button
            className={`${transport} max-sm:size-8`}
            disabled={!hasTrack || !hasNext}
            aria-label="Next"
            onClick={next}
          >
            <ForwardIcon size={20} />
          </button>
          <button
            className={`${toggle} max-sm:hidden`}
            aria-label={repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat'}
            aria-pressed={repeat !== 'off'}
            onClick={cycleRepeat}
          >
            {repeat === 'one' ? <RepeatOneIcon size={18} /> : <RepeatIcon size={18} />}
          </button>
        </div>

        <div
          className="group/actions relative flex items-center justify-end gap-0.5 sm:gap-1"
          data-volume-open={volumeOpen || undefined}
          onPointerLeave={() => setVolumeOpen(false)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setVolumeOpen(false);
          }}
        >
          <FavoriteButton videoId={videoId} className={`${fading} ${action} max-sm:hidden`} />
          {track && <TrackMenu track={track} className={`${fading} ${action} max-sm:hidden`} placement="above-end" />}
          {/* Always here: the panel itself says whether this track has lyrics, and from where. */}
          <button
            className={`${fading} ${action}`}
            aria-label="Lyrics"
            aria-pressed={sidePanel === 'lyrics'}
            onClick={() => toggleSidePanel('lyrics')}
          >
            {sidePanel === 'lyrics' ? <LyricsActiveIcon size={18} /> : <LyricsIcon size={18} />}
          </button>
          <button
            className={`${fading} max-sm:hidden`}
            aria-label="Up Next"
            aria-pressed={sidePanel === 'up-next'}
            onClick={() => toggleSidePanel('up-next')}
          >
            <UpNextIcon size={18} />
          </button>
          <VolumeControl open={volumeOpen} onOpen={() => setVolumeOpen(true)} className={`${action} max-sm:hidden`} />
          <button
            className={`${action} max-sm:hidden`}
            aria-label="Open full screen player"
            onClick={() => openFullScreen(true)}
          >
            <Maximize2 size={16} strokeWidth={2.1} />
          </button>
        </div>

        <DockProgress />
      </div>
    </div>
  );
}
