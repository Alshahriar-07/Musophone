package com.music.bitchord.data.lyrics

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/**
 * The script test behind "this sheet is already romanized": the one line of
 * judgement between showing a lyric as written and asking for its Banglish,
 * Hinglish or Tamilish spelling.
 */
class LyricsScriptTest {
    private fun line(text: String) = LyricLine(timeMs = 0L, text = text)

    @Test
    fun banglaNeedsRomanizing() {
        assertTrue(LyricsTranslation.hasNonLatinLetter("আমি তোমায় ভালোবাসি"))
    }

    @Test
    fun hindiNeedsRomanizing() {
        assertTrue(LyricsTranslation.hasNonLatinLetter("तुमसे प्यार करता हूँ"))
    }

    @Test
    fun tamilNeedsRomanizing() {
        assertTrue(LyricsTranslation.hasNonLatinLetter("நான் உன்னை காதலிக்கிறேன்"))
    }

    @Test
    fun latinLyricsAreAlreadyRomanized() {
        assertFalse(LyricsTranslation.hasNonLatinLetter("Ami tomay bhalobashi"))
        assertFalse(LyricsTranslation.hasNonLatinLetter("Tumse pyaar karta hoon"))
        assertFalse(LyricsTranslation.hasNonLatinLetter("I love you"))
    }

    @Test
    fun accentsAndPunctuationAreStillLatin() {
        // A Latin word with diacritics is Latin script, not a reason to ask for
        // a romanization that would come back unchanged.
        assertFalse(LyricsTranslation.hasNonLatinLetter("Café — déjà vu!"))
        assertFalse(LyricsTranslation.hasNonLatinLetter("[Chorus] 1, 2, 3…"))
    }

    @Test
    fun aSheetIsRomanizedIfAnyLineNeedsIt() {
        val mixed = listOf(line("I love you"), line("আমি তোমায় ভালোবাসি"), line(""))
        assertTrue(LyricsTranslation.hasNonLatinScript(mixed))
        assertFalse(LyricsTranslation.hasNonLatinScript(listOf(line("Ami tomay bhalobashi"), line(""))))
    }

    @Test
    fun anEmptySheetIsNeverRomanized() {
        assertFalse(LyricsTranslation.hasNonLatinScript(emptyList()))
        assertFalse(LyricsTranslation.hasNonLatinLetter(""))
    }
}
