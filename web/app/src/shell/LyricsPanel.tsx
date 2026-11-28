// Registers <am-lyrics>.
import '@uimaxbai/am-lyrics/am-lyrics.js';
import { Check, ChevronDown, FileText, Languages, Loader2, Minus, Music, Settings2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useCanvas } from '@/data/spotify/canvas';
import { getBridge } from '@/extension/bridge';
import { Menu, MenuHeader, MenuItem, MenuSeparator } from '@/components/Menu';
import { LyricClock } from '@/lyrics/clock';
import { onUngrantedChange, ungrantedOrigins } from '@/lyrics/http';
import type { SourceState } from '@/lyrics/repository';
import { detectScriptType, hasIndicLyrics, latinTtml } from '@/lyrics/romanize';
import { enabledSources, useLyricsSettings } from '@/lyrics/settings';
import { sourceById, type LyricsSourceId } from '@/lyrics/sources';
import { useLyrics, useLyricsUi } from '@/lyrics/useLyrics';
import { getAudio, getPlayhead, usePlayer } from '@/state/player';
import { useUi } from '@/state/ui';
import { LyricsSettings } from './LyricsSettings';

type AmLyricsElement = HTMLElement & {
  currentTime: number;
  ttml?: string;
  interpolate: boolean;
  autoScroll: boolean;
  highlightColor: string;
  fontFamily?: string;
  noBlur?: boolean;
  updateComplete?: Promise<unknown>;
};

/** Hide am-lyrics internal footer without breaking scroll measurements */
const HIDE_FOOTER = '.lyrics-footer { visibility: hidden !important; pointer-events: none !important; }';

/** Completely remove smeary text filter blur so lyrics are razor sharp */
const NO_BLUR =
  '.lyrics-line, .lyrics-line.scroll-exiting, .lyrics-line.pre-active, .lyrics-line.progressive-unblur { filter: none !important; backdrop-filter: none !important; }';

/** Active line: 100% white, sharp, bold, subtle micro-scale */
const ACTIVE_LINE =
  '.lyrics-line.active, .lyrics-line.lyrics-activest { opacity: 1 !important; color: #ffffff !important; font-weight: 700 !important; transform: scale(1.02) !important; filter: none !important; text-shadow: 0 0 16px rgba(255,255,255,0.2) !important; }';

/** Pre & next lines: subtle hierarchy without blur */
const OPACITY_STEPS =
  '.lyrics-line.prev-1, .lyrics-line.next-1, .lyrics-line.pre-active, .lyrics-line.post-active-line { opacity: 0.65 !important; color: rgba(255, 255, 255, 0.85) !important; font-weight: 600 !important; transform: scale(1) !important; filter: none !important; }' +
  '.lyrics-line.prev-2, .lyrics-line.next-2 { opacity: 0.42 !important; color: rgba(255, 255, 255, 0.70) !important; filter: none !important; }' +
  '.lyrics-line.prev-3, .lyrics-line.next-3 { opacity: 0.28 !important; color: rgba(255, 255, 255, 0.55) !important; filter: none !important; }' +
  '.lyrics-line:not(.active):not(.lyrics-activest):not(.prev-1):not(.next-1):not(.prev-2):not(.next-2):not(.prev-3):not(.next-3):not(.pre-active):not(.post-active-line) { opacity: 0.18 !important; color: rgba(255, 255, 255, 0.45) !important; filter: none !important; }';

/** Smooth line transition animations & container scrolling */
const MOTION_RULES =
  '.lyrics-line { transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2, 0, 0, 1), color 0.35s ease !important; cursor: pointer; }' +
  '.lyrics-container { scroll-behavior: smooth !important; scrollbar-width: none !important; }' +
  '.lyrics-container::-webkit-scrollbar { display: none !important; }';

/** Sidebar panel layout & typography */
const PANEL_SIZE =
  ':host(:not([data-full])) .lyrics-container { --lyplus-font-size-base: 22px; --am-lyrics-line-height: 1.35; --am-lyrics-line-spacing: 20px; --am-lyrics-inline-padding: 24px; --lyrics-scroll-padding-top: 35%; }' +
  ":host(:not([data-full])) .lyrics-line { font-family: 'MusoPhone SF Pro Display', 'DM Sans', system-ui, sans-serif !important; letter-spacing: -0.015em; line-height: 1.35; }";

