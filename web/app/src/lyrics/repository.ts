import { isInstrumentalNotice, withBackgroundVocals, type LyricLine } from './model';
import { lyricsGet } from './http';
import type { Parsed } from './parse';
import * as providers from './providers';
import { enabledSources, useLyricsSettings } from './settings';
import { artistForLyricsSearch, forLyricsSearch, sourceById, type LyricsSourceId } from './sources';
import { writeTtml } from './ttml';
import {
  clearAllLyricsCache,
  clearMemoryLyricsCache,
  getCachedLyrics,
  getMemoryLyrics,
  makeCacheKey,
  saveCachedLyrics,
} from './cache';

/**
 * Where the player gets its lyrics: optimized for instant cached response,
 * parallel non-blocking resolution, and smooth playback synchronization.
 */

export interface LyricsTrack {
  videoId: string;
  title: string;
  artist: string;
  durationMs: number;
  album: string | null;
}

export interface LyricsResult {
  source: LyricsSourceId;
  label: string;
  lines: LyricLine[];
  /** What am-lyrics renders: the provider's own TTML, or ours written from the lines. */
  ttml: string;
  wordSynced: boolean;
  synced: boolean;
}

/** One provider's part in a lookup, for the provider picker. */
export type SourceState = 'pending' | 'found' | 'missing';

const IDENTIFY_TIMEOUT_MS = 2000;

/** The recording behind a video id, once something worked it out (bounded, memory only). */
const isrcs = new Map<string, string>();
function remember(videoId: string, isrc: string | null | undefined) {
  if (!isrc || !videoId) return;
  isrcs.delete(videoId);
  isrcs.set(videoId, isrc);
  if (isrcs.size > 100) isrcs.delete(isrcs.keys().next().value!);
}

/** Drops every remembered answer: a newly allowed host may have what was missing. */
export function forgetLyrics() {
  clearMemoryLyricsCache();
  void clearAllLyricsCache();
}

