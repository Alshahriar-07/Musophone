package com.music.bitchord.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import kotlin.math.pow
import com.music.bitchord.R

/**
 * The eight accent palettes MusoPhone ships.
 *
 * Every theme keeps one shared glassmorphism foundation — the same deep,
 * tinted obsidian (or the same warm porcelain in light mode), the same glass
 * alphas and the same type scale. Only the accent family moves. That is what
 * makes switching themes feel like changing the light in the room rather than
 * changing app.
 *
 * [CRIMSON_RED] is the default: it is the coral of the original MusoPhone
 * identity, so an existing listener's app looks continuous after updating.
 */
enum class MusoAccentTheme(
    val labelRes: Int,
    /** The dark-appearance accent — also the colour on the theme's preview card. */
    val preview: Color,
    /** A deeper cut for light mode, where the dark-mode accent would fail contrast. */
    val lightPreview: Color,
) {
    MONOCHROME(R.string.accent_monochrome, Color(0xFFE8E8EA), Color(0xFF26262A)),
    AESTHETIC_ORANGE(R.string.accent_orange, Color(0xFFFF8B4D), Color(0xFFC2410C)),
    OCEAN_BLUE(R.string.accent_ocean, Color(0xFF4FB3FF), Color(0xFF0369A1)),
    MIDNIGHT_PURPLE(R.string.accent_purple, Color(0xFFA78BFA), Color(0xFF6D28D9)),
    SAKURA_PINK(R.string.accent_sakura, Color(0xFFFF8FB8), Color(0xFFBE185D)),
    EMERALD_GREEN(R.string.accent_emerald, Color(0xFF3DDC97), Color(0xFF047857)),
    CRIMSON_RED(R.string.accent_crimson, Color(0xFFFF4D67), Color(0xFFC2173A)),
    SUNSET_AMBER(R.string.accent_sunset, Color(0xFFFFC44D), Color(0xFFB45309)),
}

/**
 * The semantic colours of one accent theme. Screens never read these directly
 * where a Material role exists — they read `MaterialTheme.colorScheme` — but
 * the glass and backdrop need values that a [ColorScheme] has no role for.
 */
data class MusoAccentPalette(
    val accent: Color,
    val accentSecondary: Color,
    val onAccent: Color,
    /** The two stops of the app-wide backdrop gradient. */
    val backdropTop: Color,
    val backdropBottom: Color,
    /** The colour a glass surface multiplies over the backdrop. */
    val glassTint: Color,
    val glassBorder: Color,
    /** The glow behind the floating navigation's active destination. */
    val navGlow: Color,
)

val LocalMusoAccentPalette = staticCompositionLocalOf { MusoAccentTheme.CRIMSON_RED.palette(dark = true) }

/** The active accent palette, for glass, gradients and navigation. */
val accentPalette: MusoAccentPalette
    @Composable @ReadOnlyComposable get() = LocalMusoAccentPalette.current

/**
 * The readable foreground for a filled accent surface.
 *
 * A brightness threshold is the obvious rule and the wrong one: coral, amber
 * and orange all sit near it, and whichever side they fall on leaves one of
 * the two choices below 4.5:1. Comparing the two candidates instead picks the
 * one that is actually readable, and one of them always is.
 */
private fun Color.onColorFor(): Color {
    val ink = Color(0xFF130F12)
    val paper = Color(0xFFFFFFFF)
    fun channel(value: Float): Double {
        val v = value.toDouble()
        return if (v <= 0.03928) v / 12.92 else ((v + 0.055) / 1.055).pow(2.4)
    }
    fun relative(c: Color): Double =
        0.2126 * channel(c.red) + 0.7152 * channel(c.green) + 0.0722 * channel(c.blue)
    val l = relative(this)
    fun ratio(other: Color): Double {
        val o = relative(other)
        return (maxOf(l, o) + 0.05) / (minOf(l, o) + 0.05)
    }
    return if (ratio(ink) >= ratio(paper)) ink else paper
}

/**
 * The palette for one accent in one appearance.
 *
 * Surfaces are mixed from a neutral base towards the accent rather than picked
 * by hand, so a theme can never drift out of the shared foundation: the mix
 * ratios are the same for all eight and only the accent changes.
 */
fun MusoAccentTheme.palette(dark: Boolean): MusoAccentPalette {
    val accent = if (dark) preview else lightPreview
    val secondary = if (dark) preview.lightened() else preview.darkened()
    return MusoAccentPalette(
        accent = accent,
        accentSecondary = secondary,
        onAccent = accent.onColorFor(),
        backdropTop = if (dark) {
            lerp(Color(0xFF08070A), accent, 0.10f)
        } else {
            lerp(Color(0xFFF7F5F8), accent, 0.05f)
        },
        backdropBottom = if (dark) {
            lerp(Color(0xFF050406), accent, 0.035f)
        } else {
            lerp(Color(0xFFF2EFF3), accent, 0.09f)
        },
        glassTint = if (dark) Color.White.copy(alpha = 0.055f) else Color.White.copy(alpha = 0.42f),
        glassBorder = if (dark) {
            lerp(Color.White.copy(alpha = 0.16f), accent, 0.30f)
        } else {
            lerp(Color.Black.copy(alpha = 0.08f), accent, 0.22f)
        },
        navGlow = accent.copy(alpha = if (dark) 0.34f else 0.20f),
    )
}

