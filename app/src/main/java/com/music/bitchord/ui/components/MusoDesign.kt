package com.music.bitchord.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.music.bitchord.data.settings.AppSettings
import com.music.bitchord.ui.icons.MusoIcons

/**
 * The v2.5 spacing and shape scale.
 *
 * Every page reads its gutters, card corners and control sizes from here, so
 * a card on Profile, a card on About and a Settings group are the same object
 * at the same rhythm. Radii are a short ladder — thumbnail, card, sheet — and
 * nothing in between: a screen inventing 18 dp here and 21 dp there is what
 * made the app read as several apps before.
 */
object MusoTokens {
    /**
     * The v2.6 rhythm. v2.5 used a 20 dp gutter, a 22 dp panel and a 26 dp
     * section gap; read across Profile, Settings and About that is a page made
     * of wide margins and large round boxes. v2.6 tightens all three so text
     * lines up with the tab pages' 16 dp gutter and panels read as grouping
     * rather than as cards.
     */
    val Gutter: Dp = 16.dp

    /** Artwork inside rows and tiles. */
    val ThumbRadius: Dp = 10.dp

    /** The standard raised panel. */
    val CardRadius: Dp = 16.dp

    /** A group of rows, and the compact control surfaces. */
    val GroupRadius: Dp = 20.dp

    /** Room between two sections of a page. */
    val SectionGap: Dp = 22.dp

    /** A full tap row's minimum height. */
    val RowHeight: Dp = 54.dp

    /** The glyph box in rows and icon buttons. */
    val GlyphBox: Dp = 36.dp
}

/**
 * The Liquid Glass vocabulary, as tokens.
 *
 * Apple's material is not transparency for its own sake: it is a thin, uneven
 * film — brighter where the light lands at the top, darker where it sits in
 * its own shade — with a lit hairline rim and a translucent body that keeps a
 * little of the page underneath. Those four ingredients are the values here so
 * every panel, pill, icon button and bar in the app is cut from the same film
 * instead of each screen inventing a grey.
 */
object MusoGlass {
    /** The film's strength at the top edge (backwards-compatible alias). */
    const val TintAlpha = 0.085f

    /** What is left of the film at the bottom edge — a whisper, not zero. */
    const val TintFloorAlpha = 0.018f

    /** The lit top of the rim, the neutral middle and the shadowed foot. */
    const val BorderTopAlpha = 0.28f
    const val BorderMidAlpha = 0.12f
    const val BorderBottomAlpha = 0.07f

    /** A press is a film of light under the finger, never a filled disc. */
    const val PressedAlpha = 0.10f

    val BorderWidth: Dp = 0.7.dp

    /**
     * How opaque a panel's body is.
     *
     * v3.2 lowered this from 0.55: with a moving ambient backdrop there is
     * finally something worth seeing through the glass, and a panel that keeps
     * 45% of the page is still comfortably readable for text while reading as
     * a pane rather than a cut-out. Bars go lighter still at their call sites.
     */
    const val BodyAlpha = 0.44f
}

/**
 * The app's one glass surface.
 *
 * A translucent charcoal body, a vertical light-to-shade gradient and a hairline
 * rim that is brightest along the top. Applied to cards, groups, pills, the
 * mini player and the navigation bar, so they read as one material at different
 * depths. [depth] scales the film: 1 is a panel, 0.5 a row or a bar, 0.25 a
 * pressed state.
 */
@Composable
fun Modifier.musoGlassSurface(
    shape: Shape,
    depth: Float = 1f,
    tint: Color = Color.White,
    /** How much of the page the body keeps out. Bars sit lighter than panels. */
    body: Float = MusoGlass.BodyAlpha,
): Modifier = this
    .clip(shape)
    .background(MaterialTheme.colorScheme.surface.copy(alpha = body), shape)
    .background(
        Brush.verticalGradient(
            0f to tint.copy(alpha = (MusoGlass.TintAlpha * depth).coerceIn(0f, 1f)),
            0.52f to tint.copy(alpha = (MusoGlass.TintAlpha * 0.38f * depth).coerceIn(0f, 1f)),
            1f to tint.copy(alpha = (MusoGlass.TintFloorAlpha * depth).coerceIn(0f, 1f)),
        ),
        shape,
    )
    .border(
        width = MusoGlass.BorderWidth,
        brush = Brush.verticalGradient(
            0f to Color.White.copy(alpha = (MusoGlass.BorderTopAlpha * depth).coerceIn(0f, 1f)),
            0.5f to Color.White.copy(alpha = (MusoGlass.BorderMidAlpha * depth).coerceIn(0f, 1f)),
            1f to Color.White.copy(alpha = (MusoGlass.BorderBottomAlpha * depth).coerceIn(0f, 1f)),
        ),
        shape = shape,
    )

