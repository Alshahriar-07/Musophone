import { ArrowUpRight, Info, ListMusic, PanelLeftClose, PanelLeftOpen, Puzzle, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
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
  Icon?: (props: NavIconProps) => ReactNode;
  iconEl?: ReactNode;
}

const PRIMARY: NavItem[] = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/search', label: 'Search', Icon: SearchIcon },
  { to: '/new', label: 'New', Icon: NewIcon },
];

const LIBRARY_ICONS: Record<Exclude<LibrarySection, 'playlists'>, (props: NavIconProps) => ReactNode> = {
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

const sectionHeader = 'mt-5 mb-1.5 flex items-center gap-2 px-3 type-[600_10px/13px] uppercase tracking-[0.16em] text-tertiary';
const list = 'flex flex-col gap-0.5';

function SectionMark({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  if (collapsed) {
    return <div className="my-2.5 mx-auto h-px w-7 bg-divider" aria-hidden="true" />;
  }
  return (
    <h2 className={sectionHeader}>
      <span className="rail-label truncate">{children}</span>
      <span className="h-px min-w-4 flex-1 bg-[linear-gradient(90deg,var(--labelDivider),transparent)]" aria-hidden="true" />
    </h2>
  );
}

function NavRow({
  to,
  label,
  Icon,
  iconEl,
  collapsed,
  onNavigate,
  end,
  badge,
}: {
  to: string;
  label: string;
  Icon?: (props: NavIconProps) => ReactNode;
  iconEl?: ReactNode;
  collapsed: boolean;
  onNavigate: () => void;
  end?: boolean;
  badge?: ReactNode;
}) {
  return (
    <li className="relative group/nav-item">
      <PrefetchNavLink
        to={to}
        end={end}
        className={
          collapsed
            ? 'relative flex size-10 mx-auto items-center justify-center rounded-[12px] text-secondary transition-colors hover:bg-quinary hover:text-primary aria-[current=page]:glass-inset aria-[current=page]:text-key'
            : 'relative flex h-9.5 w-full items-center gap-3 rounded-nav px-3 type-body-reduced text-secondary transition-colors hover:bg-quinary hover:text-primary aria-[current=page]:glass-inset aria-[current=page]:text-primary'
        }
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        aria-label={label}
      >
        <span className="grid size-5 shrink-0 place-items-center text-tertiary transition-colors group-hover/nav-item:text-primary group-aria-[current=page]:text-key">
          {Icon ? <Icon size={20} /> : iconEl}
        </span>
        {!collapsed && <span className="rail-label min-w-0 truncate font-medium">{label}</span>}
        {!collapsed && badge && <span className="ms-auto">{badge}</span>}
      </PrefetchNavLink>

      {/* Floating glass tooltip on hover in collapsed mode */}
      {collapsed && (
        <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[100] hidden whitespace-nowrap rounded-[8px] bg-[var(--glassDialogFill)] px-2.5 py-1 text-[12px] font-medium text-primary shadow-[0_8px_24px_-4px_rgba(0,0,0,0.65),inset_0_1px_0_var(--glassRim),inset_0_0_0_1px_var(--glassHairline)] backdrop-blur-xl group-hover/nav-item:block max-sm:hidden">
          {label}
        </div>
      )}
    </li>
  );
}

function NavList({ items, collapsed, onNavigate }: { items: NavItem[]; collapsed: boolean; onNavigate: () => void }) {
  return (
    <ul className={list}>
      {items.map(({ to, label, Icon, iconEl }) => (
        <NavRow key={to} to={to} label={label} Icon={Icon} iconEl={iconEl} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

/** Library and Playlists, once YouTube requests are made as the user. */
function LibraryNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const playlists = useLibraryPlaylists();
  return (
    <>
      <SectionMark collapsed={collapsed}>Library</SectionMark>
      <NavList items={LIBRARY} collapsed={collapsed} onNavigate={onNavigate} />
      <div className="rail-extra">
        <SectionMark collapsed={collapsed}>Playlists</SectionMark>
        <ul className={list}>
          <NavRow
            to="/library/playlists"
            label={LIBRARY_SECTIONS.playlists.title}
            Icon={AllPlaylistsIcon}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
          {playlists.data?.map((playlist) => (
            <NavRow
              key={playlist.id}
              to={hrefFor(playlist) ?? '/library/playlists'}
              label={playlist.title}
              iconEl={<ListMusic size={16} strokeWidth={1.8} />}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

/** Spotify's playlists, once the extension can read them as the user. */
function SpotifyNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const playlists = useSpotifyPlaylists();
  return (
    <div className="rail-extra">
      <SectionMark collapsed={collapsed}>Spotify</SectionMark>
      <ul className={list}>
        <NavRow to="/spotify" end label="All Spotify Playlists" Icon={AllPlaylistsIcon} collapsed={collapsed} onNavigate={onNavigate} />
        {playlists.data?.map((playlist) => (
          <NavRow
            key={playlist.id}
            to={`/spotify/playlist/${encodeURIComponent(playlist.id)}`}
            label={playlist.name}
            iconEl={<ListMusic size={16} strokeWidth={1.8} />}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * The left navigation rail:
 * - Expanded: 232px wide with clear groups, labels and dedicated collapse button.
 * - Collapsed: 72px wide with centered icons and floating glass hover tooltips.
 */
export function Sidebar() {
  const drawerOpen = useUi((s) => s.drawerOpen);
  const setDrawerOpen = useUi((s) => s.setDrawerOpen);
  const collapsed = useUi((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUi((s) => s.toggleSidebar);
  const update = useExtensionUpdate();
  const signedIn = useSignedIn();
  const spotifySignedIn = useSpotifySignedIn();
  const close = () => setDrawerOpen(false);

  return (
    <>
      <nav
        className="rail group/rail glass-material relative z-(--z-web-chrome) flex h-full shrink-0 flex-col overflow-hidden shadow-[inset_-1px_0_0_var(--glassHairline)] max-sm:fixed max-sm:inset-y-0 max-sm:left-0 max-sm:z-(--z-modal) max-sm:w-[min(300px,86vw)] max-sm:-translate-x-[calc(100%+2px)] max-sm:shadow-[0_0_80px_-20px_rgb(0_0_0/0.8)] max-sm:transition-transform max-sm:duration-(--duration-panel) max-sm:ease-glide max-sm:data-[open=true]:translate-x-0"
        data-open={drawerOpen}
        data-collapsed={collapsed}
        aria-label="Main"
      >
        {/* Header: Logo, Branding & Collapse/Expand Button */}
        <div className="rail-head flex h-(--mobile-top-bar-height) shrink-0 items-center justify-between gap-2 px-3">
          <PrefetchLink
            to="/home"
            className="rail-brand press flex min-w-0 items-center gap-2.5 rounded-[14px]"
            aria-label="MusoPhone, Home"
            onClick={close}
          >
            <span className="grid size-9 flex-none place-items-center rounded-[12px] bg-key-bg text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_10px_24px_-12px_var(--keyColor)]">
              <LogoMark size={20} />
            </span>
            <span className="rail-label flex min-w-0 flex-col">
              <span className="truncate type-[700_15px/19px] tracking-[-0.02em]">MusoPhone</span>
              <span className="type-caption-2 uppercase tracking-[0.16em] text-tertiary">Liquid listening</span>
            </span>
          </PrefetchLink>
          <button
            className="rail-toggle press grid size-8 flex-none place-items-center rounded-[10px] text-tertiary transition-colors hover:bg-quinary hover:text-primary max-sm:hidden"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleCollapsed}
          >
            {collapsed ? <PanelLeftOpen size={17} strokeWidth={1.9} /> : <PanelLeftClose size={17} strokeWidth={1.9} />}
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 [scrollbar-width:none] max-sm:px-3">
          <NavList items={PRIMARY} collapsed={collapsed} onNavigate={close} />
          {signedIn && <LibraryNav collapsed={collapsed} onNavigate={close} />}
          {spotifySignedIn && <SpotifyNav collapsed={collapsed} onNavigate={close} />}
        </div>

        {/* Bottom Utility, Account & Settings */}
        <div className="mt-auto shrink-0 flex flex-col gap-0.5 px-2 pt-2 pb-[max(12px,env(safe-area-inset-bottom,12px))] max-sm:px-3">
          <div className="glass-rule mb-1.5 w-full" aria-hidden="true" />
          <ul className={list}>
            <NavRow
              to="/extension"
              label="MusoPhone Extension"
              iconEl={<Puzzle size={17} strokeWidth={1.9} />}
              collapsed={collapsed}
              onNavigate={close}
              badge={
                update.state === 'available' ? (
                  <span
                    className="grid size-2 place-items-center rounded-full bg-key shadow-[0_0_10px_var(--keyColor)]"
                    aria-label={`Version ${update.latest.version} is available`}
                    title={`Version ${update.latest.version} is available`}
                  />
                ) : null
              }
            />
            <NavRow
              to="/about"
              label="About & Credits"
              iconEl={<Info size={17} strokeWidth={1.9} />}
              collapsed={collapsed}
              onNavigate={close}
            />
          </ul>

          <div className="rail-account mt-2 w-full px-0.5">
            <AccountButton compact={collapsed} />
          </div>

          <div className="rail-footer mt-2 flex w-full items-center justify-between px-1.5">
            <div className="rail-extra flex min-w-0 items-center gap-2">
              <a
                className="inline-flex items-center gap-1 truncate type-callout text-secondary hover:text-primary transition-colors"
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
            <div className="relative group/settings">
              <PrefetchNavLink
                to="/settings"
                className="press grid size-8 shrink-0 place-items-center rounded-[10px] text-tertiary hover:bg-quinary hover:text-primary aria-[current=page]:glass-inset aria-[current=page]:text-primary transition-colors"
                aria-label="Settings"
                title={collapsed ? 'Settings' : undefined}
                onClick={close}
              >
                <Settings size={16} strokeWidth={1.9} />
              </PrefetchNavLink>
              {collapsed && (
                <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[100] hidden whitespace-nowrap rounded-[8px] bg-[var(--glassDialogFill)] px-2.5 py-1 text-[12px] font-medium text-primary shadow-[0_8px_24px_-4px_rgba(0,0,0,0.65),inset_0_1px_0_var(--glassRim),inset_0_0_0_1px_var(--glassHairline)] backdrop-blur-xl group-hover/settings:block max-sm:hidden">
                  Settings
                </div>
              )}
            </div>
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
