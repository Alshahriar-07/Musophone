import { openDB, type IDBPDatabase } from 'idb';
import type { LyricsResult } from './repository';

interface StoredLyricsEntry {
  key: string;
  videoId: string;
  result: LyricsResult | null;
  savedAt: number;
}

const DB_NAME = 'musophone_lyrics_cache';
const STORE_NAME = 'lyrics';
const DB_VERSION = 1;
const CACHE_TTL_MS = 7 * 24 * 60 * 60_000; // 7 days
const MEMORY_LIMIT = 200;

// High-speed in-memory LRU cache
const memoryCache = new Map<string, { at: number; result: LyricsResult | null }>();

let dbPromise: Promise<IDBPDatabase | null> | null = null;

function getDb(): Promise<IDBPDatabase | null> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      },
    }).catch(() => null);
  }
  return dbPromise;
}

export function makeCacheKey(
  videoId: string,
  only?: string | null,
  sequence?: string,
  preferSyllables?: boolean,
): string {
  return `${videoId}#${only ?? 'best'}#${preferSyllables ? 'syllable' : 'line'}#${sequence ?? ''}`;
}

export function getMemoryLyrics(key: string): LyricsResult | null | undefined {
  const hit = memoryCache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.result;
  }
  memoryCache.delete(key);
  return undefined;
}

export async function getCachedLyrics(key: string): Promise<LyricsResult | null | undefined> {
  const mem = getMemoryLyrics(key);
  if (mem !== undefined) return mem;

  try {
    const db = await getDb();
    if (!db) return undefined;
    const entry = (await db.get(STORE_NAME, key)) as StoredLyricsEntry | undefined;
    if (entry && Date.now() - entry.savedAt < CACHE_TTL_MS) {
      memoryCache.set(key, { at: entry.savedAt, result: entry.result });
      return entry.result;
    }
  } catch {
    // Graceful fallback on storage access error
  }
  return undefined;
}

export async function saveCachedLyrics(
  key: string,
  videoId: string,
  result: LyricsResult | null,
): Promise<void> {
  const now = Date.now();
  memoryCache.set(key, { at: now, result });
  if (memoryCache.size > MEMORY_LIMIT) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }

  try {
    const db = await getDb();
    if (!db) return;
    await db.put(STORE_NAME, {
      key,
      videoId,
      result,
      savedAt: now,
    });
  } catch {
    // Non-blocking: storage quota or disabled mode
  }
}

export function clearMemoryLyricsCache(): void {
  memoryCache.clear();
}

export async function clearAllLyricsCache(): Promise<void> {
  memoryCache.clear();
  try {
    const db = await getDb();
    if (db) await db.clear(STORE_NAME);
  } catch {
    // Graceful fallback
  }
}
