import { useEffect, useRef } from 'react';
import { Play, Radio, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { PrefetchLink } from '@/components/PrefetchLink';
import { Artwork } from '@/components/music/Artwork';
import { ExplicitBadge } from '@/components/music/ExplicitBadge';
import { Shelves, TrackShelf } from '@/components/music/ShelfView';
import { LoadError, LoadMoreError, NeedsExtension } from '@/components/music/States';
import { playList, playTrack } from '@/components/music/play';
import { useHome, useLibrary, useYouTubeReady } from '@/data/music/queries';
import type { Track } from '@/data/music/types';
import { HomeSkeleton } from '@/skeletons/PageSkeletons';
import { ShelfSkeleton } from '@/skeletons/ShelfSkeleton';

const RECENT_TITLE = 'Recently Played';
const RECENT_LIMIT = 20;
const RECENT_SOURCE = { title: RECENT_TITLE, type: 'home' as const };

function useRecentlyPlayed(): Track[] {
  const history = useLibrary('recent');
  const first = history.data?.pages[0]?.data.tracks ?? [];
  const seen = new Set<string>();
  return first.filter((t) => !seen.has(t.videoId) && seen.add(t.videoId)).slice(0, RECENT_LIMIT);
}

/**
 * Spotify-style 6-card Jump Back In / Quick Picks Hero Grid
 * Flat dark cards (#282828 / #383838 hover), square artwork, instant play button on hover
 */
function SpotifyHeroGrid({ tracks }: { tracks: Track[] }) {
  const heroItems = tracks.slice(0, 6);
  if (heroItems.length === 0) return null;

  return (
    <section className="mb-8 mt-2 px-(--body-gutter)" aria-label="Jump Back In">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-white tracking-tight">Jump Back In</h2>
        <PrefetchLink
          to="/library/recent"
          className="text-[13px] font-bold text-[#b3b3b3] hover:text-white transition-colors"
        >
          Show all
        </PrefetchLink>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {heroItems.map((track, idx) => {
          const artistName = track.artists.map((a) => a.name).join(', ') || 'Unknown Artist';
          return (
            <div
              key={track.videoId}
              tabIndex={0}
              role="button"
              className="group relative flex cursor-pointer select-none items-center gap-3 overflow-hidden rounded-[6px] bg-[#2a2a2a]/60 pr-3 transition-colors hover:bg-[#383838] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-key"
              onClick={() => playList(tracks, idx, { source: RECENT_SOURCE })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  playList(tracks, idx, { source: RECENT_SOURCE });
                }
              }}
            >
              <div className="relative size-14 shrink-0 overflow-hidden shadow-md">
                <Artwork src={track.thumbnail} displayWidth={56} className="size-full object-cover" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <span className="truncate text-[14px] font-bold text-white">{track.title}</span>
                <span className="truncate text-[12px] text-[#b3b3b3]">{artistName}</span>
              </div>

              {/* Spotify hover play button */}
              <button
                type="button"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-key text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-105 active:scale-95"
                aria-label={`Play ${track.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(track, undefined, RECENT_SOURCE);
                }}
              >
                <Play size={18} fill="currentColor" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Spotify-style Listen Together Room Banner
 */
function ListenTogetherBanner() {
  return (
    <div className="mx-(--body-gutter) mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-gradient-to-r from-[#242424] to-[#181818] p-5 border border-[#333333]">
      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-full bg-key/20 text-key">
          <Radio size={24} />
        </span>
        <div className="flex flex-col">
          <span className="text-[16px] font-bold text-white">Listen Together</span>
          <span className="text-[13px] text-[#b3b3b3]">
            Sync playback in real-time with friends in a shared listening room.
          </span>
        </div>
      </div>
      <PrefetchLink
        to="/settings/listen-together"
        className="rounded-[6px] bg-white px-4 py-2 text-[13px] font-bold text-black transition-transform hover:scale-102 active:scale-98"
      >
        Open Room
      </PrefetchLink>
    </div>
  );
}

export default function HomePage() {
  const { missing } = useYouTubeReady();
  const home = useHome();
  const recent = useRecentlyPlayed();
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !home.hasNextPage || home.isFetchNextPageError) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !home.isFetchingNextPage) void home.fetchNextPage();
      },
      { root: document.getElementById('scrollable-page'), rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [home.hasNextPage, home.isFetchingNextPage, home.isFetchNextPageError, home.fetchNextPage]);

  if (missing) {
    return (
      <>
        <PageHeader title="Home" />
        <NeedsExtension />
      </>
    );
  }

  if (home.isError && !home.data) {
    return (
      <>
        <PageHeader title="Home" />
        <LoadError error={home.error} onRetry={() => void home.refetch()} />
      </>
    );
  }

  if (!home.data) return <HomeSkeleton />;

  const shelves = home.data.pages
    .flatMap((page) => page.data)
    .filter((shelf) => !(recent.length > 0 && shelf.title.trim().toLowerCase() === RECENT_TITLE.toLowerCase()));

  return (
    <>
      <PageHeader title="Good day" />
      {recent.length > 0 && <SpotifyHeroGrid tracks={recent} />}
      <ListenTogetherBanner />
      {recent.length > 0 && <TrackShelf title={RECENT_TITLE} to="/library/recent" tracks={recent} source={RECENT_SOURCE} />}
      <Shelves shelves={shelves} />
      <div ref={sentinel} />
      {home.isFetchingNextPage && <ShelfSkeleton kind="square" />}
      {home.isFetchNextPageError && <LoadMoreError onRetry={() => void home.fetchNextPage()} />}
    </>
  );
}
