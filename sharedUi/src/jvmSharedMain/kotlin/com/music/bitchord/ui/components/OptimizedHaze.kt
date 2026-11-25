package com.music.bitchord.ui.components

import androidx.compose.foundation.background
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import dev.chrisbanes.haze.HazeEffectScope
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.HazeStyle
import dev.chrisbanes.haze.HazeTint

/**
 * A solid surface in place of the old live backdrop blur.
 *
 * MusoPhone v2.2 removed liquid glass and the per-frame backdrop sampling it
 * needed. This keeps the modifier's name and shape so every bar, sheet and
 * dialog keeps its call site, but draws a plain, theme-aware slab instead of
 * blurring whatever is behind it. Nothing is sampled, nothing redraws on
 * scroll, and the surface stays legible in both light and dark appearance.
 *
 * [style] still decides the fill where a caller supplied one (menus stay
 * charcoal, for example); [HazeStyle.Unspecified] falls back to the theme's
 * surface.
 */
@Suppress("UNUSED_PARAMETER")
fun Modifier.optimizedHazeEffect(
    state: HazeState,
    style: HazeStyle = HazeStyle.Unspecified,
    block: (HazeEffectScope.() -> Unit)? = null,
): Modifier = composed {
    val fallback = MaterialTheme.colorScheme.surface.copy(alpha = 0.96f)
    val fill = style.backgroundColor.takeIf { it != Color.Unspecified } ?: fallback
    background(fill)
}

/**
 * The old menu frost, kept as a plain fill.
 *
 * The name survives because the player's drawers and popups still call it, and
 * they want the same material: an opaque charcoal that reads as a panel rather
 * than as a window. Blur radius and noise are gone — they were the expensive
 * half of this material and the half the solid fill replaces.
 */
fun menuFrost(fill: Color, alpha: Float = MENU_FROST_ALPHA): HazeStyle = HazeStyle(
    backgroundColor = fill,
    tints = listOf(HazeTint(fill.copy(alpha = alpha))),
    blurRadius = 0.dp,
    noiseFactor = 0f,
    fallbackTint = HazeTint(fill),
)

/**
 * The live variant of [menuFrost]. Kept for its call sites; it is now the same
 * solid slab as the still one, because there is no live backdrop to sample.
 */
@Suppress("UNUSED_PARAMETER")
fun Modifier.liveMenuFrost(
    state: HazeState,
    fill: Color,
    alpha: Float = MENU_FROST_ALPHA,
): Modifier = background(fill)

/** How much of the slab covers the frost on the player's drawers and popups. */
const val MENU_FROST_ALPHA = 0.80f

/** The menu panel's charcoal, and the player's — which is dark whatever the theme. */
val MenuFrostDark = Color(0xFF1C1C1E)
