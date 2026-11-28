// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { line } from './model';
import { forgetLyrics, lookupLyrics, type LyricsTrack } from './repository';
import { useLyricsSettings } from './settings';
import { detectScriptType, latinTtml, romanizeLines, romanizeText } from './romanize';
import { getMemoryLyrics, makeCacheKey, saveCachedLyrics } from './cache';

const mockLrclib = vi.fn().mockImplementation(async () => ({
  lines: [line(1000, 'line timed from lrclib')],
  ttml: '<tt>line timed</tt>',
}));

const mockLyricsPlus = vi.fn().mockImplementation(async () => ({
  lines: [
    line(1000, 'word', {
      words: [{ startMs: 1000, endMs: 1500, text: 'word', syllables: [] }],
    }),
  ],
  ttml: '<tt>word timed</tt>',
}));

vi.mock('./http', () => ({
  lyricsGet: vi.fn().mockResolvedValue(null),
}));

vi.mock('./providers', () => ({
  lrclib: (...args: unknown[]) => mockLrclib(...args),
  lyricsPlus: (...args: unknown[]) => mockLyricsPlus(...args),
  biniIdentify: vi.fn().mockResolvedValue(null),
  bini: vi.fn().mockResolvedValue(null),
  betterLyrics: vi.fn().mockResolvedValue(null),
  betterLyricsPortato: vi.fn().mockResolvedValue(null),
  paxSenix: vi.fn().mockResolvedValue(null),
  paxSenixSpotify: vi.fn().mockResolvedValue(null),
  paxSenixMusixmatch: vi.fn().mockResolvedValue(null),
  unison: vi.fn().mockResolvedValue(null),
  youtubeCaptions: vi.fn().mockResolvedValue(null),
  youtubeMusicLyrics: vi.fn().mockResolvedValue(null),
  kugou: vi.fn().mockResolvedValue(null),
  musixmatch: vi.fn().mockResolvedValue(null),
  genius: vi.fn().mockResolvedValue(null),
}));

describe('MusoPhone Lyrics Performance & Transliteration', () => {
  beforeEach(() => {
    forgetLyrics();
    vi.clearAllMocks();
  });

  describe('1. Caching & Repeated Lookup Optimization', () => {
    it('caches loaded lyrics in memory and returns instantly on repeated requests', async () => {
      useLyricsSettings.setState({ order: ['lrclib'], disabled: [], preferSyllables: false });
      const track: LyricsTrack = {
        videoId: 'test_vid_cache_1',
        title: 'Cache Song',
        artist: 'Cache Artist',
        durationMs: 180_000,
        album: 'Cache Album',
      };

      // First lookup: queries provider
      const first = await lookupLyrics(track);
      expect(first).not.toBeNull();
      expect(first?.source).toBe('lrclib');
      expect(mockLrclib).toHaveBeenCalledTimes(1);

      // Second lookup: instant hit from cache without provider call
      const second = await lookupLyrics(track);
      expect(second).toEqual(first);
      expect(mockLrclib).toHaveBeenCalledTimes(1); // Provider NOT called again
    });

    it('immediately clears and drops cache when forgetLyrics is triggered', async () => {
      useLyricsSettings.setState({ order: ['lrclib'], disabled: [], preferSyllables: false });
      const track: LyricsTrack = {
        videoId: 'test_vid_cache_2',
        title: 'Forget Song',
        artist: 'Forget Artist',
        durationMs: 200_000,
        album: null,
      };

      await lookupLyrics(track);
      expect(mockLrclib).toHaveBeenCalledTimes(1);

      forgetLyrics();

      await lookupLyrics(track);
      expect(mockLrclib).toHaveBeenCalledTimes(2); // Provider called again after cache drop
    });
  });

  describe('2. Request Cancellation & Song Switching', () => {
    it('aborts lookup and returns null when AbortSignal is cancelled', async () => {
      useLyricsSettings.setState({ order: ['lrclib'], disabled: [], preferSyllables: false });
      const controller = new AbortController();
      controller.abort(); // Pre-aborted signal

      const track: LyricsTrack = {
        videoId: 'aborted_song_1',
        title: 'Aborted',
        artist: 'Aborted',
        durationMs: 180_000,
        album: null,
      };

      const result = await lookupLyrics(track, { signal: controller.signal });
      expect(result).toBeNull();
      expect(mockLrclib).not.toHaveBeenCalled();
    });
  });

  describe('3. Language Detection & Transliteration (Bengali / Banglish, Hindi / Hinglish)', () => {
    it('detects Bengali script accurately', () => {
      const bengaliLines = [
        line(1000, 'আমি বাংলায় গান গাই'),
        line(3000, 'আমি বাংলার গান গাই'),
      ];
      expect(detectScriptType(bengaliLines)).toBe('bengali');
    });

    it('detects Devanagari (Hindi) script accurately', () => {
      const hindiLines = [
        line(1000, 'तुम ही हो अब तुम ही हो'),
        line(3000, 'जिंदगी अब तुम ही हो'),
      ];
      expect(detectScriptType(hindiLines)).toBe('devanagari');
    });

    it('transliterates Bengali to Banglish while preserving punctuation and timing', () => {
      const originalText = 'এই সুন্দর স্বর্ণালী সন্ধ্যায়, এ কী বন্ধনে তুমি বাঁধলে!';
      const banglish = romanizeText(originalText);
      expect(banglish).not.toMatch(/\p{Script=Bengali}/u);
      expect(banglish).toContain('ei sundar');
      expect(banglish).toContain('sandhyaya');
      expect(banglish).toContain('!');
    });

    it('transliterates Hindi to Hinglish while preserving punctuation and timing', () => {
      const originalText = 'कभी कभी मेरे दिल में ख्याल आता है!';
      const hinglish = romanizeText(originalText);
      expect(hinglish).not.toMatch(/\p{Script=Devanagari}/u);
      expect(hinglish).toContain('kabhi');
      expect(hinglish).toContain('dil');
      expect(hinglish).toContain('!');
    });

    it('returns null scriptType and preserves plain English songs untouched', () => {
      const englishLines = [
        line(1000, 'Never gonna give you up'),
        line(3000, 'Never gonna let you down'),
      ];
      expect(detectScriptType(englishLines)).toBeNull();
      expect(latinTtml(englishLines)).toBeNull();
    });

    it('generates valid TTML with synchronized timestamps in Latin script', () => {
      const songLines = [
        line(1500, 'তোমাকে চাই', {
          words: [
            { startMs: 1500, endMs: 2500, text: 'তোমাকে', syllables: [] },
            { startMs: 2500, endMs: 3500, text: 'চাই', syllables: [] },
          ],
        }),
      ];
      const ttml = latinTtml(songLines);
      expect(ttml).not.toBeNull();
      expect(ttml).toContain('begin="1.500"');
      expect(ttml).toContain('tomake');
      expect(ttml).toContain('chai');
      expect(ttml).not.toContain('তোমাকে');
    });
  });
});
