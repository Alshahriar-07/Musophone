package com.music.bitchord.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * The v2.6 rhythm.
 *
 * v2.5 gave every page a masthead the height of a hero: a brand line over a
 * 38 sp page name, then 26 dp between every section and a 22 dp corner on every
 * panel. Read as a whole app that is a lot of vertical air and a lot of round,
 * and the content a listener actually came for starts low and sits in boxes.
 *
 * v2.6 keeps the same black foundation and the same typeface but changes the
 * proportions: pages open on one compact line, sections are announced by an
 * overline over a 20 sp title instead of a coral bar, and artwork is cut to a
 * 10 dp corner so covers — not cards — carry the screen. Nothing here is a new
 * colour system; accents still come from [MaterialTheme.colorScheme].
 */
object MusoV26 {
    /** The page gutter. Wider than the row inset would suggest, and shared by every page. */
    val Gutter: Dp = PAGE_GUTTER

    /** Room above a page's opening line, under the status bar. */
    val HeaderTop: Dp = 4.dp

    /** Room between a page's opening line and its first section. */
    val HeaderBottom: Dp = 10.dp

    /** Room between two sections of a page. */
    val SectionGap: Dp = 22.dp

    /** The corner of any artwork: a sleeve, a cover, a video still. */
    val CoverRadius: Dp = 10.dp

    /** The corner of a raised surface that is not artwork. */
    val CardRadius: Dp = 14.dp

    /** The corner of a large grouped surface — a settings card, a sheet panel. */
    val GroupRadius: Dp = 18.dp
}

/**
 * A page's opening line, v2.6.
 *
 * One row: an optional overline, the page name set at heading size rather than
 * display size, and at most one control on the trailing edge. A page that
 * needs a sentence of context says it underneath in body type, not in a second
 * heading. This is deliberately short — the first row of content should be
 * visible on every phone without scrolling.
 */
@Composable
fun MusoV26Header(
    title: String,
    modifier: Modifier = Modifier,
    overline: String? = null,
    subtitle: String? = null,
    trailing: (@Composable () -> Unit)? = null,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(
                start = MusoV26.Gutter,
                end = MusoV26.Gutter,
                top = MusoV26.HeaderTop,
                bottom = MusoV26.HeaderBottom,
            ),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                if (!overline.isNullOrBlank()) {
                    Text(
                        text = overline.uppercase(),
                        style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 1.6.sp),
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
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
                Spacer(Modifier.width(10.dp))
                trailing()
            }
        }
        if (!subtitle.isNullOrBlank()) {
            Spacer(Modifier.size(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

/**
 * A section's heading, v2.6.
 *
 * Typography instead of chrome: a quiet overline, a 20 sp title, and an
 * optional count or action on the trailing edge. The 3 dp accent bar every
 * v2.5 section carried is gone — it was the same mark in front of forty
 * different words, and it competed with the covers beside it for the eye.
 */
@Composable
fun MusoV26SectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    overline: String? = null,
    trailingText: String? = null,
    action: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(start = MusoV26.Gutter, end = MusoV26.Gutter, top = 14.dp, bottom = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            if (!overline.isNullOrBlank()) {
                Text(
                    text = overline.uppercase(),
                    style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 1.5.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.62f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onBackground,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        if (!trailingText.isNullOrBlank()) {
            Text(
                text = trailingText,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
            )
        }
        if (action != null && onAction != null) {
            Spacer(Modifier.width(8.dp))
            Text(
                text = action,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.primary,
                maxLines = 1,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable(onClick = onAction)
                    .padding(horizontal = 8.dp, vertical = 6.dp),
            )
        }
    }
}

/**
 * One figure from a listener's own history: the number, then what it counts.
 * Small enough that four of them can sit in a row, which is what keeps the
 * profile's identity at the top of its own page.
 */
@Composable
fun MusoV26Stat(
    value: String,
    label: String,
    modifier: Modifier = Modifier,
) {
    Column(modifier) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 0.9.sp),
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

/**
 * A hairline between grouped rows, inset to clear the row's glyph box.
 * The one divider style v2.6 uses, so a settings card and a profile card
 * separate their rows the same way.
 */
@Composable
fun MusoV26RowDivider(startInset: Dp = 52.dp) {
    Box(
        Modifier
            .fillMaxWidth()
            .padding(start = startInset)
            .height(0.5.dp)
            .background(MaterialTheme.colorScheme.outlineVariant),
    )
}

/** A compact chip's shape — a small rounded rectangle, not a capsule everywhere. */
val MusoV26ChipShape = RoundedCornerShape(10.dp)

/** A one-line fact row used under a compact header. */
@Composable
fun MusoV26Facts(facts: List<String>, modifier: Modifier = Modifier) {
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
