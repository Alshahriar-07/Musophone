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

const buttonBase =
  'grid place-items-center rounded-full text-[#b3b3b3] transition-colors hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:text-[#b3b3b3]';
const toggleButton = `${buttonBase} size-8 aria-pressed:text-key`;
const transportButton = `${buttonBase} size-8`;

/**
 * Spotify-style seek bar in the center under playback buttons
 */
function SpotifySeekBar() {
  const { bar, elapsed, remaining, dragging, handlers } = useScrubber();
  return (
    <div className="group/scrub flex w-full max-w-[500px] items-center gap-2 max-sm:hidden">
      <span ref={elapsed} className="w-9 text-right text-[11px] tabular-nums text-[#b3b3b3]">
        0:00
      </span>
      <div
        className="relative flex h-3 flex-1 cursor-pointer touch-none items-center"
        data-scrubber
        data-dragging={dragging || undefined}
        {...handlers}
      >
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#4d4d4d] transition-all group-hover/scrub:h-1.5">
          <MixWindowHighlight />
          <div
            ref={bar}
            className="relative size-full origin-left scale-x-(--progress) rounded-full bg-white group-hover/scrub:bg-key transition-colors [--progress:0]"
          />
        </div>
      </div>
      <span ref={remaining} className="w-9 text-left text-[11px] tabular-nums text-[#b3b3b3]">
        0:00
      </span>
    </div>
  );
}

/**
 * Spotify Desktop Persistent Playback Bar:
 * - Left: Track artwork, title, artists, favorite button, track menu
 * - Center: Shuffle, Prev, Play/Pause, Next, Repeat + Seek Bar
 * - Right: Lyrics, Queue, Volume Slider, Fullscreen
 */
export function PlayerBar() {
  const sidePanel = useUi((s) => s.sidePanel);
  const toggleSidePanel = useUi((s) => s.toggleSidePanel);
  const openFullScreen = useUi((s) => s.setFullScreen);
  const hasTrack = usePlayer((s) => s.nowPlaying !== null);
  const videoId = usePlayer((s) => s.nowPlaying?.videoId ?? null);
  const track = usePlayer((s) => {
    const entry = s.queue[s.index]?.track;
    return entry && entry.videoId === s.nowPlaying?.videoId ? entry : null;
  });
  const playing = usePlayer((s) => s.status === 'playing' || s.status === 'buffering');
  const hasNext = usePlayer((s) => s.index + 1 < s.queue.length || s.repeat !== 'off' || (s.autoplay && s.index >= 0));
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const { togglePlay, next, previous, toggleShuffle, cycleRepeat } = usePlayer.getState();

  return (
    <div
      className="flex h-full w-full items-center justify-between text-white"
      role="region"
      aria-label="Player"
    >
      {/* Left: Now Playing Song Info */}
      <div className="flex min-w-[190px] max-w-[30%] items-center gap-3.5">
        <Lcd />
        {hasTrack && (
          <div className="flex items-center gap-2 max-md:hidden">
            <FavoriteButton videoId={videoId} className="grid size-8 place-items-center text-[#b3b3b3] hover:text-white transition-colors" />
            {track && <TrackMenu track={track} className="grid size-8 place-items-center text-[#b3b3b3] hover:text-white transition-colors" placement="above-start" />}
          </div>
        )}
      </div>

      {/* Center: Playback Controls & Progress Bar */}
      <div className="flex max-w-[45%] flex-1 flex-col items-center justify-center gap-1.5 max-sm:max-w-none max-sm:flex-none">
        <div className="flex items-center gap-4">
          <button
            className={`${toggleButton} max-sm:hidden`}
            aria-label="Shuffle"
            aria-pressed={shuffle}
            title="Shuffle"
            onClick={toggleShuffle}
          >
            <ShuffleIcon size={16} />
          </button>
          <button
            className={transportButton}
            disabled={!hasTrack}
            aria-label="Previous"
            title="Previous"
            onClick={previous}
          >
            <BackwardIcon size={18} />
          </button>
          <button
            className="grid size-9.5 place-items-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 shadow-md"
            disabled={!hasTrack}
            aria-label={playing ? 'Pause' : 'Play'}
            title={playing ? 'Pause' : 'Play'}
            onClick={togglePlay}
          >
            {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          <button
            className={transportButton}
            disabled={!hasTrack || !hasNext}
            aria-label="Next"
            title="Next"
            onClick={next}
          >
            <ForwardIcon size={18} />
          </button>
          <button
            className={`${toggleButton} max-sm:hidden`}
            aria-label={repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat'}
            aria-pressed={repeat !== 'off'}
            title="Repeat"
            onClick={cycleRepeat}
          >
            {repeat === 'one' ? <RepeatOneIcon size={16} /> : <RepeatIcon size={16} />}
          </button>
        </div>

        <SpotifySeekBar />
      </div>

      {/* Right: Lyrics, Queue, Volume, Fullscreen with comfortable spacing */}
      <div className="flex min-w-[190px] max-w-[30%] items-center justify-end gap-2.5 text-[#b3b3b3]">
        <button
          className="grid size-8 place-items-center rounded-full hover:text-white aria-pressed:text-key transition-colors active:scale-95"
          aria-label="Lyrics"
          title="Lyrics"
          aria-pressed={sidePanel === 'lyrics'}
          onClick={() => toggleSidePanel('lyrics')}
        >
          {sidePanel === 'lyrics' ? <LyricsActiveIcon size={18} /> : <LyricsIcon size={18} />}
        </button>
        <button
          className="grid size-8 place-items-center rounded-full hover:text-white aria-pressed:text-key transition-colors active:scale-95"
          aria-label="Up Next"
          title="Up Next"
          aria-pressed={sidePanel === 'up-next'}
          onClick={() => toggleSidePanel('up-next')}
        >
          <UpNextIcon size={18} />
        </button>
        <VolumeControl className="hover:text-white max-sm:hidden" />
        <button
          className="grid size-8 place-items-center rounded-full hover:text-white transition-colors active:scale-95 max-sm:hidden"
          aria-label="Open full screen player"
          title="Full screen player"
          onClick={() => openFullScreen(true)}
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}
