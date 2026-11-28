import { PrefetchLink } from '@/components/PrefetchLink';
import { PlayIcon } from '@/components/icons/Transport';
import type { MusicItem } from '@/data/music/types';
import { Artwork } from './Artwork';
import { ExplicitBadge } from './ExplicitBadge';
import { artistHref, hrefFor } from './links';
import { playTrack, toTrack } from './play';
import { TrackMenu } from './TrackMenu';

const isPlayable = (item: MusicItem) => item.kind === 'song' || item.kind === 'video';

/* Lockups: artwork on a glass slab, the caption written on the slab. */
const tile = 'glass-tile group/tile flex min-w-0 flex-col rounded-tile p-2';
const caption = 'flex min-w-0 flex-col gap-0.5 px-1 pt-2.5 pb-0.5';
const title = 'flex min-w-0 items-center gap-1 type-[600_12.5px/16px] [&>:first-child]:truncate';
const subtitle = 'truncate type-[500_11px/14px] text-secondary';
const overlayLink = 'absolute inset-0 z-1 rounded-[inherit]';
const innerArt = 'rounded-[14px]';

/** Artist names as links where YouTube links them, else the given subtitle. */
function Byline({ item }: { item: MusicItem }) {
  const linked = item.artists.some((a) => a.id);
  if (!linked || item.kind === 'album' || item.kind === 'playlist') return <>{item.subtitle}</>;
  return (
    <>
      {item.artists.map((artist, i) => {
        const href = artistHref(artist.id);
        return (
          <span key={`${artist.name}-${i}`}>
            {i > 0 && ', '}
            {href ? (
              <PrefetchLink to={href} className="hover:underline">
                {artist.name}
              </PrefetchLink>
            ) : (
              artist.name
            )}
          </span>
        );
      })}
    </>
  );
}

