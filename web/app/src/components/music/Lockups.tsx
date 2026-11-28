import { Play } from 'lucide-react';
import { PrefetchLink } from '@/components/PrefetchLink';
import type { MusicItem } from '@/data/music/types';
import { Artwork } from './Artwork';
import { ExplicitBadge } from './ExplicitBadge';
import { artistHref, hrefFor } from './links';
import { playTrack } from './play';
import { TrackMenu } from './TrackMenu';

const isPlayable = (item: MusicItem) => item.kind === 'song' || item.kind === 'video';

/** Spotify Card Hover Play Button */
function SpotifyPlayButton({ item, size = 44 }: { item: MusicItem; size?: number }) {
  return (
    <button
      className="absolute bottom-3 right-3 grid place-items-center rounded-full bg-key text-white shadow-xl opacity-0 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0 hover:scale-105 active:scale-95 transition-all duration-200"
      style={{ width: size, height: size }}
      aria-label={`Play ${item.title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        playTrack(item);
      }}
    >
      <Play size={size * 0.44} fill="currentColor" />
    </button>
  );
}

/** Artist names as links where YouTube links them */
function Byline({ item }: { item: MusicItem }) {
  const linked = item.artists.some((a) => a.id);
  if (!linked || item.kind === 'album' || item.kind === 'playlist') {
    return <span className="line-clamp-2 text-[12px] text-[#b3b3b3]">{item.subtitle}</span>;
  }
  return (
    <span className="line-clamp-2 text-[12px] text-[#b3b3b3]">
      {item.artists.map((artist, i) => {
        const href = artistHref(artist.id);
        return (
          <span key={`${artist.name}-${i}`}>
            {i > 0 && ', '}
            {href ? (
              <PrefetchLink to={href} className="hover:underline hover:text-white transition-colors">
                {artist.name}
              </PrefetchLink>
            ) : (
              artist.name
            )}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Standard Spotify-style Square Music Card:
 * Dark flat container (#181818), subtle hover background (#282828), floating green/accent play button.
 */
export function SquareLockup({ item }: { item: MusicItem }) {
  const href = hrefFor(item);
  const playable = isPlayable(item);

  return (
    <div
      tabIndex={0}
      role="button"
      className="group/card relative flex min-w-0 cursor-pointer flex-col rounded-[8px] bg-[#181818] p-3 transition-colors duration-200 hover:bg-[#282828] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-key"
      onClick={() => {
        if (playable) playTrack(item);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (playable) playTrack(item);
        }
      }}
    >
      {/* Artwork container */}
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-[6px] shadow-lg bg-[#282828]">
        <Artwork src={item.thumbnail} displayWidth={220} className="size-full object-cover" />
        {playable && <SpotifyPlayButton item={item} />}
      </div>

      {/* Title & subtitle */}
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          {href ? (
            <PrefetchLink
              to={href}
              className="truncate text-[14px] font-bold text-white hover:underline"
              onClick={(e) => {
                if (playable) e.stopPropagation();
              }}
            >
              {item.title}
            </PrefetchLink>
          ) : (
            <span className="truncate text-[14px] font-bold text-white">{item.title}</span>
          )}
          {item.explicit && <ExplicitBadge size={10} />}
        </div>
        <Byline item={item} />
      </div>
    </div>
  );
}

/**
 * Circular card for Artists
 */
export function CircleLockup({ item }: { item: MusicItem }) {
  const href = hrefFor(item);
  return (
    <div
      className="group/card relative flex min-w-0 cursor-pointer flex-col rounded-[8px] bg-[#181818] p-3 transition-colors duration-200 hover:bg-[#282828]"
      onClick={() => playTrack(item)}
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-full shadow-lg bg-[#282828]">
        <Artwork src={item.thumbnail} displayWidth={200} className="size-full object-cover" />
        <SpotifyPlayButton item={item} />
      </div>
      <div className="flex min-w-0 flex-col items-start gap-1">
        {href ? (
          <PrefetchLink to={href} className="truncate text-[14px] font-bold text-white hover:underline">
            {item.title}
          </PrefetchLink>
        ) : (
          <span className="truncate text-[14px] font-bold text-white">{item.title}</span>
        )}
        <span className="text-[12px] text-[#b3b3b3]">Artist</span>
      </div>
    </div>
  );
}

/**
 * Track Row inside a Shelf
 */
export function TrackLockup({ item, onPlay }: { item: MusicItem; onPlay?: () => void }) {
  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else {
      playTrack(item);
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      className="group/track group/row flex cursor-pointer select-none items-center gap-3 rounded-[6px] p-2 transition-colors hover:bg-[#282828]"
      onClick={handlePlay}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlay();
        }
      }}
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-[4px] bg-[#282828]">
        <Artwork src={item.thumbnail} displayWidth={48} className="size-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="type-[600_12.5px/16px] truncate text-white group-hover/track:text-key transition-colors">
          <span>{item.title}</span>
        </div>
        <span className="truncate text-[12px] text-[#b3b3b3]">{item.subtitle}</span>
      </div>
      <button
        type="button"
        data-track-menu
        className="opacity-0 group-hover/track:opacity-100 text-[#b3b3b3] hover:text-white p-1"
        onClick={(e) => {
          e.stopPropagation();
        }}
        aria-label="More options"
      >
        •••
      </button>
    </div>
  );
}

/**
 * Video Lockup at 16:9
 */
export function VideoLockup({ item }: { item: MusicItem }) {
  return (
    <div
      className="group/card relative flex min-w-0 cursor-pointer flex-col rounded-[8px] bg-[#181818] p-3 transition-colors duration-200 hover:bg-[#282828]"
      onClick={() => playTrack(item)}
    >
      <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-[6px] shadow-lg bg-[#282828]">
        <Artwork src={item.thumbnail} displayWidth={300} aspect={16 / 9} className="size-full object-cover" />
        <SpotifyPlayButton item={item} />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-[14px] font-bold text-white">{item.title}</span>
        <Byline item={item} />
      </div>
    </div>
  );
}
