import { Menu, Search } from 'lucide-react';
import { PrefetchLink } from '@/components/PrefetchLink';
import { LogoMark } from '@/components/icons/LogoMark';
import { useExtension, type ExtensionStatus } from '@/extension/useExtension';
import { useUi } from '@/state/ui';
import { useLocation } from 'react-router';

/** The page a path opens, as the command bar and the document title name it. */
const TITLES: [RegExp, string][] = [
  [/^\/$|^\/home/, 'Home'],
  [/^\/search/, 'Search'],
  [/^\/new/, 'New'],
  [/^\/library/, 'Library'],
  [/^\/album/, 'Album'],
  [/^\/artist/, 'Artist'],
  [/^\/playlist/, 'Playlist'],
  [/^\/browse/, 'Browse'],
  [/^\/spotify/, 'Spotify'],
  [/^\/settings\/listen-together|^\/invite/, 'Listen Together'],
  [/^\/settings\/discord/, 'Discord'],
  [/^\/settings/, 'Settings'],
  [/^\/extension/, 'Extension'],
  [/^\/about/, 'About'],
];

export function pageTitleFor(pathname: string): string | undefined {
  return TITLES.find(([pattern]) => pattern.test(pathname))?.[1];
}

/**
 * The extension's state, in the chrome, everywhere in the app. It only ever
 * says "Connected" when the last handshake got an answer from the extension
 * itself, and it carries the diagnostics sentence as its tooltip otherwise.
 */
function ExtensionChip({ status }: { status: ExtensionStatus }) {
  const checking = status.state === 'checking';
  const connected = status.state === 'present';
  const hint = checking
    ? 'Checking for the MusoPhone extension…'
    : status.state === 'present'
      ? `MusoPhone extension ${status.extension.info.version}, ${status.extension.info.browser}, via ${status.extension.bridge.transport === 'external' ? 'direct messaging' : 'the page relay'}.`
      : status.diagnostics.hint;
  return (
    <PrefetchLink
      to="/extension"
      className="press group flex h-8 shrink-0 items-center gap-2 rounded-pill bg-thin-material px-3 text-secondary hover:text-primary"
      title={hint}
      aria-live="polite"
    >
      <span className="relative grid size-2 place-items-center">
        <span
          className={`absolute inset-0 rounded-full ${
            checking
              ? 'animate-pulse bg-key/60'
              : connected
                ? 'bg-green shadow-[0_0_10px_color-mix(in_srgb,var(--systemGreen)_65%,transparent)]'
                : 'bg-tertiary shadow-[0_0_10px_color-mix(in_srgb,var(--systemTertiary)_55%,transparent)]'
          }`}
          aria-hidden="true"
        />
      </span>
      <span className="type-[600_11px/13px] whitespace-nowrap">
        <span className="max-md:hidden">
          {checking ? 'Checking extension' : connected ? `Connected · v${status.extension.info.version}` : 'Extension not detected'}
        </span>
        <span className="md:hidden">{checking ? 'Checking' : connected ? 'Connected' : 'Not detected'}</span>
      </span>
    </PrefetchLink>
  );
}

/**
 * The command bar above the page sheet: where you are, search, and whether the
 * extension answered. On a phone it is the bar that opens the rail, too.
 */
export function TopBar() {
  const setDrawerOpen = useUi((s) => s.setDrawerOpen);
  const extension = useExtension();
  const { pathname } = useLocation();

  return (
    <header className="flex h-(--mobile-top-bar-height) shrink-0 items-center gap-3 px-1 max-sm:px-0">
      <button
        className="glass-material press grid size-10 shrink-0 place-items-center rounded-[14px] text-primary sm:hidden"
        aria-label="Open menu"
        onClick={() => setDrawerOpen(true)}
      >
        <Menu size={20} strokeWidth={2} />
      </button>
      <PrefetchLink
        to="/home"
        className="inline-flex items-center gap-2 sm:hidden"
        aria-label="MusoPhone, Home"
      >
        <LogoMark size={22} />
        <span className="type-[700_16px/20px] tracking-[-0.02em]">MusoPhone</span>
      </PrefetchLink>

      <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
        <span className="size-1.5 shrink-0 rounded-full bg-key shadow-[0_0_12px_var(--keyColor)]" aria-hidden="true" />
        <p className="truncate type-[600_11px/14px] uppercase tracking-[0.18em] text-secondary">
          {pageTitleFor(pathname) ?? 'MusoPhone'}
        </p>
      </div>

      <div className="flex-1" />

      <PrefetchLink
        to="/search"
        className="glass-field group hidden h-9 w-[min(310px,32vw)] items-center gap-2.5 rounded-pill px-3.5 text-secondary transition-colors hover:text-primary lg:flex"
        aria-label="Search music"
      >
        <Search size={15} strokeWidth={2.2} className="text-tertiary group-hover:text-primary" />
        <span className="type-body">Search music</span>
        <kbd className="ms-auto rounded-[7px] bg-quinary px-1.5 py-0.5 type-caption-2 text-tertiary">/</kbd>
      </PrefetchLink>

      <ExtensionChip status={extension} />
    </header>
  );
}
