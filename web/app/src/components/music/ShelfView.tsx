import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { PrefetchLink } from '@/components/PrefetchLink';
import { shelfHeader, shelfKinds, shelfList, shelfSection, type ShelfKind } from '@/components/shelf';
import type { MusicItem, Shelf, Track } from '@/data/music/types';
import type { QueueSource } from '@/playback/queue/timeline';
import { browseHref } from './links';
import { CircleLockup, SquareLockup, TrackLockup, VideoLockup } from './Lockups';
import { playList } from './play';

// Arrow buttons: round glass pucks, only ≥1000px, shown on shelf hover.
const arrow =
  'absolute top-1/2 z-3 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-[rgb(12_12_16/0.45)] text-white opacity-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_10px_24px_-12px_rgb(0_0_0/0.7)] backdrop-blur-xl transition-[opacity,background-color,transform] duration-(--duration-arrow) ease-out hover:bg-key-bg active:scale-95 disabled:pointer-events-none lg:grid lg:enabled:group-hover/shelf:opacity-100';

function renderItem(shelf: Shelf, item: MusicItem): ReactNode {
  switch (shelf.layout) {
    case 'tracks':
      return <TrackLockup item={item} />;
    case 'video':
      return <VideoLockup item={item} />;
    case 'circle':
      return <CircleLockup item={item} />;
    default:
      return <SquareLockup item={item} />;
  }
}

/**
 * A shelf's scrolling row with hover arrow pucks, around any list items.
 * Includes right scroll padding so the final card is never clipped.
 */
export function ShelfScroller({ kind, children }: { kind: ShelfKind; children: ReactNode }) {
  const list = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = list.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 6 });
  }, []);

  useEffect(() => {
    measure();
    const el = list.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  /** Pages by one viewport of columns, as Apple's arrows do. */
  const page = (direction: 1 | -1) => {
    const el = list.current;
    if (!el) return;
    const gutter = Number.parseFloat(getComputedStyle(el).paddingInlineStart) || 0;
    el.scrollBy({ left: direction * (el.clientWidth - gutter * 2), behavior: 'smooth' });
  };

  return (
    <div className="group/shelf relative">
      <button
        className={`${arrow} left-3`}
        aria-label="Previous Page"
        disabled={edges.start}
        onClick={() => page(-1)}
      >
        <ChevronLeft size={18} strokeWidth={2.4} />
      </button>
      <ul
        ref={list}
        className={`${shelfList} ${shelfKinds[kind]} pe-[calc(var(--body-gutter)+24px)]`}
        onScroll={measure}
      >
        {children}
      </ul>
      <button
        className={`${arrow} right-3`}
        aria-label="Next Page"
        disabled={edges.end}
        onClick={() => page(1)}
      >
        <ChevronRight size={18} strokeWidth={2.4} />
      </button>
    </div>
  );
}

/** A shelf's title: prominent headline with link and optional strapline/subtitle. */
function ShelfTitle({ title, strapline, to }: { title: string; strapline?: string | null; to?: string | null }) {
  return (
    <div className="mx-(--body-gutter) mb-3 flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[clamp(18px,1.6vw,22px)] font-bold tracking-[-0.025em] text-primary">
          {to ? (
            <PrefetchLink to={to} className="group/title inline-flex items-center gap-1.5 hover:text-key transition-colors">
              <span>{title}</span>
              <ChevronRight
                size={17}
                strokeWidth={2.4}
                className="text-tertiary transition-transform duration-200 group-hover/title:translate-x-0.5 group-hover/title:text-key"
              />
            </PrefetchLink>
          ) : (
            title
          )}
        </h2>
      </div>
      {strapline && <p className="text-[12px] text-secondary font-medium">{strapline}</p>}
    </div>
  );
}

export const trackItem = (track: Track): MusicItem => ({
  kind: 'song',
  id: track.videoId,
  title: track.title,
  subtitle: track.album?.name ?? '',
  artists: track.artists,
  album: track.album,
  thumbnail: track.thumbnail,
  wide: false,
  durationSec: track.durationSec,
  explicit: track.explicit,
});

/**
 * Songs in four rows, as the phone's Top Songs and Recently Played: any one
 * plays the whole shelf from there.
 */
export function TrackShelf({ title, to, tracks, source }: { title: string; to?: string | null; tracks: Track[]; source: QueueSource }) {
  return (
    <section className={shelfSection} aria-label={title}>
      <ShelfTitle title={title} to={to} />
      <ShelfScroller key={tracks.length} kind="tracks">
        {tracks.map((track, i) => (
          <li key={track.videoId}>
            <TrackLockup item={trackItem(track)} onPlay={() => playList(tracks, i, { source })} />
          </li>
        ))}
      </ShelfScroller>
    </section>
  );
}

/** A titled horizontal shelf (report §2): grid columns per breakpoint, scroll-snap, hover arrows. */
export function ShelfView({ shelf }: { shelf: Shelf }) {
  return (
    <section className={shelfSection} aria-label={shelf.title}>
      <ShelfTitle title={shelf.title} strapline={shelf.strapline} to={shelf.seeAll ? browseHref(shelf.seeAll) : null} />
      <ShelfScroller key={shelf.items.length} kind={shelf.layout}>
        {shelf.items.map((item, i) => (
          <li key={`${item.id}-${i}`}>{renderItem(shelf, item)}</li>
        ))}
      </ShelfScroller>
    </section>
  );
}

/** Shelves in order, each its own section. */
export function Shelves({ shelves }: { shelves: Shelf[] }) {
  return (
    <>
      {shelves.map((shelf, i) => (
        <ShelfView key={`${shelf.title}-${i}`} shelf={shelf} />
      ))}
    </>
  );
}
