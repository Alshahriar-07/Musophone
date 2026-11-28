import Sanscript from '@indic-transliteration/sanscript';
import { normalizedSyllables, type LyricLine, type LyricWord } from './model';
import { writeTtml } from './ttml';

/**
 * Latin lyric mode. Bengali and Hindi are transliterated, not translated:
 * Bengali becomes Banglish and Devanagari becomes Hinglish. English and other
 * Latin text is left exactly as the provider wrote it, and every line keeps
 * its original timing.
 *
 * The transliteration runs locally in the browser, so a provider outage or a
 * blocked network request never leaves the reader with a blank panel. If a
 * run cannot be transliterated, that run is returned unchanged rather than
 * being replaced with invented text.
 */

const BENGALI = /\p{Script=Bengali}/u;
const DEVANAGARI = /\p{Script=Devanagari}/u;
const INDIC = /[\p{Script=Bengali}\p{Script=Devanagari}]/u;

type IndicScript = 'bengali' | 'devanagari';

function scriptOf(char: string): IndicScript | null {
  if (BENGALI.test(char)) return 'bengali';
  if (DEVANAGARI.test(char)) return 'devanagari';
  return null;
}

/**
 * ITRANS is a lossless Latin scheme, but it marks length and retroflexes with
 * capitals and punctuation (`bhAlovAsi`, `maiM`). Lyrics read better without
 * those marks, which is what Banglish and Hinglish normally drop.
 */
function readableItrans(text: string): string {
  return text
    .replace(/RRi|R\^i/g, 'ri')
    .replace(/LLi|L\^i/g, 'li')
    .replace(/j~n/g, 'gy')
    .replace(/~N|\.N|M/g, 'n')
    .replace(/~n|\.n/g, 'n')
    .replace(/Sh/g, 'sh')
    .replace(/S/g, 'sh')
    .replace(/Ch/g, 'ch')
    .replace(/C/g, 'ch')
    .replace(/Th/g, 'th')
    .replace(/Dh/g, 'dh')
    .replace(/T/g, 't')
    .replace(/D/g, 'd')
    .replace(/N/g, 'n')
    .replace(/R/g, 'r')
    .replace(/L/g, 'l')
    .replace(/A/g, 'a')
    .replace(/I/g, 'i')
    .replace(/U/g, 'u')
    .replace(/\.a/g, "'")
    .replace(/[~^.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function transliterateRun(text: string, script: IndicScript): string {
  try {
    return readableItrans(Sanscript.t(text, script, 'itrans'));
  } catch {
    // A malformed run must not take the line down: show the original script.
    return text;
  }
}

/** Transliterate only the Bengali and Devanagari runs in a mixed line. */
export function romanizeText(text: string): string {
  if (!INDIC.test(text)) return text;
  let out = '';
  let run = '';
  let runScript: IndicScript | null = null;
  const flush = () => {
    if (!run) return;
    out += runScript ? transliterateRun(run, runScript) : run;
    run = '';
  };
  for (const char of Array.from(text)) {
    const script = scriptOf(char);
    if (script !== runScript) {
      flush();
      runScript = script;
    }
    run += char;
  }
  flush();
  return out;
}

export function hasIndicLyrics(lines: LyricLine[]): boolean {
  return lines.some((line) => INDIC.test(line.text) || (line.background ? INDIC.test(line.background.text) : false));
}

function romanizeWord(word: LyricWord): LyricWord {
  const text = word.romanizedText?.trim() || romanizeText(word.text);
  // A provider's word reading keeps its timing; its character boundaries no
  // longer describe the Latin string, so the word is written as one span.
  if (word.romanizedText?.trim()) return { ...word, text, syllables: [] };
  if (!word.syllables.length || text === word.text) return { ...word, text };
  // Syllable boundaries are character indexes. Transliteration changes the
  // length, so carry each syllable's share of the word across proportionally;
  // its start and end times stay exactly where the provider put them.
  const sourceLength = Math.max(1, word.text.length);
  const syllables = word.syllables.map((part) => ({
    ...part,
    startChar: Math.round((part.startChar / sourceLength) * text.length),
    endChar: Math.round((part.endChar / sourceLength) * text.length),
  }));
  return { ...word, text, syllables: normalizedSyllables(syllables, text.length) };
}

function romanizeLine(line: LyricLine): LyricLine {
  const background = line.background ? romanizeLine(line.background) : null;
  const native = line.romanizedText?.trim();
  if (!INDIC.test(line.text)) return background === line.background ? line : { ...line, background };
  // Provider romanisation wins. A word-timed line keeps its word spans, so
  // the wipe still follows the sung words; a line-only reading is used as is.
  if (native && !line.words.length) return { ...line, text: native, background };
  return {
    ...line,
    text: native || romanizeText(line.text),
    words: line.words.map(romanizeWord),
    background,
  };
}

/** The lines in Latin script, with times, line order and duet sides untouched. */
export function romanizeLines(lines: LyricLine[]): LyricLine[] {
  return lines.map(romanizeLine);
}

/** TTML for am-lyrics from the Latin lines; null when there is nothing to romanize. */
export function latinTtml(lines: LyricLine[]): string | null {
  if (!hasIndicLyrics(lines)) return null;
  return writeTtml(romanizeLines(lines), 'en');
}
