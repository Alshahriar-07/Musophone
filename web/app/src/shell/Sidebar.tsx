import { ArrowUpRight, Info, ListMusic, Puzzle, Settings } from 'lucide-react';
import { PrefetchLink, PrefetchNavLink } from '@/components/PrefetchLink';
import { LogoMark } from '@/components/icons/LogoMark';
import {
  AlbumsIcon,
  AllPlaylistsIcon,
  ArtistsIcon,
  HomeIcon,
  MadeForYouIcon,
  NewIcon,
  RecentlyAddedIcon,
  SearchIcon,
  SongsIcon,
  type NavIconProps,
} from '@/components/icons/NavIcons';
import { hrefFor } from '@/components/music/links';
import { config } from '@/config';
import { LIBRARY_SECTIONS, type LibrarySection } from '@/data/music/library';
import { useLibraryPlaylists, useSignedIn } from '@/data/music/queries';
import { useSpotifyPlaylists } from '@/data/spotify/queries';
import { useExtensionUpdate } from '@/extension/useExtensionUpdate';
import { useSpotifySignedIn } from '@/extension/useSpotifyAuth';
import { useUi } from '@/state/ui';
import { AccountButton } from './AccountButton';

interface NavItem {
  to: string;
  label: string;
  Icon: (props: NavIconProps) => React.ReactNode;
}

const PRIMARY: NavItem[] = [
  { to: '/search', label: 'Search', Icon: SearchIcon },
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/new', label: 'New', Icon: NewIcon },
];

const LIBRARY_ICONS: Record<Exclude<LibrarySection, 'playlists'>, NavItem['Icon']> = {
  recent: RecentlyAddedIcon,
  artists: ArtistsIcon,
  albums: AlbumsIcon,
  songs: SongsIcon,
  'made-for-you': MadeForYouIcon,
};

const LIBRARY: NavItem[] = (Object.keys(LIBRARY_ICONS) as (keyof typeof LIBRARY_ICONS)[]).map((section) => ({
  to: `/library/${section}`,
  label: LIBRARY_SECTIONS[section].title,
  Icon: LIBRARY_ICONS[section],
}));

// A rail row: quiet by default, a lit inset pane when it is the page's row.
const item =
  'group relative flex h-9 items-center gap-2.5 rounded-nav px-2 type-body-reduced text-secondary hover:bg-quinary hover:text-primary aria-[current=page]:glass-inset aria-[current=page]:text-primary';
// Apple's glyphs, drawn at 24px (their 24-unit box), which the user preferred to Apple's own 28px.
const icon =
  'inline-grid size-5 flex-none place-items-center text-tertiary transition-colors group-hover:text-primary group-aria-[current=page]:text-key';
const navLabel = 'min-w-0 truncate';
// "Library", "Playlists": small, wide-tracked caps, as the chrome's section marks.
const sectionHeader = 'mt-5 mb-1 flex items-center gap-2 px-2 type-[600_10px/13px] uppercase tracking-[0.16em] text-tertiary';
const list = 'flex flex-col gap-px';

function SectionMark({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={sectionHeader}>
      <span>{children}</span>
      <span className="h-px flex-1 bg-[linear-gradient(90deg,var(--labelDivider),transparent)]" aria-hidden="true" />
    </h2>
  );
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate: () => void }) {
  return (
    <ul className={list}>
      {items.map(({ to, label, Icon }) => (
        <li key={to}>
          <PrefetchNavLink to={to} className={item} onClick={onNavigate}>
            <Icon size={22} className={icon} />
            <span className={navLabel}>{label}</span>
          </PrefetchNavLink>
        </li>
      ))}
    </ul>
  );
}

