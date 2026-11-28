import { Maximize2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { LogoMark } from '@/components/icons/LogoMark';
import { ExplicitBadge } from '@/components/music/ExplicitBadge';
import { VideoSurface } from '@/components/music/VideoSurface';
import { albumHref, artistHref } from '@/components/music/links';
import { PrefetchLink } from '@/components/PrefetchLink';
import { artistCredits, creditSegments } from '@/lib/artistCredits';
import { sizedArtwork } from '@/lib/artwork';
import type { Track } from '@/data/music/types';
import { usePlayer } from '@/state/player';
import { useUi } from '@/state/ui';
import { useHasVideo } from '@/state/video';
import { albumPageFor, artistPageFor } from './nowPlayingLinks';

// The title and each artist: plain until hovered, then underlined on their own.
export const pageLink = 'cursor-pointer text-start hover:underline focus-visible:underline aria-busy:cursor-progress';

/**
 * A name in the dock that opens a page: a plain link when the page is known,
 * else a button that works out where it goes (nowPlayingLinks.ts) and then goes.
 */
interface PageLinkProps {
  href: string | null;
  resolve: () => Promise<string>;
  className: string;
  children: ReactNode;
}

export function PageLink({ href, resolve, className, children }: PageLinkProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  if (href) {
    return (
      <PrefetchLink to={href} className={className}>
        {children}
      </PrefetchLink>
    );
  }
  return (
    <button
      className={className}
      aria-busy={busy || undefined}
      onClick={() => {
        if (busy) return;
        setBusy(true);
        void resolve()
          .then((to) => navigate(to))
          .finally(() => setBusy(false));
      }}
    >
      {children}
    </button>
  );
}

/**
 * The artists, each its own link, as the phone draws its credit line: the
 * byline as written, with every credited name in it opening that artist's page.
 */
export function Credits({
  videoId,
  line,
  artists,
  className = pageLink,
}: {
  videoId: string;
  line: string;
  artists: Track['artists'];
  className?: string;
}) {
  const segments = creditSegments(line, artistCredits(line, artists));
  return segments.map((segment, i) =>
    segment.credit ? (
      <PageLink
        key={i}
        className={className}
        href={artistHref(segment.credit.id)}
        resolve={() => artistPageFor(videoId, segment.credit!)}
      >
        {segment.text}
      </PageLink>
    ) : (
      segment.text
    ),
  );
}

// As wide as the name, so only the name opens the album.
const titleClass = 'min-w-0 max-w-full self-start truncate type-[600_13px/17px] tracking-[-0.005em]';

/**
 * The now-playing block in the dock: the artwork as the full-screen player's
 * door, then the song and its credits, stacked. The progress line lives on the
 * dock itself (PlayerBar), along its bottom edge.
 */
export function Lcd() {
  const nowPlaying = usePlayer((s) => s.nowPlaying);
  const status = usePlayer((s) => s.status);
  const error = usePlayer((s) => s.error);
  const openFullScreen = useUi((s) => s.setFullScreen);
  // The queue's row for what's playing: it carries the album and each artist's channel.
  const track = usePlayer((s) => {
    const entry = s.queue[s.index]?.track;
    return entry && entry.videoId === s.nowPlaying?.videoId ? entry : null;
  });
  const video = useHasVideo(nowPlaying?.videoId);

  if (!nowPlaying) {
    return (
      <div className="flex min-w-0 items-center gap-3 pl-0.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-quinary text-tertiary">
          <LogoMark size={22} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="type-[600_13px/17px] text-primary">Nothing playing</span>
          <span className="truncate type-callout text-tertiary">Pick a song and it appears here.</span>
        </div>
      </div>
    );
  }

  const { videoId, title, artist } = nowPlaying;
  const album = track?.album ?? null;
  return (
    <div className="group/lcd flex min-w-0 items-center gap-3 pl-0.5">
      {/* The artwork opens the full-screen player, with an expand glyph on hover. */}
      <button
        // A music video plays here in small, at 16:9.
        className={`group/art relative block shrink-0 overflow-hidden rounded-[14px] bg-joe shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_0_0_1px_rgb(255_255_255/0.12),0_12px_26px_-14px_rgb(0_0_0/0.8)] ${
          video ? 'h-12 w-[84px] bg-black' : 'size-12'
        }`}
        aria-label="Open full screen player"
        onClick={() => openFullScreen(true)}
      >
        {nowPlaying.artworkUrl && (
          <img
            key={nowPlaying.artworkUrl}
            src={sizedArtwork(nowPlaying.artworkUrl, 76)}
            alt=""
            referrerPolicy="no-referrer"
            decoding="async"
            className="size-full object-cover opacity-0 transition-opacity duration-300 ease-in data-loaded:opacity-100"
            onLoad={(e) => e.currentTarget.setAttribute('data-loaded', '')}
          />
        )}
        <VideoSurface className={`absolute inset-0 transition-opacity duration-300 ${video ? 'opacity-100' : 'opacity-0'}`} />
        <span
          className="absolute inset-0 grid place-items-center bg-[rgb(0_0_0/0.48)] text-white opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover/pill:opacity-100 group-focus-visible/art:opacity-100"
          aria-hidden="true"
        >
          <Maximize2 size={15} strokeWidth={2.2} />
        </span>
      </button>

      <div className="flex min-w-0 flex-col gap-0.5">
        {title ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <PageLink
              className={`${titleClass} ${pageLink}`}
              href={albumHref(album?.id ?? null)}
              resolve={() => albumPageFor(videoId, album, [title, artist].filter(Boolean).join(' '))}
            >
              {title}
            </PageLink>
            {track?.explicit && <ExplicitBadge size={10} />}
            {status === 'playing' && (
              <span className="flex items-end gap-[2px] h-3 px-0.5 ml-0.5" aria-label="Playing" title="Playing">
                <span className="w-[2.5px] rounded-full bg-key animate-[equalize_0.8s_ease-in-out_infinite]" style={{ height: '60%' }} />
                <span className="w-[2.5px] rounded-full bg-key animate-[equalize_0.8s_ease-in-out_0.2s_infinite]" style={{ height: '100%' }} />
                <span className="w-[2.5px] rounded-full bg-key animate-[equalize_0.8s_ease-in-out_0.4s_infinite]" style={{ height: '40%' }} />
              </span>
            )}
          </div>
        ) : (
          <span className={titleClass}>{status === 'loading' ? 'Loading…' : ''}</span>
        )}
        {status === 'error' ? (
          <span className="truncate type-callout text-key">{error}</span>
        ) : (
          <span className="truncate type-callout text-secondary">
            {artist ? (
              <Credits videoId={videoId} line={artist} artists={track?.artists ?? []} />
            ) : status === 'loading' ? (
              'Loading…'
            ) : (
              ''
            )}
          </span>
        )}
      </div>
    </div>
  );
}
