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
 * Spotify-Inspired Desktop Search Field:
 * - Subtle dark Regular Glass surface with a thin, soft border
 * - Smooth focus expansion with subtle accent-colored border
 * - Clean icon, clear (X) button, and shortcut badge
 * - Polished dropdown results with artwork and artist byline
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
  const [isFocused, setIsFocused] = useState(false);
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
        setIsFocused(false);
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
    <div
      ref={containerRef}
      className={`relative transition-[width] duration-200 ease-out ${
        compact
          ? isFocused
            ? 'w-[min(380px,38vw)]'
            : 'w-[min(300px,30vw)]'
          : 'w-[min(520px,100%)]'
      }`}
    >
      <form
        className="relative flex items-center"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          pick(active >= 0 ? options[active] : undefined);
        }}
      >
        <Search
          size={16}
          strokeWidth={2.2}
          className={`pointer-events-none absolute left-3.5 transition-colors ${
            isFocused ? 'text-white' : 'text-[#888888]'
          }`}
          aria-hidden="true"
        />
        <input
          ref={input}
          className={`w-full rounded-[6px] bg-[#242424]/90 pl-9.5 pr-8 text-white placeholder:text-[#a0a0a0] border border-white/[0.08] shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-[#2a2a2a] hover:border-white/[0.15] focus:outline-none focus:bg-[#1f1f1f] focus:border-key/60 focus:ring-1 focus:ring-key/40 [&::-webkit-search-cancel-button]:hidden ${
            compact ? 'h-9 text-[13.5px]' : 'h-10 text-[14px]'
          }`}
          type="search"
          value={value}
          placeholder={placeholder ?? 'Search music…'}
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
          onFocus={() => {
            setOpen(true);
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
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
            <Loader2 size={14} className="animate-spin text-key" />
          </div>
        )}

        {value && !suggestions.isFetching && (
          <button
            type="button"
            className="absolute right-2.5 grid size-5 place-items-center rounded-full bg-[#383838] text-[#b3b3b3] hover:text-white hover:bg-[#4a4a4a] transition-colors"
            aria-label="Clear search"
            onClick={() => {
              setValue('');
              input.current?.focus();
              if (onSearch) onSearch('');
            }}
          >
            <X size={12} strokeWidth={2.4} />
          </button>
        )}

        {compact && !value && !suggestions.isFetching && (
          <kbd className="pointer-events-none absolute right-3 rounded-[4px] bg-[#333333] px-1.5 py-0.5 text-[10px] font-semibold text-[#888888]">
            /
          </kbd>
        )}
      </form>

      {/* Floating Suggestions Dropdown */}
      {showDropdown && (
        <ul
          id={listId}
          className={`absolute top-[calc(100%+8px)] left-0 z-(--z-contextual-menus) max-h-[min(500px,65vh)] ${
            compact ? 'w-[min(400px,94vw)]' : 'w-full'
          } overflow-y-auto rounded-[8px] bg-[#181818]/95 p-1.5 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)] border border-white/[0.08] backdrop-blur-xl animate-in fade-in duration-150`}
          role="listbox"
        >
          {suggestions.isFetching && options.length === 0 && (
            <li className="flex items-center gap-3 px-3 py-3 text-[13px] text-[#b3b3b3]">
              <Loader2 size={16} className="animate-spin text-key" />
              <span>Searching YouTube Music…</span>
            </li>
          )}
          {suggestions.isError && options.length === 0 && (
            <li className="px-3 py-3 text-[13px] text-[#b3b3b3]">
              <p className="text-key font-semibold">Search encountered an issue.</p>
              <p className="text-[11.5px] text-[#727272] mt-0.5">Press Enter to search anyway.</p>
            </li>
          )}
          {!suggestions.isFetching && !suggestions.isError && options.length === 0 && (
            <li className="px-3 py-3 text-[13px] text-[#b3b3b3]">
              No matching results for <span className="text-white font-semibold">“{value.trim()}”</span>
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
                className={`${
                  option.kind === 'query' ? hint : `${lockup} ${playable ? lockupMenuCols : lockupCols}`
                } cursor-pointer`}
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
                    <Search size={14} strokeWidth={2.2} className="text-[#727272]" aria-hidden="true" />
                    <span className="truncate text-[13.5px]">
                      <span className="font-bold text-white">{option.typed}</span>
                      <span className="text-[#b3b3b3]">{option.rest}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-[42px] shrink-0">
                      <Artwork
                        src={option.item.thumbnail}
                        displayWidth={42}
                        radius={option.item.kind === 'artist' ? '50%' : '6px'}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13.5px] font-semibold text-white">{option.item.title}</span>
                      <span className="truncate text-[12px] text-[#b3b3b3]">
                        {option.item.subtitle || kindLabel(option.item.kind)}
                      </span>
                    </div>
                    {playable && item && (
                      <TrackMenu
                        track={toTrack(item)}
                        onOpenChange={onMenuOpenChange}
                        className="grid size-7 place-items-center rounded-full text-[#b3b3b3] opacity-0 transition-opacity group-hover/option:opacity-100 hover:text-white hover:bg-white/10"
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

const optionRow =
  'group/option cursor-pointer rounded-[6px] transition-colors data-active:bg-[#282828] data-active:text-white select-none';
const hint = `${optionRow} grid grid-cols-[16px_minmax(0,1fr)] items-center gap-3 px-3 py-2 text-[#b3b3b3] hover:bg-[#282828] hover:text-white`;
const lockup = `${optionRow} mt-0.5 grid items-center gap-x-3 p-1.5 hover:bg-[#282828]`;
const lockupCols = 'grid-cols-[42px_minmax(0,1fr)]';
const lockupMenuCols = 'grid-cols-[42px_minmax(0,1fr)_auto]';

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
