import {
  ArrowUpRight,
  Compass,
  Heart,
  History,
  Info,
  Library,
  ListMusic,
  Music2,
  PanelLeftClose,
  PanelLeftOpen,
  Puzzle,
  Radio,
  Search,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { PrefetchLink, PrefetchNavLink } from '@/components/PrefetchLink';
import { LogoMark } from '@/components/icons/LogoMark';
import { hrefFor } from '@/components/music/links';
import { config } from '@/config';
import { useLibraryPlaylists, useSignedIn } from '@/data/music/queries';
import { useSpotifyPlaylists } from '@/data/spotify/queries';
import { useExtensionUpdate } from '@/extension/useExtensionUpdate';
import { useSpotifySignedIn } from '@/extension/useSpotifyAuth';
import { useUi } from '@/state/ui';
import { AccountButton } from './AccountButton';

interface SpotifyNavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const PRIMARY_NAV: SpotifyNavItem[] = [
  { to: '/home', label: 'Home', icon: <Compass size={22} strokeWidth={2} /> },
  { to: '/search', label: 'Search', icon: <Search size={22} strokeWidth={2} /> },
  { to: '/new', label: 'Explore', icon: <Radio size={22} strokeWidth={2} /> },
];

const LIBRARY_NAV: SpotifyNavItem[] = [
  { to: '/library/recent', label: 'Recently Played', icon: <History size={20} strokeWidth={2} /> },
  { to: '/library/made-for-you', label: 'Made for You', icon: <Sparkles size={20} strokeWidth={2} /> },
  { to: '/library/artists', label: 'Artists', icon: <User size={20} strokeWidth={2} /> },
  { to: '/library/albums', label: 'Albums', icon: <Music2 size={20} strokeWidth={2} /> },
  { to: '/library/songs', label: 'Songs', icon: <Heart size={20} strokeWidth={2} /> },
  { to: '/library/playlists', label: 'Playlists', icon: <ListMusic size={20} strokeWidth={2} /> },
];

function NavItemRow({
  item,
  collapsed,
  onNavigate,
}: {
  item: SpotifyNavItem;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <li className="relative group/nav-item">
      <PrefetchNavLink
        to={item.to}
        end={item.end}
        className={
          collapsed
            ? 'relative flex size-11 mx-auto items-center justify-center rounded-[8px] text-[#b3b3b3] transition-colors hover:text-white aria-[current=page]:bg-[#282828] aria-[current=page]:text-white'
            : 'relative flex h-10 w-full items-center gap-4 rounded-[8px] px-3 text-[14px] font-semibold text-[#b3b3b3] transition-colors hover:text-white hover:bg-[#1a1a1a] aria-[current=page]:text-white aria-[current=page]:bg-[#242424]'
        }
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        aria-label={item.label}
      >
        <span className="grid size-6 shrink-0 place-items-center transition-colors">
          {item.icon}
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </PrefetchNavLink>

      {/* Spotify tooltip in collapsed mode */}
      {collapsed && (
        <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[100] hidden whitespace-nowrap rounded-[6px] bg-[#282828] px-3 py-1.5 text-[12.5px] font-medium text-white shadow-xl group-hover/nav-item:block max-sm:hidden">
          {item.label}
        </div>
      )}
    </li>
  );
}

/**
 * Spotify Desktop Sidebar:
 * - Upper box: Logo, Toggle, Primary Navigation
 * - Lower box: Your Library, Quick Library Sections, Playlists, Bottom Account & Settings
 */
export function Sidebar() {
  const drawerOpen = useUi((s) => s.drawerOpen);
  const setDrawerOpen = useUi((s) => s.setDrawerOpen);
  const collapsed = useUi((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUi((s) => s.toggleSidebar);
  const update = useExtensionUpdate();
  const signedIn = useSignedIn();
  const spotifySignedIn = useSpotifySignedIn();
  const playlists = useLibraryPlaylists();
  const spotifyPlaylists = useSpotifyPlaylists();
  const close = () => setDrawerOpen(false);

  return (
    <>
      <nav
        className="rail group/rail relative z-(--z-web-chrome) flex h-full shrink-0 flex-col gap-2 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-sm:fixed max-sm:inset-y-0 max-sm:left-0 max-sm:z-(--z-modal) max-sm:w-[min(300px,86vw)] max-sm:-translate-x-[calc(100%+2px)] max-sm:bg-[#000000] max-sm:p-2 max-sm:shadow-2xl max-sm:transition-transform max-sm:duration-(--duration-panel) max-sm:data-[open=true]:translate-x-0"
        data-open={drawerOpen}
        data-collapsed={collapsed}
        aria-label="Main"
        style={{ width: collapsed ? 'var(--web-navigation-collapsed)' : 'var(--web-navigation-width)' }}
      >
        {/* Top Box: Logo & Primary Navigation */}
        <div className="flex shrink-0 flex-col rounded-[8px] bg-[#121212] border border-white/[0.04] p-3">
          {collapsed ? (
            /* Collapsed Header: Whole area is clickable to expand sidebar */
            <div className="relative group/logo-expand mb-3 flex items-center justify-center">
              <button
                type="button"
                className="relative grid size-10 place-items-center rounded-[8px] text-white transition-transform hover:scale-110 active:scale-95"
                aria-label="Expand sidebar"
                title="Expand sidebar"
                onClick={toggleCollapsed}
              >
                <LogoMark size={24} />
                <span className="absolute inset-0 grid place-items-center rounded-[8px] bg-black/60 opacity-0 group-hover/logo-expand:opacity-100 transition-opacity">
                  <PanelLeftOpen size={18} className="text-white" />
                </span>
              </button>
              <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[100] hidden whitespace-nowrap rounded-[6px] bg-[#282828] px-3 py-1.5 text-[12.5px] font-medium text-white shadow-xl group-hover/logo-expand:block max-sm:hidden">
                Expand sidebar
              </div>
            </div>
          ) : (
            /* Expanded Header: Clean standalone logo, brand name, and dedicated collapse button */
            <div className="mb-3.5 flex items-center justify-between px-1">
              <PrefetchLink
                to="/home"
                className="flex min-w-0 items-center gap-2.5 group/logo"
                aria-label="MusoPhone, Home"
                onClick={close}
              >
                <LogoMark size={24} className="shrink-0 transition-transform duration-200 group-hover/logo:scale-105" />
                <span className="truncate text-[16px] font-bold text-white tracking-tight">MusoPhone</span>
              </PrefetchLink>
              <button
                type="button"
                className="grid size-8 flex-none place-items-center rounded-full text-[#b3b3b3] transition-colors hover:text-white hover:bg-[#282828] active:scale-90 max-sm:hidden"
                aria-label="Collapse sidebar"
                aria-expanded={true}
                title="Collapse sidebar"
                onClick={toggleCollapsed}
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          )}

          <ul className="flex flex-col gap-1">
            {PRIMARY_NAV.map((item) => (
              <NavItemRow key={item.to} item={item} collapsed={collapsed} onNavigate={close} />
            ))}
          </ul>
        </div>

        {/* Bottom Box: Your Library, Sections, Playlists */}
        <div className="flex min-h-0 flex-1 flex-col rounded-[8px] bg-[#121212] border border-white/[0.04] p-2 overflow-hidden">
          {/* Library Header */}
          <div className="flex items-center justify-between px-2 py-2 text-[#b3b3b3] hover:text-white transition-colors">
            <PrefetchLink
              to="/library/playlists"
              className="flex items-center gap-3 text-[14px] font-bold tracking-tight"
              onClick={close}
            >
              <Library size={22} strokeWidth={2} />
              {!collapsed && <span>Your Library</span>}
            </PrefetchLink>
          </div>

          {/* Library Sections & Playlists Scroller */}
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1 [scrollbar-width:thin] [scrollbar-color:#282828_transparent]">
            <ul className="flex flex-col gap-0.5">
              {LIBRARY_NAV.map((item) => (
                <NavItemRow key={item.to} item={item} collapsed={collapsed} onNavigate={close} />
              ))}
            </ul>

            {/* Custom Playlists Divider */}
            {!collapsed && (
              <div className="my-2.5 mx-2 h-px bg-[#282828]" aria-hidden="true" />
            )}

            {/* User YouTube Music Playlists */}
            {signedIn && playlists.data && playlists.data.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {playlists.data.map((playlist) => (
                  <NavItemRow
                    key={playlist.id}
                    item={{
                      to: hrefFor(playlist) ?? '/library/playlists',
                      label: playlist.title,
                      icon: <ListMusic size={18} />,
                    }}
                    collapsed={collapsed}
                    onNavigate={close}
                  />
                ))}
              </ul>
            )}

            {/* Spotify Synced Playlists */}
            {spotifySignedIn && spotifyPlaylists.data && spotifyPlaylists.data.length > 0 && (
              <>
                {!collapsed && (
                  <div className="mt-3 mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-[#727272]">
                    Spotify Playlists
                  </div>
                )}
                <ul className="flex flex-col gap-0.5">
                  {spotifyPlaylists.data.map((p) => (
                    <NavItemRow
                      key={p.id}
                      item={{
                        to: `/spotify/playlist/${encodeURIComponent(p.id)}`,
                        label: p.name,
                        icon: <ListMusic size={18} />,
                      }}
                      collapsed={collapsed}
                      onNavigate={close}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Bottom Account & App Controls */}
          <div className="mt-auto shrink-0 border-t border-[#282828] pt-2 flex flex-col gap-1">
            <ul className="flex flex-col gap-0.5">
              <NavItemRow
                item={{
                  to: '/extension',
                  label: 'Extension',
                  icon: <Puzzle size={18} />,
                }}
                collapsed={collapsed}
                onNavigate={close}
              />
              <NavItemRow
                item={{
                  to: '/about',
                  label: 'About MusoPhone',
                  icon: <Info size={18} />,
                }}
                collapsed={collapsed}
                onNavigate={close}
              />
            </ul>

            <div className="mt-1 w-full px-1">
              <AccountButton compact={collapsed} />
            </div>

            <div className="flex items-center justify-between px-2 pt-1 text-[#b3b3b3]">
              {!collapsed && (
                <div className="flex items-center gap-2">
                  <a
                    className="inline-flex items-center gap-1 text-[11px] text-[#727272] hover:text-white transition-colors"
                    href={config.androidAppUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Android app</span>
                    <ArrowUpRight size={12} />
                  </a>
                  <span className="text-[10px] text-[#535353]">v{config.version}</span>
                </div>
              )}
              <PrefetchNavLink
                to="/settings"
                className="grid size-8 place-items-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#282828] aria-[current=page]:text-white transition-colors ml-auto"
                aria-label="Settings"
                title="Settings"
                onClick={close}
              >
                <Settings size={17} />
              </PrefetchNavLink>
            </div>
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-[calc(var(--z-modal)-1)] hidden bg-black/70 backdrop-blur-xs max-sm:block"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
}
