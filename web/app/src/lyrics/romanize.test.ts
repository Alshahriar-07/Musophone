import { describe, expect, it } from 'vitest';
import { line } from './model';
import { parseTtml } from './parse';
import { hasIndicLyrics, latinTtml, romanizeLines, romanizeText } from './romanize';

describe('Latin lyric mode', () => {
  it('transliterates Bengali into Banglish without diacritics', () => {
    const text = romanizeText('আমি তোমাকে ভালোবাসি');
    expect(text).toBe('ami tomake bhalovasi');
    expect(text).not.toMatch(/\p{Script=Bengali}/u);
  });

  it('transliterates Devanagari into readable Latin', () => {
    const text = romanizeText('मैं तुमसे प्यार करता हूँ');
    expect(text).toContain('main');
    expect(text).toContain('tumase');
    expect(text).toContain('pyara');
    expect(text).not.toMatch(/\p{Script=Devanagari}/u);
  });

  it('keeps English and unsupported scripts as written', () => {
    expect(romanizeText('Stay with me tonight')).toBe('Stay with me tonight');
    expect(romanizeText('你好世界')).toBe('你好世界');
  });

  it('leaves Latin within a mixed line untouched', () => {
    const text = romanizeText('আমি love you');
    expect(text).toBe('ami love you');
  });

  it('keeps line and word timing when it writes TTML', () => {
    const lyric = line(1234, 'আমি', {
      words: [{ startMs: 1234, endMs: 2000, text: 'আমি', syllables: [] }],
      sungUntilMs: 2200,
    });
    expect(hasIndicLyrics([lyric])).toBe(true);
    const ttml = latinTtml([lyric]);
    expect(ttml).toContain('begin="1.234"');
    expect(ttml).toContain('end="2.000"');
    expect(ttml).toContain('ami');
    expect(ttml).not.toContain('আমি');
  });

  it('keeps a line-timed end when there are no word stamps', () => {
    const ttml = latinTtml([line(1234, 'আমি', { sungUntilMs: 2200 })]);
    expect(ttml).toContain('begin="1.234"');
    expect(ttml).toContain('end="2.200"');
  });

  it('returns no Latin document when there is nothing to transliterate', () => {
    expect(latinTtml([line(0, 'English only')])).toBeNull();
  });

  it('prefers a provider’s own romanised word', () => {
    const ttml = `<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata"><body><div>
      <p begin="1.000" end="2.000"><span begin="1.000" end="2.000">আমি</span><span ttm:role="x-roman" begin="1.000" end="2.000">ami</span></p>
    </div></body></tt>`;
    const [parsed] = parseTtml(ttml);
    expect(parsed?.words[0]?.romanizedText).toBe('ami');
    expect(romanizeLines([parsed!])[0]?.text).toBe('ami');
  });
});