/**
 * The app's one raised panel: a sheet of [MusoGlass] with room inside it.
 *
 * No screen should invent its own elevation — a card from Profile, a group on
 * Settings and the activity panel are recognisably the same object at the same
 * depth, and they all lift off the page rather than reading as cut-outs.
 */
@Composable
fun MusoGlassCard(
    modifier: Modifier = Modifier,
    corner: Dp = MusoTokens.CardRadius,
    contentPadding: Dp = 16.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    val shape = RoundedCornerShape(corner)
    Box(
        modifier = modifier
            .musoGlassSurface(shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(contentPadding),
    ) {
        content()
    }
}

/** A small glass capsule for periods, filters and secondary actions. */
@Composable
fun MusoPill(
    text: String,
    selected: Boolean = false,
    onClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    val shape = CircleShape
    val active = MaterialTheme.colorScheme.primary
    Box(
        modifier = modifier
            .then(
                if (selected) {
                    Modifier
                        .clip(shape)
                        .background(active, shape)
                } else {
                    Modifier.musoGlassSurface(shape, depth = 0.55f)
                },
            )
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 15.dp, vertical = 8.dp),
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 1,
        )
    }
}

/**
 * A round glyph control — the gear on Profile, a disclosure, a secondary
 * action. One surface, one size, one press behaviour, wherever it is used.
 */
@Composable
fun MusoIconButton(
    icon: ImageVector,
    contentDescription: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = MusoTokens.GlyphBox,
    tint: Color = MaterialTheme.colorScheme.onSurfaceVariant,
    /** Always transparent by default: a glyph is the control, not the plate. */
    filled: Boolean = false,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    // Down quickly, back up on the spring's short curve: the surface gives
    // under the finger and returns, which is the same gesture the bottom bar's
    // destinations make.
    val scale by animateFloatAsState(
        targetValue = if (pressed) 0.9f else 1f,
        animationSpec = tween(durationMillis = if (pressed) 90 else 180),
        label = "muso-icon-button-press",
    )
    val shape = CircleShape
    Box(
        modifier = modifier
            .size(size)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .then(
                if (filled) {
                    Modifier.musoGlassSurface(shape, depth = 0.7f)
                } else {
                    Modifier.clip(shape)
                },
            )
            .clickable(
                interactionSource = interaction,
                indication = null,
                onClick = onClick,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            tint = tint,
            modifier = Modifier.size(size * 0.5f),
        )
    }
}

/**
 * A destination or an account action as a row: glyph, words, chevron.
 *
 * The shape Profile's account actions and every "open this page" control use.
 * It is a surface of its own rather than a bare text link, so a page made of
 * them keeps the same vertical rhythm as a page made of cards.
 */
@Composable
fun MusoActionRow(
    icon: ImageVector,
    title: String,
    subtitle: String? = null,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    accent: Boolean = false,
) {
    val tint = if (accent) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .heightIn(min = 52.dp)
            .padding(start = 6.dp, end = 12.dp, top = 10.dp, bottom = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Bare glyph, no plate. The row is already the target; a second filled
        // box inside it was what made this list read as four heavy chips.
        Box(Modifier.size(34.dp), contentAlignment = Alignment.Center) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (accent) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(21.dp),
            )
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Medium,
                color = tint,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
        Icon(
            imageVector = MusoIcons.ChevronRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.40f),
            modifier = Modifier.size(16.dp),
        )
    }
}

/**
 * A page's opening block: an eyebrow, a large title and one line of context.
 *
 * The same masthead on every non-tab page, so a Settings section, History and
 * Profile all begin the way the app begins.
 */