function toResult(source: LyricsSourceId, parsed: Parsed): LyricsResult {
  const lines = withBackgroundVocals(parsed.lines);
  return {
    source,
    label: sourceById(source)?.label ?? source,
    lines,
    ttml: parsed.ttml ?? writeTtml(lines),
    wordSynced: lines.some((l) => l.words.length),
    synced: lines.some((l) => l.timeMs > 0 || l.words.length),
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

export interface LookupOptions {
  /** Ask this one provider only: the panel's provider picker. */
  only?: LyricsSourceId;
  onSource?: (source: LyricsSourceId, state: SourceState) => void;
  signal?: AbortSignal;
}

export async function lookupLyrics(track: LyricsTrack, { only, onSource, signal }: LookupOptions = {}): Promise<LyricsResult | null> {
  const sequence = only ? [only] : enabledSources();
  if (!sequence.length) return null;
  const { paxsenixKey, preferSyllables } = useLyricsSettings.getState();
  const sequenceKey = sequence.join(',');
  const key = makeCacheKey(track.videoId, only, sequenceKey, preferSyllables);

  // 1. Instant Synchronous Memory Cache Check (0ms)
  const memHit = getMemoryLyrics(key);
  if (memHit !== undefined) {
    if (memHit) onSource?.(memHit.source, 'found');
    return memHit;
  }

  // 2. Persistent IndexedDB Cache Check (Fast Async, survives refresh & navigation)
  const persistedHit = await getCachedLyrics(key);
  if (persistedHit !== undefined) {
    if (persistedHit) onSource?.(persistedHit.source, 'found');
    return persistedHit;
  }

  if (signal?.aborted) return null;

  const query: providers.LyricsQuery = {
    videoId: track.videoId,
    title: forLyricsSearch(track.title),
    artist: artistForLyricsSearch(track.artist),
    durationMs: track.durationMs,
    album: track.album,
    isrc: isrcs.get(track.videoId) ?? null,
  };

  // 3. Concurrently kick off Bini ISRC identification without blocking other providers
  let biniHitPromise: Promise<providers.BiniHit | null>;
  if (!query.isrc && sequence.includes('bini')) {
    biniHitPromise = withTimeout(
      providers
        .biniIdentify(query)
        .then((hit) => {
          if (hit?.isrc) {
            remember(track.videoId, hit.isrc);
            query.isrc = hit.isrc;
          }
          return hit;
        })
        .catch(() => null),
      IDENTIFY_TIMEOUT_MS,
    );
  } else {
    biniHitPromise = Promise.resolve(null);
  }

  const documents = new Map<string, Promise<string | null>>();
  const get: providers.SharedGet = (url: string) => {
    let pending = documents.get(url);
    if (!pending) {
      pending = lyricsGet(url, { signal });
      documents.set(url, pending);
    }
    return pending;
  };

  const fetchFrom = async (source: LyricsSourceId): Promise<Parsed | null> => {
    if (signal?.aborted) return null;
    switch (source) {
      case 'lrc-red':
        return providers.lrcRed(query, get);
      case 'bini': {
        const hit = await biniHitPromise;
        if (signal?.aborted) return null;
        const found = await providers.bini(query, get, hit);
        remember(track.videoId, found?.isrc);
        return found;
      }
      case 'better-lyrics':
        return providers.betterLyrics(query);
      case 'better-lyrics-portato':
        return providers.betterLyricsPortato(query);
      case 'paxsenix':
        return providers.paxSenix(query);
      case 'paxsenix-spotify':
        return providers.paxSenixSpotify(query, paxsenixKey);
      case 'paxsenix-musixmatch':
        return providers.paxSenixMusixmatch(query, paxsenixKey);
      case 'lyrics-plus':
        return providers.lyricsPlus(query);
      case 'unison':
        return providers.unison(query);
      case 'youtube-captions':
        return providers.youtubeCaptions(query);
      case 'youtube-music':
        return providers.youtubeMusicLyrics(query);
      case 'kugou':
        return providers.kugou(query);
      case 'lrclib':
        return providers.lrclib(query);
      case 'musixmatch':
        return providers.musixmatch(query);
      case 'genius':
        return providers.genius(query);
    }
  };

  const run = (source: LyricsSourceId): Promise<LyricsResult | null> => {
    onSource?.(source, 'pending');
    return fetchFrom(source)
      .catch(() => null)
      .then((parsed) => {
        if (signal?.aborted) return null;
        const result =
          parsed?.lines.some((l) => l.text.trim()) && !isInstrumentalNotice(parsed.lines)
            ? toResult(source, parsed)
            : null;
        onSource?.(source, result ? 'found' : 'missing');
        return result;
      });
  };

  // Run all non-Genius providers concurrently
  const jobs = new Map<LyricsSourceId, Promise<LyricsResult | null>>();
  sequence.forEach((source) => {
    if (source !== 'genius') {
      jobs.set(source, run(source));
    }
  });

  // Fast resolution:
  // Check in priority order. If a lower source finishes first, wait a short grace window
  // (max 500ms) for higher-priority pending jobs to finish.
  let lineSynced: LyricsResult | null = null;
  let plain: LyricsResult | null = null;
  let winner: LyricsResult | null = null;

  for (let i = 0; i < sequence.length; i++) {
    const source = sequence[i]!;
    if (signal?.aborted) return null;
    if (source === 'genius' && (lineSynced || plain || winner)) continue;

    const job = jobs.get(source) ?? run(source);
    let found: LyricsResult | null = null;

    try {
      found = await job;
    } catch {
      found = null;
    }

    if (!found) continue;

    if (found.wordSynced) {
      winner = found;
      break;
    }
    if (found.synced && !preferSyllables) {
      winner = found;
      break;
    }
    if (found.synced) lineSynced ??= found;
    else plain ??= found;
  }

  winner ??= lineSynced ?? plain;

  // If nothing found and Genius was in sequence and not yet tried:
  if (!winner && sequence.includes('genius') && !jobs.has('genius') && !signal?.aborted) {
    winner = await run('genius');
  }

  if (!signal?.aborted) {
    void saveCachedLyrics(key, track.videoId, winner);
  }

  return winner;
}
