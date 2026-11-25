package com.music.bitchord.ui.components

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.music.bitchord.ui.theme.MusoAccentTheme
import com.music.bitchord.ui.theme.palette

/**
 * The eight accent themes, as cards you can see rather than names you have to
 * imagine.
 *
 * Each card draws its own palette — a tinted glass panel, the accent as a two
 * stop wash, and a small set of the controls the theme will recolour — so the
 * choice is made by looking. The selected card grows a hair and carries a check
 * in its own accent, which is the only place the accent is allowed to be loud
 * on this screen.
 */
@Composable
fun AccentThemePicker(
    selected: MusoAccentTheme,
    onSelect: (MusoAccentTheme) -> Unit,
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
) {
    LazyRow(
        modifier = modifier,
        contentPadding = contentPadding,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        items(MusoAccentTheme.entries.toList(), key = { it.name }) { theme ->
            AccentThemeCard(
                theme = theme,
                selected = theme == selected,
                onClick = { onSelect(theme) },
            )
        }
    }
}

@Composable
private fun AccentThemeCard(
    theme: MusoAccentTheme,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val shape = RoundedCornerShape(20.dp)
    val palette = theme.palette(dark = true)
    val lift by animateDpAsState(
        targetValue = if (selected) 0.dp else 2.dp,
        animationSpec = spring(dampingRatio = 0.8f, stiffness = 500f),
        label = "themeCardLift",
    )
    val cardSurface = lerp(MaterialTheme.colorScheme.surface, palette.accent, 0.16f)
    Column(
        modifier = Modifier
            .width(112.dp)
            .padding(top = lift)
            .clip(shape)
            .background(cardSurface)
            .border(
                width = if (selected) 1.5.dp else 0.5.dp,
                color = if (selected) palette.accent else MaterialTheme.colorScheme.outline,
                shape = shape,
            )
            .clickable(role = Role.RadioButton, onClick = onClick)
            .padding(10.dp),
    ) {
        // A miniature of the app: backdrop, one glass pane and the accent bar.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(62.dp)
                .clip(RoundedCornerShape(13.dp))
                .background(
                    Brush.verticalGradient(
                        listOf(palette.backdropTop, palette.backdropBottom),
                    ),
                ),
        ) {
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Box(
                    Modifier
                        .size(34.dp, 5.dp)
                        .clip(CircleShape)
                        .background(palette.accent),
                )
                Box(
                    Modifier
                        .size(22.dp, 4.dp)
                        .clip(CircleShape)
                        .background(palette.accentSecondary.copy(alpha = 0.72f)),
                )
            }
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(7.dp)
                    .size(9.dp)
                    .clip(CircleShape)
                    .background(palette.accentSecondary.copy(alpha = 0.85f)),
            )
            if (selected) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(6.dp)
                        .size(17.dp)
                        .clip(CircleShape)
                        .background(palette.accent),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Check,
                        contentDescription = null,
                        tint = palette.onAccent,
                        modifier = Modifier.size(11.dp),
                    )
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = stringResource(theme.labelRes),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            color = if (selected) {
                MaterialTheme.colorScheme.onSurface
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

/** The row of small colour dots used where a whole preview card is too heavy. */
@Composable
fun AccentThemeDots(
    selected: MusoAccentTheme,
    onSelect: (MusoAccentTheme) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        MusoAccentTheme.entries.forEach { theme ->
            val accent = theme.preview
            Box(
                modifier = Modifier
                    .size(if (theme == selected) 26.dp else 22.dp)
                    .clip(CircleShape)
                    .background(accent)
                    .border(
                        width = if (theme == selected) 2.dp else 0.dp,
                        color = Color.White.copy(alpha = 0.9f),
                        shape = CircleShape,
                    )
                    .clickable(role = Role.RadioButton, onClick = { onSelect(theme) }),
            )
        }
    }
}