/** The glass platter that appears over artwork on hover. */
function PlayPlatter({ item, size = 34 }: { item: MusicItem; size?: number }) {
  return (
    <button
      className="pointer-events-auto absolute bottom-2.5 left-2.5 grid place-items-center rounded-full bg-[rgb(10_10_14/0.42)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_8px_20px_-8px_rgb(0_0_0/0.7)] backdrop-blur-xl transition-[background-color,transform] duration-(--duration-fast) hover:bg-key-bg active:scale-95"
      style={{ width: size, height: size }}
      aria-label={`Play ${item.title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        playTrack(item);
      }}
    >
      <PlayIcon size={size * 0.52} />
    </button>
  );
}

/** The artwork with its hover sheen, linking to the item or playing it. */
function LockupArtwork({ item, width, aspect }: { item: MusicItem; width: number; aspect: number }) {
  const href = hrefFor(item);
  return (
    <div className="group/art relative">
      <Artwork
        src={item.thumbnail}
        displayWidth={width}
        aspect={aspect}
        radius="var(--radius-artwork-medium)"
        className={innerArt}
      />
      {href ? (
        <PrefetchLink to={href} className={overlayLink} aria-label={item.title} />
      ) : (
        <button className={overlayLink} aria-label={`Play ${item.title}`} onClick={() => playTrack(item)} />
      )}
      {/* Hover scrim and platter, fading in over the slab. */}
      <div className="pointer-events-none absolute inset-0 z-2 overflow-hidden rounded-[inherit] bg-[linear-gradient(180deg,transparent_40%,rgb(0_0_0/0.4))] opacity-0 transition-opacity duration-200 ease-in group-focus-visible/art:opacity-100 group-hover/art:opacity-100">
        {isPlayable(item) && <PlayPlatter item={item} />}
      </div>
      {/* The track menu for playable items: top-right, in the same glass. */}
      {isPlayable(item) && (
        <TrackMenu
          track={toTrack(item)}
          className="absolute top-2 right-2 z-3 grid size-7 place-items-center rounded-full bg-[rgb(10_10_14/0.42)] text-white opacity-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.3)] backdrop-blur-xl transition-[opacity,background-color] duration-150 ease-in group-hover/art:opacity-100 focus-visible:opacity-100 hover:bg-key-bg data-open:opacity-100"
        />
      )}
    </div>
  );
}

/** Square lockup: a glass slab holding the artwork, title and subtitle. */
export function SquareLockup({ item, width = 220 }: { item: MusicItem; width?: number }) {
  const href = hrefFor(item);
  return (
    <div className={tile}>
      <LockupArtwork item={item} width={width} aspect={1} />
      <div className={caption}>
        <div className={title}>
          {href ? (
            <PrefetchLink to={href} className="hover:underline">
              {item.title}
            </PrefetchLink>
          ) : (
            <span>{item.title}</span>
          )}
          {item.explicit && <ExplicitBadge />}
        </div>
        <div className={subtitle}>
          <Byline item={item} />
        </div>
      </div>
    </div>
  );
}

/** 16:9 video lockup, on the same slab. */
export function VideoLockup({ item, width = 300 }: { item: MusicItem; width?: number }) {
  return (
    <div className={tile}>
      <LockupArtwork item={item} width={width} aspect={16 / 9} />
      <div className={caption}>
        <div className={title}>
          <span>{item.title}</span>
          {item.explicit && <ExplicitBadge />}
        </div>
        <div className={subtitle}>{item.subtitle}</div>
      </div>
    </div>
  );
}

/** Circular artist lockup: a glass halo around the portrait. */
export function CircleLockup({ item, width = 160 }: { item: MusicItem; width?: number }) {
  return (
    <PrefetchLink to={hrefFor(item) ?? '#'} className="group/circle flex min-w-0 flex-col items-center gap-2 p-1">
      <span className="relative block w-full rounded-full p-1 shadow-[inset_0_1px_0_var(--tileRim),inset_0_0_0_1px_var(--tileHairline),0_16px_34px_-24px_var(--tileShadow)] transition-transform duration-300 ease-spring group-hover/circle:-translate-y-1">
        <Artwork src={item.thumbnail} displayWidth={width} radius="50%" />
      </span>
      <span className="max-w-full truncate text-center type-[600_11.5px/15px] group-hover/circle:underline">{item.title}</span>
    </PrefetchLink>
  );
}

/** A song row inside a shelf: 40px art, title, byline; the row lights on hover. */
export function TrackLockup({ item, onPlay }: { item: MusicItem; onPlay?: () => void }) {
  const play = onPlay ?? (() => playTrack(item));

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, [data-track-menu], [role="menuitem"], a')) {
      return;
    }
    play();
  };

  return (
    <div
      className="group/track -mx-1 grid h-[52px] grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-x-2.5 rounded-[13px] px-2 py-[6px] cursor-pointer transition-all duration-150 hover:bg-quinary active:scale-[0.99] select-none"
      onClick={handleRowClick}
    >
      <div className="group/art relative w-9 shrink-0 rounded-[9px]" aria-hidden="true">
        <Artwork src={item.thumbnail} displayWidth={36} radius="var(--radius-artwork-small)" />
        <span
          className="absolute inset-0 grid place-items-center rounded-[9px] bg-[rgb(0_0_0/0.42)] text-white opacity-0 transition-opacity duration-150 group-hover/track:opacity-100"
          aria-hidden="true"
        >
          <PlayIcon size={14} />
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-px px-0.5">
        <div className="flex min-w-0 items-center gap-1 type-[600_12.5px/16px]">
          <span className="min-w-0 truncate text-left text-primary group-hover/track:text-primary">
            {item.title}
          </span>
          {item.explicit && <ExplicitBadge />}
        </div>
        <div className="truncate type-[500_11px/14px] text-secondary">
          <Byline item={item} />
        </div>
      </div>
      {isPlayable(item) && (
        <TrackMenu
          track={toTrack(item)}
          className="grid size-7 place-items-center rounded-full text-secondary opacity-0 transition-opacity duration-150 group-hover/track:opacity-100 focus-visible:opacity-100 hover:bg-quinary hover:text-primary data-open:opacity-100"
        />
      )}
    </div>
  );
}