/**
 * Material's roles, derived from one accent palette.
 *
 * `secondary` stays a quieter, desaturated companion instead of a second loud
 * colour; `tertiary` carries the accent's other end so a two-stop gradient
 * belongs to the theme. Error, warning and success are deliberately not themed.
 */
fun MusoAccentTheme.colorScheme(dark: Boolean): ColorScheme {
    val p = palette(dark)
    val base = p.backdropTop
    val surface = lerp(base, p.accent, if (dark) 0.055f else 0.012f)
    val surfaceHigh = lerp(base, p.accent, if (dark) 0.115f else 0.075f)
    val onBase = lerp(if (dark) Color(0xFFFFF7F8) else Color(0xFF1A1418), p.accent, 0.045f)
    val onSurfaceVariant = lerp(if (dark) Color(0xFFC3B8BE) else Color(0xFF6C5F66), p.accent, 0.10f)
    val outline = lerp(base, p.accent, if (dark) 0.38f else 0.30f)
    val outlineVariant = lerp(base, p.accent, if (dark) 0.22f else 0.17f)
    val container = lerp(base, p.accent, if (dark) 0.24f else 0.14f)
    val onContainer = if (dark) lerp(Color.White, p.accent, 0.35f) else lerp(Color(0xFF140F12), p.accent, 0.20f)
    return if (dark) {
        darkColorScheme(
            primary = p.accent,
            onPrimary = p.onAccent,
            primaryContainer = container,
            onPrimaryContainer = onContainer,
            inversePrimary = p.accentSecondary,
            secondary = p.accentSecondary,
            onSecondary = p.accentSecondary.onColorFor(),
            secondaryContainer = lerp(base, p.accentSecondary, 0.22f),
            onSecondaryContainer = onContainer,
            tertiary = p.accentSecondary,
            onTertiary = p.accentSecondary.onColorFor(),
            background = base,
            onBackground = onBase,
            surface = surface,
            onSurface = onBase,
            surfaceVariant = surfaceHigh,
            onSurfaceVariant = onSurfaceVariant,
            surfaceTint = p.accent,
            inverseSurface = lerp(Color.White, p.accent, 0.06f),
            inverseOnSurface = lerp(Color(0xFF171216), p.accent, 0.06f),
            outline = outline,
            outlineVariant = outlineVariant,
            scrim = Color.Black,
            error = Color(0xFFFF6B6B),
            onError = Color(0xFF2A0505),
            errorContainer = Color(0xFF3E1114),
            onErrorContainer = Color(0xFFFFDAD7),
        )
    } else {
        lightColorScheme(
            primary = p.accent,
            onPrimary = p.onAccent,
            primaryContainer = lerp(base, p.accent, 0.16f),
            onPrimaryContainer = lerp(Color(0xFF1A1013), p.accent, 0.22f),
            inversePrimary = p.accentSecondary,
            secondary = p.accentSecondary,
            onSecondary = p.accentSecondary.onColorFor(),
            secondaryContainer = lerp(base, p.accentSecondary, 0.20f),
            onSecondaryContainer = lerp(Color(0xFF1A1013), p.accentSecondary, 0.18f),
            tertiary = p.accentSecondary,
            onTertiary = p.accentSecondary.onColorFor(),
            background = base,
            onBackground = onBase,
            surface = lerp(Color(0xFFFFFCFD), p.accent, 0.015f),
            onSurface = onBase,
            surfaceVariant = surfaceHigh,
            onSurfaceVariant = onSurfaceVariant,
            surfaceTint = p.accent,
            inverseSurface = lerp(Color(0xFF1B1420), p.accent, 0.05f),
            inverseOnSurface = Color(0xFFFFF8FA),
            outline = outline,
            outlineVariant = outlineVariant,
            scrim = Color.Black,
            error = Color(0xFFBA1A1A),
            onError = Color.White,
            errorContainer = Color(0xFFFFDAD6),
            onErrorContainer = Color(0xFF410002),
        )
    }
}

/**
 * The app-wide backdrop: a deep vertical wash plus two very wide accent
 * glows. One brush for the whole app so a page transition never reveals a
 * seam between two screens' backgrounds.
 */
fun MusoAccentTheme.backdropBrush(dark: Boolean): Brush {
    val p = palette(dark)
    return Brush.verticalGradient(
        0f to p.backdropTop,
        0.55f to lerp(p.backdropTop, p.backdropBottom, 0.75f),
        1f to p.backdropBottom,
    )
}

/** The soft accent halo drawn behind the content, at the top of the app. */
fun MusoAccentTheme.glowBrush(dark: Boolean): Brush {
    val p = palette(dark)
    return Brush.radialGradient(
        colors = listOf(
            p.accent.copy(alpha = if (dark) 0.16f else 0.10f),
            Color.Transparent,
        ),
    )
}

private fun Color.darkened(): Color = lerp(this, Color.Black, 0.22f)
private fun Color.lightened(): Color = lerp(this, Color.White, 0.30f)