@Composable
fun MusoPageHeader(
    title: String,
    eyebrow: String? = null,
    subtitle: String? = null,
    modifier: Modifier = Modifier,
    trailing: (@Composable () -> Unit)? = null,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                if (eyebrow != null) {
                    Text(
                        text = eyebrow.uppercase(),
                        style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 1.4.sp),
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(Modifier.size(2.dp))
                }
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onBackground,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            if (trailing != null) {
                Spacer(Modifier.width(12.dp))
                trailing()
            }
        }
        if (subtitle != null) {
            Spacer(Modifier.size(6.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

/**
 * The app's one empty state: a quiet glyph, a title, a sentence, and at most
 * one action. Used wherever a page can legitimately have nothing to show, so
 * "empty" looks deliberate on every screen instead of like a missing list.
 */
@Composable
fun MusoEmptyState(
    icon: ImageVector,
    title: String,
    body: String,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = MusoTokens.Gutter, vertical = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(58.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(26.dp),
            )
        }
        Spacer(Modifier.size(18.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.size(6.dp))
        Text(
            text = body,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
        if (actionLabel != null && onAction != null) {
            Spacer(Modifier.size(18.dp))
            MusoPill(text = actionLabel, onClick = onAction)
        }
    }
}

/**
 * The app's one loading indicator, where a skeleton would have nothing honest
 * to stand in for: three accent dots breathing in sequence.
 *
 * The breath stops — and the dots sit still, fully lit — under "Reduce
 * animation", which is exactly the promise that setting makes.
 */
@Composable
fun MusoLoadingState(
    modifier: Modifier = Modifier,
    label: String? = null,
) {
    val reduceAnimation by AppSettings.reduceAnimation.collectAsStateWithLifecycle()
    val transition = rememberInfiniteTransition(label = "muso-loading")
    val phase by transition.animateFloat(
        initialValue = 0f,
        targetValue = 3f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1100, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "muso-loading-phase",
    )
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            for (index in 0 until 3) {
                val lit = if (reduceAnimation) 1f else {
                    val distance = kotlin.math.abs(phase - index)
                    (1f - (distance.coerceAtMost(1f)) * 0.72f)
                }
                Box(
                    modifier = Modifier
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.25f + 0.75f * lit)),
                )
            }
        }
        if (label != null) {
            Spacer(Modifier.size(12.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

/**
 * One number from a period, with its unit below it. The number is the loudest
 * thing in the card; the label is an eyebrow and never competes with it.
 */
@Composable
fun MusoStatTile(
    value: String,
    label: String,
    caption: String? = null,
    modifier: Modifier = Modifier,
    accent: Color = MaterialTheme.colorScheme.primary,
) {
    MusoGlassCard(modifier = modifier, corner = 20.dp, contentPadding = 14.dp) {
        Column {
            Box(
                modifier = Modifier
                    .size(18.dp, 3.dp)
                    .clip(CircleShape)
                    .background(accent),
            )
            Spacer(Modifier.size(12.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = label.uppercase(),
                style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 0.7.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
            )
            if (caption != null) {
                Text(
                    text = caption,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.72f),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

/** An eyebrow and editorial heading, with an optional quiet action on the right. */
@Composable
fun MusoSectionHeading(
    title: String,
    eyebrow: String? = null,
    action: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            if (eyebrow != null) {
                Text(
                    text = eyebrow.uppercase(),
                    style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 1.2.sp),
                    color = MaterialTheme.colorScheme.primary,
                )
            }
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground,
            )
        }
        if (action != null && onAction != null) {
            Text(
                text = action,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable(onClick = onAction)
                    .padding(horizontal = 10.dp, vertical = 6.dp),
            )
        }
    }
}

/**
 * Account portrait with a coral ring. Falls back to the listener's initial on a
 * warm gradient, so a signed-out or image-less account still has a face here.
 */
@Composable
fun MusoAvatar(
    name: String?,
    imageUrl: String?,
    modifier: Modifier = Modifier,
    size: Dp = 44.dp,
    onClick: (() -> Unit)? = null,
) {
    val shape = CircleShape
    val initial = name?.trim()?.firstOrNull()?.uppercaseChar()?.toString().orEmpty()
    Box(
        modifier = modifier
            .size(size)
            .clip(shape)
            .background(
                Brush.linearGradient(
                    listOf(
                        MaterialTheme.colorScheme.primary,
                        MaterialTheme.colorScheme.secondary,
                    ),
                ),
            )
            .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.7f), shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier),
        contentAlignment = Alignment.Center,
    ) {
        if (imageUrl.isNullOrBlank()) {
            Text(
                text = initial.ifEmpty { "M" },
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.W700,
                color = MaterialTheme.colorScheme.onPrimary,
            )
        } else {
            AsyncImage(
                model = imageUrl,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(size)
                    .clip(shape),
            )
        }
    }
}

/** A horizontal row of quiet facts, used under the profile header. */
@Composable
fun MusoFactRow(
    facts: List<String>,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        facts.forEachIndexed { index, fact ->
            if (index > 0) {
                Box(
                    Modifier
                        .size(3.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.outline),
                )
            }
            Text(
                text = fact,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}
