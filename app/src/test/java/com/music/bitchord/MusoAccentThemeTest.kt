package com.music.bitchord

import androidx.compose.ui.graphics.Color
import com.music.bitchord.ui.theme.MusoAccentTheme
import com.music.bitchord.ui.theme.colorScheme
import com.music.bitchord.ui.theme.palette
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.pow

/**
 * The eight accents are a promise about readability, not only about colour.
 *
 * A themed accent is chosen by eye, but the text that sits on it and the text
 * that sits on the themed background are chosen by a formula. These tests are
 * the formula's guard rail: every palette, in both appearances, has to keep
 * body text at WCAG AA and primary text at AAA against the surface it is
 * actually drawn on. They also pin the two properties the theme picker relies
 * on — eight distinct palettes, and an `onAccent` that is actually readable on
 * its accent rather than merely different from it.
 */
class MusoAccentThemeTest {

    /** WCAG 2.1 relative luminance and contrast ratio. */
    private fun luminance(color: Color): Double {
        fun channel(value: Float): Double {
            val v = value.toDouble()
            return if (v <= 0.03928) v / 12.92 else ((v + 0.055) / 1.055).pow(2.4)
        }
        return 0.2126 * channel(color.red) + 0.7152 * channel(color.green) + 0.0722 * channel(color.blue)
    }

    private fun contrast(a: Color, b: Color): Double {
        val la = luminance(a)
        val lb = luminance(b)
        return (maxOf(la, lb) + 0.05) / (minOf(la, lb) + 0.05)
    }

    @Test
    fun `there are exactly eight accent themes`() {
        assertEquals(8, MusoAccentTheme.entries.size)
        assertEquals(
            listOf(
                "MONOCHROME",
                "AESTHETIC_ORANGE",
                "OCEAN_BLUE",
                "MIDNIGHT_PURPLE",
                "SAKURA_PINK",
                "EMERALD_GREEN",
                "CRIMSON_RED",
                "SUNSET_AMBER",
            ),
            MusoAccentTheme.entries.map { it.name },
        )
    }

    @Test
    fun `accent buttons keep their labels readable`() {
        for (theme in MusoAccentTheme.entries) {
            for (dark in listOf(true, false)) {
                val palette = theme.palette(dark)
                val ratio = contrast(palette.accent, palette.onAccent)
                assertTrue(
                    "$theme (dark=$dark) has only ${"%.2f".format(ratio)}:1 on its accent",
                    ratio >= 4.5,
                )
            }
        }
    }

    @Test
    fun `body text keeps AA contrast on every themed background`() {
        for (theme in MusoAccentTheme.entries) {
            for (dark in listOf(true, false)) {
                val scheme = theme.colorScheme(dark)
                val body = contrast(scheme.onBackground, scheme.background)
                val secondary = contrast(scheme.onSurfaceVariant, scheme.background)
                val primary = contrast(scheme.onBackground, scheme.background)
                assertTrue("$theme (dark=$dark) body is ${"%.2f".format(body)}:1", body >= 4.5)
                assertTrue(
                    "$theme (dark=$dark) secondary text is ${"%.2f".format(secondary)}:1",
                    secondary >= 4.5,
                )
                assertTrue(
                    "$theme (dark=$dark) primary text is ${"%.2f".format(primary)}:1",
                    primary >= 7.0,
                )
            }
        }
    }

    @Test
    fun `dark appearance is a deep ground with neutral charcoal surfaces`() {
        val black = Color(0xFF000000)
        for (theme in MusoAccentTheme.entries) {
            val scheme = theme.colorScheme(dark = true)
            // v3.1 correction: the ground is near-black rather than a flat
            // #000 field, so translucent glass has something to sit on. It has
            // to stay dark enough to read as the app's black foundation.
            assertTrue("$theme dark background must not be flat black", scheme.background != black)
            assertTrue(
                "$theme dark background must stay near-black",
                luminance(scheme.background) < 0.004,
            )
            assertTrue("$theme surface must sit above black", luminance(scheme.surface) > 0.0)
            assertTrue(
                "$theme surface must not be a tinted wash",
                luminance(scheme.surface) < 0.02,
            )
            assertTrue("$theme elevated surface", luminance(scheme.surfaceVariant) > luminance(scheme.surface))
            assertTrue("$theme outline", contrast(scheme.outline, scheme.background) >= 1.4)
        }
    }

    @Test
    fun `the selected accent is the only colour that changes`() {
        val backgrounds = MusoAccentTheme.entries.map { it.colorScheme(dark = true).background }.toSet()
        val surfaces = MusoAccentTheme.entries.map { it.colorScheme(dark = true).surface }.toSet()
        assertEquals("all dark themes share one AMOLED background", 1, backgrounds.size)
        assertEquals("all dark themes share one surface foundation", 1, surfaces.size)
        assertEquals(
            MusoAccentTheme.entries.size,
            MusoAccentTheme.entries.map { it.colorScheme(dark = true).primary }.toSet().size,
        )
    }

    @Test
    fun `every theme has its own identity`() {
        assertEquals(
            MusoAccentTheme.entries.size,
            MusoAccentTheme.entries.map { it.palette(dark = true).accent }.toSet().size,
        )
        assertEquals(
            MusoAccentTheme.entries.size,
            MusoAccentTheme.entries.map { it.palette(dark = false).accent }.toSet().size,
        )
    }
}