/** Library and Playlists, once YouTube requests are made as the user. */
function LibraryNav({ onNavigate }: { onNavigate: () => void }) {
  const playlists = useLibraryPlaylists();
  return (
    <>
      <SectionMark>Library</SectionMark>
      <NavList items={LIBRARY} onNavigate={onNavigate} />
      <SectionMark>Playlists</SectionMark>
      <ul className={list}>
        <li>
          <PrefetchNavLink to="/library/playlists" className={item} onClick={onNavigate}>
            <AllPlaylistsIcon size={22} className={icon} />
            <span className={navLabel}>{LIBRARY_SECTIONS.playlists.title}</span>
          </PrefetchNavLink>
        </li>
        {playlists.data?.map((playlist) => (
          <li key={playlist.id}>
            <PrefetchNavLink to={hrefFor(playlist) ?? '/library/playlists'} className={item} onClick={onNavigate}>
              <span className={icon}>
                <ListMusic size={16} strokeWidth={1.8} />
              </span>
              <span className={navLabel}>{playlist.title}</span>
            </PrefetchNavLink>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Spotify's playlists, once the extension can read them as the user. */
function SpotifyNav({ onNavigate }: { onNavigate: () => void }) {
  const playlists = useSpotifyPlaylists();
  return (
    <>
      <SectionMark>Spotify</SectionMark>
      <ul className={list}>
        <li>
          <PrefetchNavLink to="/spotify" end className={item} onClick={onNavigate}>
            <AllPlaylistsIcon size={22} className={icon} />
            <span className={navLabel}>All Spotify Playlists</span>
          </PrefetchNavLink>
        </li>
        {playlists.data?.map((playlist) => (
          <li key={playlist.id}>
            <PrefetchNavLink to={`/spotify/playlist/${encodeURIComponent(playlist.id)}`} className={item} onClick={onNavigate}>
              <span className={icon}>
                <ListMusic size={16} strokeWidth={1.8} />
              </span>
              <span className={navLabel}>{playlist.name}</span>
            </PrefetchNavLink>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * The left glass rail: a floating pane inset from the stage's edges, never
 * flush with them. On a phone it slides in from the left as a drawer.
 */
export function Sidebar() {
  const drawerOpen = useUi((s) => s.drawerOpen);
  const setDrawerOpen = useUi((s) => s.setDrawerOpen);
  const update = useExtensionUpdate();
  const signedIn = useSignedIn();
  const spotifySignedIn = useSpotifySignedIn();
  const close = () => setDrawerOpen(false);

  return (
    <>
      <nav
        className="glass-material relative z-(--z-web-chrome) flex w-(--web-navigation-width) shrink-0 flex-col overflow-hidden rounded-rail p-3 max-sm:fixed max-sm:inset-y-(--app-frame-padding) max-sm:left-(--app-frame-padding) max-sm:z-(--z-modal) max-sm:w-[min(320px,86vw)] max-sm:-translate-x-[calc(100%+32px)] max-sm:transition-transform max-sm:duration-(--duration-panel) max-sm:ease-glide max-sm:data-[open=true]:translate-x-0"
        data-open={drawerOpen}
        aria-label="Main"
        aria-hidden={drawerOpen ? undefined : undefined}
      >
        <PrefetchLink
          to="/home"
          className="press group ml-1 flex items-center gap-3 rounded-[16px] px-1 pt-1 pb-4"
          aria-label="MusoPhone, Home"
          onClick={close}
        >
          <span className="grid size-9 place-items-center rounded-[13px] bg-key-bg text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_10px_24px_-12px_var(--keyColor)]">
            <LogoMark size={20} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate type-[700_16px/20px] tracking-[-0.02em]">MusoPhone</span>
            <span className="type-caption-2 uppercase tracking-[0.16em] text-tertiary">Liquid listening</span>
          </span>
        </PrefetchLink>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 pl-1 [scrollbar-width:none]">
          <NavList items={PRIMARY} onNavigate={close} />
          {signedIn && <LibraryNav onNavigate={close} />}
          {spotifySignedIn && <SpotifyNav onNavigate={close} />}
        </div>

        <div className="mt-3 flex flex-col gap-px pt-3">
          <div className="glass-rule mb-1.5" aria-hidden="true" />
          <PrefetchNavLink to="/extension" className={item} onClick={close}>
            <span className={icon}>
              <Puzzle size={17} strokeWidth={1.9} />
            </span>
            <span className={navLabel}>MusoPhone Extension</span>
            {update.state === 'available' && (
              <span
                className="ml-auto grid size-2 place-items-center rounded-full bg-key shadow-[0_0_10px_var(--keyColor)]"
                aria-label={`Version ${update.latest.version} is available`}
                title={`Version ${update.latest.version} is available`}
              />
            )}
          </PrefetchNavLink>
          <PrefetchNavLink to="/about" className={item} onClick={close}>
            <span className={icon}>
              <Info size={17} strokeWidth={1.9} />
            </span>
            <span className={navLabel}>About &amp; Credits</span>
          </PrefetchNavLink>
          <div className="mt-2 px-0.5">
            <AccountButton />
          </div>
          <div className="mt-3 flex items-center justify-between pl-2">
            <div className="flex min-w-0 items-center gap-2">
              <a
                className="inline-flex items-center gap-1 truncate type-callout text-secondary hover:text-primary"
                href={config.androidAppUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span>Get the Android app</span>
                <ArrowUpRight size={13} strokeWidth={2} />
              </a>
              <span className="type-caption-2 text-tertiary" title={`MusoPhone Web ${config.version}`}>
                v{config.version}
              </span>
            </div>
            <PrefetchNavLink
              to="/settings"
              className="press grid size-8 shrink-0 place-items-center rounded-[11px] text-tertiary hover:bg-quinary hover:text-primary aria-[current=page]:glass-inset aria-[current=page]:text-primary"
              aria-label="Settings"
              title="Settings"
              onClick={close}
            >
              <Settings size={16} strokeWidth={1.9} />
            </PrefetchNavLink>
          </div>
        </div>
      </nav>
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[calc(var(--z-modal)-1)] hidden bg-scrim backdrop-blur-[2px] max-sm:block"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
}