/** Full-screen player sizing */
const FULL_SIZE =
  ':host([data-full]) .lyrics-container { --lyplus-font-size-base: var(--musophone-lyric-size, 34px);' +
  ' --am-lyrics-line-height: 1.25; --am-lyrics-line-spacing: calc(var(--musophone-lyric-size, 34px) * 0.75);' +
  ' --lyrics-scroll-padding-top: 32%; --am-lyrics-inline-padding: 0px; }';

/** The phone's lyric typeface (@font-face in styles/global.css), then the app's. */
const LYRIC_FONT = "'MusoPhone SF Pro Display', 'DM Sans', system-ui, sans-serif";

let lyricFont: Promise<void> | null = null;
let lyricFontLoaded = false;

function loadLyricFont(): Promise<void> {
  lyricFont ??= Promise.race([
    Promise.all([document.fonts.load(`700 28px ${LYRIC_FONT}`), document.fonts.load(`400 28px ${LYRIC_FONT}`)]),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ])
    .catch(() => undefined)
    .then(() => {
      lyricFontLoaded = true;
    });
  return lyricFont;
}

function useLyricFont(): boolean {
  const [ready, setReady] = useState(lyricFontLoaded);
  useEffect(() => {
    if (!ready) void loadLyricFont().then(() => setReady(true));
  }, [ready]);
  return ready;
}

