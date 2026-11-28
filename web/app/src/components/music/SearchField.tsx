import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSuggestions } from '@/data/music/queries';
import type { MusicItem } from '@/data/music/types';
import { Artwork } from './Artwork';
import { hrefFor } from './links';
import { playTrack, toTrack } from './play';
import { TrackMenu } from './TrackMenu';

type Option = { kind: 'query'; text: string; typed: string; rest: string } | { kind: 'item'; item: MusicItem };

/**
 * The interactive music search field with live suggestions:
 * real-time typeahead, keyboard navigation, artwork, title, subtitle,
 * loading, error, and empty states.
 */
export function SearchField({
  initial = '',
  onSearch,
  placeholder,
  compact = false,
}: {
  initial?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const navigate = useNavigate();
  const suggestions = useSuggestions(open ? value : '');
  const menuOpen = useRef(false);
  const onMenuOpenChange = useCallback((isOpen: boolean) => {
    const wasOpen = menuOpen.current;
    menuOpen.current = isOpen;
    if (!isOpen && wasOpen) setOpen(false);
  }, []);

  useEffect(() => setValue(initial), [initial]);

  // Close dropdown on outside click
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (menuOpen.current) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const options: Option[] = [
    ...(suggestions.data?.queries ?? []).map((q) => ({ kind: 'query' as const, ...q })),
    ...(suggestions.data?.items ?? []).map((item) => ({ kind: 'item' as const, item })),
  ];

  const hasQuery = value.trim().length > 0;
  const showDropdown = open && hasQuery;

  const pick = (option: Option | undefined) => {
    if (menuOpen.current) return;
    setOpen(false);
    setActive(-1);
    if (!option) {
      const q = value.trim();
      if (onSearch) onSearch(q);
      else if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
      return;
    }
    if (option.kind === 'query') {
      setValue(option.text);
      if (onSearch) onSearch(option.text);
      else navigate(`/search?q=${encodeURIComponent(option.text)}`);
      return;
    }
    const href = hrefFor(option.item);
    if (href) navigate(href);
    else playTrack(option.item);
  };

  return (
    <div ref={containerRef} className={`relative ${compact ? 'w-full' : 'w-[min(492px,100%)]'}`}>
      <form
        className="relative flex items-center"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          pick(active >= 0 ? options[active] : undefined);
        }}
      >
        <Search
          size={15}
          strokeWidth={2.4}
          className="pointer-events-none absolute left-3 text-secondary transition-colors"
          aria-hidden="true"
        />
        <input
          ref={input}
          className={`glass-field w-full rounded-pill pl-8 pr-8 type-body text-primary placeholder:text-tertiary transition-[box-shadow,border-color] duration-150 focus-visible:outline-none focus:ring-1 focus:ring-key/40 [&::-webkit-search-cancel-button]:hidden ${
            compact ? 'h-9 text-[13px]' : 'h-10 text-[14px]'
          }`}
          type="search"
          value={value}
          placeholder={placeholder ?? (compact ? 'Search music…' : 'Artists, Songs, Lyrics, and More')}
          aria-label="Search music"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, options.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, -1));
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
        />

        {suggestions.isFetching && (
          <div className="pointer-events-none absolute right-3 grid size-4 place-items-center text-tertiary">
            <Loader2 size={13} className="animate-spin text-key" />
          </div>
        )}

        {value && !suggestions.isFetching && (
          <button
            type="button"
            className="press absolute right-3 grid size-4 place-items-center rounded-full bg-quaternary text-secondary hover:bg-quinary hover:text-primary transition-colors"
            aria-label="Clear search"
            onClick={() => {
              setValue('');
              input.current?.focus();
              if (onSearch) onSearch('');
            }}
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        )}

        {compact && !value && !suggestions.isFetching && (
          <kbd className="pointer-events-none absolute right-3 rounded-[6px] bg-quinary px-1.5 py-0.5 type-caption-2 text-tertiary">
            /
          </kbd>
        )}
      </form>

      {showDropdown && (
        <ul
          id={listId}
          className={`glass-dialog absolute top-[calc(100%+6px)] left-0 z-(--z-contextual-menus) max-h-[min(540px,70vh)] ${
            compact ? 'w-[min(380px,92vw)]' : 'w-full'
          } animate-menu-in overflow-y-auto rounded-[18px] p-1.5 shadow-[0_24px_50px_-16px_rgba(0,0,0,0.65)]`}
          role="listbox"
        >
          {suggestions.isFetching && options.length === 0 && (
            <li className="flex items-center gap-2.5 px-3 py-3 type-body text-secondary">
              <Loader2 size={15} className="animate-spin text-key" />
              <span>Searching YouTube Music…</span>
            </li>
          )}
          {suggestions.isError && options.length === 0 && (
            <li className="px-3 py-3 type-body text-secondary">
              <p className="text-key font-medium">Search encountered an issue.</p>
              <p className="type-caption-2 text-tertiary mt-0.5">Press Enter to search anyway.</p>
            </li>
          )}
          {!suggestions.isFetching && !suggestions.isError && options.length === 0 && (
            <li className="px-3 py-3 type-body text-secondary">
              No matching results for <span className="text-primary font-medium">“{value.trim()}”</span>
            </li>
          )}
          {options.map((option, i) => {
            const item = option.kind === 'item' ? option.item : null;
            const playable = item !== null && (item.kind === 'song' || item.kind === 'video');
            return (
              <li
                key={option.kind === 'query' ? `q-${option.text}` : `i-${option.item.id}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={`${option.kind === 'query' ? hint : `${lockup} ${playable ? lockupMenuCols : lockupCols}`} cursor-pointer`}
                data-active={i === active || undefined}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={(e) => {
                  const target = e.target as HTMLElement | null;
                  if (target?.closest('button[data-track-menu], [role="menuitem"]')) return;
                  pick(option);
                }}
              >
                {option.kind === 'query' ? (
                  <>
                    <Search size={13} strokeWidth={2.4} className="text-tertiary" aria-hidden="true" />
                    <span className="truncate">
                      <span className="font-semibold text-primary">{option.typed}</span>
                      <span>{option.rest}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-[44px] shrink-0">
                      <Artwork
                        src={option.item.thumbnail}
                        displayWidth={44}
                        radius={option.item.kind === 'artist' ? '50%' : 'var(--radius-artwork-small)'}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate type-body text-primary">{option.item.title}</span>
                      <span className="mt-px truncate type-callout text-secondary">
                        {option.item.subtitle || kindLabel(option.item.kind)}
                      </span>
                    </div>
                    {playable && item && (
                      <TrackMenu
                        track={toTrack(item)}
                        onOpenChange={onMenuOpenChange}
                        className="grid size-7 place-items-center rounded-full text-secondary opacity-0 transition-opacity duration-100 ease-in group-hover/option:opacity-100 focus-visible:opacity-100 hover:bg-quinary hover:text-primary data-open:opacity-100"
                      />
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// A suggestion row; hover or keyboard selection paints it in the key colour, white text.
const optionRow =
  'group/option cursor-pointer rounded-[11px] transition-colors data-active:bg-key-glass data-active:text-primary data-active:shadow-[inset_0_0_0_1px_var(--tileHairline)] select-none';
const hint = `${optionRow} grid grid-cols-[16px_minmax(0,1fr)] items-center gap-2.5 px-3 py-2 type-body text-secondary hover:bg-quinary`;
const lockup = `${optionRow} mt-0.5 grid items-center gap-x-2.5 p-1.5 hover:bg-quinary`;
const lockupCols = 'grid-cols-[44px_minmax(0,1fr)]';
const lockupMenuCols = 'grid-cols-[44px_minmax(0,1fr)_auto]';

function kindLabel(kind: MusicItem['kind']): string {
  return (
    {
      song: 'Song',
      video: 'Video',
      album: 'Album',
      playlist: 'Playlist',
      'spotify-playlist': 'Spotify Playlist',
      artist: 'Artist',
      episode: 'Episode',
      podcast: 'Podcast',
      unknown: '',
    }[kind] || ''
  );
}