/** Spotify-style clean animated lyrics skeleton */
export function LyricsSkeleton() {
  const linePaddings = ['w-[65%]', 'w-[85%]', 'w-[45%]', 'w-[75%]', 'w-[90%]', 'w-[60%]', 'w-[80%]', 'w-[50%]'];
  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-6 space-y-4 animate-pulse select-none" aria-label="Loading lyrics">
      {linePaddings.map((width, idx) => (
        <div
          key={idx}
          className={`h-5 rounded-[6px] bg-white/[0.07] ${width} ${idx === 2 || idx === 3 ? 'h-6 bg-white/[0.14]' : ''}`}
          style={{
            animationDelay: `${idx * 100}ms`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * am-lyrics, exactly as it is, fed our TTML and a steered clock.
 */
function LyricsView({ ttml, full }: { ttml: string; full: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const element = useRef<AmLyricsElement | null>(null);
  const deck = usePlayer((s) => s.deck);
  const mixing = usePlayer((s) => s.mixing);
  const videoId = usePlayer((s) => s.nowPlaying?.videoId);

  useEffect(() => {
    const el = document.createElement('am-lyrics') as AmLyricsElement;
    el.ttml = ttml;
    el.interpolate = true;
    el.autoScroll = true;
    el.highlightColor = '#ffffff';
    el.fontFamily = LYRIC_FONT;
    el.noBlur = true;
    el.className = 'block min-h-0 flex-1 overflow-hidden [--am-lyrics-highlight-color:#fff]';
    el.toggleAttribute('data-full', full);

    const onLineClick = (event: Event) => {
      const timestamp = (event as CustomEvent<{ timestamp: number }>).detail?.timestamp;
      if (typeof timestamp === 'number') usePlayer.getState().seek(timestamp / 1000);
    };
    el.addEventListener('line-click', onLineClick);
    host.current?.append(el);
    element.current = el;
    const unmounted = new AbortController();

    void Promise.resolve(el.updateComplete).then(() => {
      const root = el.shadowRoot;
      if (!root) return;
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(HIDE_FOOTER + NO_BLUR + ACTIVE_LINE + OPACITY_STEPS + MOTION_RULES + PANEL_SIZE + FULL_SIZE);
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];

      const scroller = root.querySelector('.lyrics-container');
      const target = host.current;
      if (!full || !scroller || !target) return;
      const fade = () => target.style.setProperty('--lyrics-top-fade', `${Math.min(scroller.scrollTop, 80)}px`);
      fade();
      scroller.addEventListener('scroll', fade, { passive: true, signal: unmounted.signal });
    });

    return () => {
      unmounted.abort();
      el.removeEventListener('line-click', onLineClick);
      el.remove();
      element.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (element.current && element.current.ttml !== ttml) element.current.ttml = ttml;
  }, [ttml]);

  useEffect(() => {
    const audio = getAudio();
    const el = element.current;
    if (!audio || !el) return;
    if (mixing) {
      const start = getPlayhead()?.sec ?? audio.currentTime;
      const clock = new LyricClock(start * 1000);
      let discontinuity = 0;
      let last = start;
      let frame = 0;
      const tick = () => {
        const now = performance.now();
        const sec = getPlayhead()?.sec ?? last;
        if (sec < last - 0.15 || sec > last + 1) discontinuity++;
        last = sec;
        el.currentTime = clock.frame(now, Math.trunc(sec * 1000), now, discontinuity);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }
    const clock = new LyricClock(audio.currentTime * 1000);
    let discontinuity = 0;
    let frame = 0;
    const tick = () => {
      const now = performance.now();
      el.currentTime = clock.frame(now, Math.trunc(audio.currentTime * 1000), now, discontinuity);
      frame = requestAnimationFrame(tick);
    };
    const hold = () => {
      cancelAnimationFrame(frame);
      const ms = audio.currentTime * 1000;
      clock.hold(ms, performance.now());
      el.currentTime = ms;
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      clock.restart();
      frame = requestAnimationFrame(tick);
    };
    const onSeeking = () => {
      discontinuity++;
      if (audio.paused) hold();
    };
    audio.addEventListener('seeking', onSeeking);
    audio.addEventListener('seeked', onSeeking);
    audio.addEventListener('pause', hold);
    audio.addEventListener('play', resume);
    if (audio.paused) hold();
    else resume();
    return () => {
      cancelAnimationFrame(frame);
      audio.removeEventListener('seeking', onSeeking);
      audio.removeEventListener('seeked', onSeeking);
      audio.removeEventListener('pause', hold);
      audio.removeEventListener('play', resume);
    };
  }, [deck, videoId, ttml, mixing]);

  return (
    <div
      ref={host}
      className={
        full
          ? 'flex min-h-0 flex-1 [mask-image:linear-gradient(180deg,transparent,#000_var(--lyrics-top-fade,0px),#000_50%,transparent)]'
          : 'flex min-h-0 flex-1 [mask-image:linear-gradient(180deg,transparent_0%,#000_12%,#000_88%,transparent_100%)]'
      }
    />
  );
}

function useUngranted(): string[] {
  return useSyncExternalStore(onUngrantedChange, () => [...ungrantedOrigins].join(','), () => '')
    .split(',')
    .filter(Boolean);
}

const NO_STATES: Partial<Record<LyricsSourceId, SourceState>> = {};

/** The provider picker & language transliteration toolbar */
function ProviderPicker({
  current,
  full,
  scriptType,
}: {
  current: LyricsSourceId | null;
  full: boolean;
  scriptType: 'bengali' | 'devanagari' | 'indic' | null;
}) {
  const videoId = usePlayer((s) => s.nowPlaying?.videoId ?? '');
  const states = useLyricsUi((s) => s.states[videoId]) ?? NO_STATES;
  const picked = useLyricsUi((s) => s.picked[videoId]);
  const pick = useLyricsUi((s) => s.pick);
  const latinScript = useLyricsSettings((s) => s.latinScript);
  const setLatinScript = useLyricsSettings((s) => s.setLatinScript);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [settings, setSettings] = useState(false);
  const close = useCallback(() => setAnchor(null), []);
  const label = current ? sourceById(current)?.label : 'Lyrics';

  return (
    <div
      className={
        full
          ? 'flex items-center justify-between pb-1 opacity-0 transition-opacity duration-200 group-hover/panel:opacity-100 focus-within:opacity-100'
          : 'flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 bg-black/10'
      }
    >
      <button
        className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 type-callout-emphasized text-secondary transition-colors hover:bg-white/[0.06] hover:text-primary"
        aria-haspopup="menu"
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <span>{label}</span>
        <ChevronDown size={14} />
      </button>

      <div className="flex items-center gap-1.5">
        {scriptType && (
          <button
            className={`inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 type-callout-emphasized transition-all duration-150 border ${
              latinScript
                ? 'bg-[#242424] text-white border-white/20 shadow-sm'
                : 'text-secondary hover:bg-white/[0.06] hover:text-primary border-transparent'
            }`}
            aria-label={
              latinScript
                ? 'Show original script'
                : `Show ${scriptType === 'bengali' ? 'Banglish' : scriptType === 'devanagari' ? 'Hinglish' : 'Latin'} script`
            }
            aria-pressed={latinScript}
            title={
              latinScript
                ? `Showing ${scriptType === 'bengali' ? 'Banglish' : scriptType === 'devanagari' ? 'Hinglish' : 'Latin'}. Click to view original ${scriptType === 'bengali' ? 'বাংলা' : scriptType === 'devanagari' ? 'हिंदी' : 'native'} script`
                : `Click to transliterate into ${scriptType === 'bengali' ? 'Banglish' : scriptType === 'devanagari' ? 'Hinglish' : 'Latin'}`
            }
            onClick={() => setLatinScript(!latinScript)}
          >
            <Languages size={13} strokeWidth={2.2} aria-hidden="true" />
            <span className="text-xs font-medium">
              {latinScript
                ? scriptType === 'bengali'
                  ? 'Banglish'
                  : scriptType === 'devanagari'
                    ? 'Hinglish'
                    : 'Latin'
                : scriptType === 'bengali'
                  ? 'বাংলা'
                  : scriptType === 'devanagari'
                    ? 'हिंदी'
                    : 'Aa'}
            </span>
          </button>
        )}

        <button
          className="grid size-7 place-items-center rounded-[6px] text-secondary transition-colors hover:bg-white/[0.06] hover:text-primary"
          aria-label="Lyric settings"
          title="Lyrics settings"
          onClick={() => setSettings(true)}
        >
          <Settings2 size={16} />
        </button>

        {!full && (
          <button
            className="grid size-7 place-items-center rounded-[6px] text-secondary transition-colors hover:bg-white/[0.06] hover:text-primary ml-0.5"
            aria-label="Close lyrics"
            title="Close lyrics"
            onClick={() => useUi.getState().toggleSidePanel('lyrics')}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {anchor && (
        <Menu anchor={anchor} placement="below-end" onClose={close} label="Lyrics provider">
          <MenuItem checked={!picked} onSelect={() => (close(), pick(videoId, null))}>
            Best available
          </MenuItem>
          <MenuSeparator />
          <MenuHeader>Providers</MenuHeader>
          {enabledSources().map((id) => {
            const state = states[id];
            return (
              <MenuItem
                key={id}
                checked={picked === id}
                trailing={
                  state === 'pending' ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : state === 'found' ? (
                    <Check size={13} />
                  ) : state === 'missing' ? (
                    <Minus size={13} />
                  ) : undefined
                }
                onSelect={() => (close(), pick(videoId, id))}
              >
                {sourceById(id)?.label}
              </MenuItem>
            );
          })}
          <MenuSeparator />
          <MenuItem onSelect={() => (close(), setSettings(true))}>Lyric Settings…</MenuItem>
        </Menu>
      )}
      {settings && <LyricsSettings onClose={() => setSettings(false)} />}
    </div>
  );
}

function PermissionNotice({ origins }: { origins: string[] }) {
  const names = origins.map((o) => new URL(o).host.replace(/^www\./, ''));
  return (
    <div className="mx-3 my-1.5 flex items-center gap-2.5 rounded-[8px] bg-quinary px-3 py-2 type-callout text-secondary">
      <span>
        {names.slice(0, 2).join(', ')}
        {names.length > 2 ? ` and ${names.length - 2} more` : ''} need the extension’s permission.
      </span>
      <button
        className="flex-none type-callout-emphasized text-key"
        onClick={() => void getBridge()?.call('lyrics.requestPermissions', { origins })}
      >
        Allow
      </button>
    </div>
  );
}

function CanvasBackdrop({ url }: { url: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const playing = usePlayer((s) => s.status === 'playing' || s.status === 'buffering');
  useEffect(() => setReady(false), [url]);
  useEffect(() => {
    const el = video.current;
    if (!el || !ready) return;
    if (playing) void el.play().catch(() => undefined);
    else el.pause();
  }, [playing, ready]);
  return (
    <video
      ref={video}
      key={url}
      className="absolute top-[-5%] left-[-5%] -z-1 size-[27.5%] origin-[0_0] scale-400 object-cover opacity-0 blur-[3px] transition-opacity duration-600 [mask-image:linear-gradient(to_bottom,rgb(0_0_0/0.7),rgb(0_0_0/0.5))] data-ready:opacity-60"
      data-ready={ready || undefined}
      src={url}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      onCanPlay={() => setReady(true)}
      onError={() => setReady(false)}
    />
  );
}

const panel = 'group/panel relative isolate flex min-h-0 flex-1 flex-col overflow-hidden';
const fullSizes =
  '[--musophone-lyric-size:26px] min-[980px]:[--musophone-lyric-size:30px] min-[1320px]:[--musophone-lyric-size:36px] min-[1680px]:[--musophone-lyric-size:42px]';

export function LyricsPanel({ variant = 'panel' }: { variant?: 'panel' | 'full' }) {
  const lyrics = useLyrics();
  const hasTrack = usePlayer((s) => s.nowPlaying !== null);
  const videoId = usePlayer((s) => s.nowPlaying?.videoId ?? '');
  const picked = useLyricsUi((s) => s.picked[videoId]);
  const ungranted = useUngranted();
  const canvas = useCanvas();
  const fontReady = useLyricFont();
  const latinScript = useLyricsSettings((s) => s.latinScript);
  const result = lyrics.data;
  const latin = useMemo(() => (result && latinScript ? latinTtml(result.lines) : null), [result, latinScript]);
  const scriptType = useMemo(() => (result ? detectScriptType(result.lines) : null), [result]);
  const full = variant === 'full';

  const empty = full
    ? 'flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center type-title-3 text-secondary'
    : 'flex flex-1 flex-col items-center justify-center gap-2.5 px-6 pb-12 text-center text-secondary';
  const emptyTitle = full ? 'type-title-1-emphasized text-primary' : 'type-[600_14px/20px] text-primary';

  return (
    <div className={full ? `${panel} ${fullSizes}` : panel}>
      {canvas && variant === 'panel' && <CanvasBackdrop url={canvas} />}
      <ProviderPicker current={result?.source ?? null} full={full} scriptType={scriptType} />

      {ungranted.length > 0 && !result && !lyrics.isFetching && <PermissionNotice origins={ungranted} />}

      {!hasTrack ? (
        <div className={empty}>
          <div className="grid size-12 place-items-center rounded-[8px] bg-white/[0.04] text-secondary/60 mb-1">
            <Music size={24} />
          </div>
          <p className={emptyTitle}>No lyrics available</p>
          <p className="type-[400_12px/16px] text-secondary/70 max-w-[240px]">Play a song to see its synchronized lyrics here.</p>
        </div>
      ) : (lyrics.isPending && lyrics.fetchStatus !== 'idle') || (result && !fontReady) ? (
        <LyricsSkeleton />
      ) : result ? (
        <LyricsView ttml={latin ?? result.ttml} full={full} />
      ) : picked ? (
        <div className={empty}>
          <div className="grid size-12 place-items-center rounded-[8px] bg-white/[0.04] text-secondary/60 mb-1">
            <FileText size={24} />
          </div>
          <p className={emptyTitle}>Not on {sourceById(picked)?.label ?? 'this provider'}</p>
          <p className="type-[400_12px/16px] text-secondary/70 max-w-[260px]">
            This provider hasn’t got lyrics for this song. Pick another provider or Best available above.
          </p>
        </div>
      ) : (
        <div className={empty}>
          <div className="grid size-12 place-items-center rounded-[8px] bg-white/[0.04] text-secondary/60 mb-1">
            <Music size={24} />
          </div>
          <p className={emptyTitle}>No lyrics found</p>
          <p className="type-[400_12px/16px] text-secondary/70 max-w-[260px]">
            None of the active lyric providers have timings for this song. Try switching providers above.
          </p>
        </div>
      )}
    </div>
  );
}
