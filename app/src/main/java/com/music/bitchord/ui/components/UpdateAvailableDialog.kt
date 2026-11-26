package com.music.bitchord.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.SystemUpdateAlt
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.halilibo.richtext.markdown.Markdown
import com.halilibo.richtext.ui.RichTextStyle
import com.halilibo.richtext.ui.material3.RichText
import com.music.bitchord.BuildConfig
import com.music.bitchord.R
import com.music.bitchord.data.AppUpdateChecker
import com.music.bitchord.data.settings.AppSettings
import com.music.bitchord.ui.theme.accentPalette
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.materials.ExperimentalHazeMaterialsApi
import dev.chrisbanes.haze.materials.HazeMaterials

/** UIAlertController's own metrics: fixed narrow width, 14pt corner, 44pt rows. */
internal val ALERT_WIDTH = 270.dp
internal val ALERT_CORNER = 14.dp
internal val ACTION_HEIGHT = 44.dp

/**
 * The dim behind the alert. Flat on purpose — the glass is the card, and
 * blurring the wallpaper *behind* it too leaves nothing for the card to be
 * frosted against, which is what made this read as a grey box before.
 */
internal val SCRIM_COLOR = Color.Black.copy(alpha = 0.28f)

/** The v3.2 update sheet: wider than the iOS alert, because it carries metadata. */
private val SHEET_WIDTH = 320.dp
private val SHEET_CORNER = 28.dp
private val DOWNLOAD_ROW_HEIGHT = 4.dp
private val NOTES_MAX_HEIGHT = 190.dp

/**
 * The update popup: the one moment the app talks about a newer release.
 *
 * Shaped as a Liquid Glass card rather than a stock Material dialog: a frosted
 * translucent body over the app's own animated backdrop, one accent light at
 * the head, a lit rim, and two honest actions. It sits over the whole app as
 * an overlay rather than an Android [Dialog][androidx.compose.ui.window.Dialog]
 * so it can sample the same [HazeState] as the rest of the glass surfaces.
 *
 * Install is one button with two meanings, decided by [AppUpdateChecker.download]:
 * from Idle it starts the background download, from Ready it opens Android's
 * installer. Skip silences this release for 24 hours — and only this release.
 */
@OptIn(ExperimentalHazeMaterialsApi::class)
@Composable
fun UpdateAvailableDialog(
    update: AppUpdateChecker.UpdateInfo,
    hazeState: HazeState,
    onDismiss: () -> Unit,
    onDownload: () -> Unit,
    onCancelDownload: () -> Unit,
    onInstall: () -> Unit,
    onSkip: () -> Unit,
    onOpenReleasePage: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val reduceDynamicBlur by AppSettings.reduceDynamicBlur.collectAsStateWithLifecycle()
    val state by AppUpdateChecker.download.collectAsStateWithLifecycle()
    val shape = RoundedCornerShape(SHEET_CORNER)
    val accent = accentPalette.accent

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(SCRIM_COLOR)
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() },
                onClick = onDismiss,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier
                .width(SHEET_WIDTH)
                .clip(shape)
                .then(
                    if (reduceDynamicBlur) {
                        Modifier.background(MaterialTheme.colorScheme.surface)
                    } else {
                        Modifier.optimizedHazeEffect(
                            state = hazeState,
                            style = HazeMaterials.thin(MaterialTheme.colorScheme.surface),
                        )
                    },
                )
                // The shared glass film, so this is the same material as every
                // panel and bar behind it, then a single accent bloom at the
                // head — "subtle accent lighting", not a colour wash.
                .musoGlassSurface(shape, depth = 0.9f, body = 0.30f)
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            accent.copy(alpha = 0.18f),
                            accent.copy(alpha = 0.04f),
                            Color.Transparent,
                        ),
                        center = androidx.compose.ui.geometry.Offset(120f, -40f),
                        radius = 420f,
                    ),
                )
                .clickable(
                    indication = null,
                    interactionSource = remember { MutableInteractionSource() },
                    onClick = {},
                ),
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 20.dp, end = 12.dp, top = 12.dp),
                horizontalArrangement = Arrangement.End,
            ) {
                MusoIconButton(
                    icon = Icons.Rounded.Close,
                    contentDescription = stringResource(R.string.close),
                    onClick = onDismiss,
                    size = 30.dp,
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 22.dp)
                    .padding(bottom = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(accent.copy(alpha = 0.16f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Rounded.SystemUpdateAlt,
                        contentDescription = null,
                        tint = accent,
                        modifier = Modifier.size(26.dp),
                    )
                }
                Spacer(Modifier.height(14.dp))
                Text(
                    text = stringResource(R.string.update_dialog_title),
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontSize = 19.sp,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = (-0.2).sp,
                    ),
                    color = MaterialTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.update_dialog_body),
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontSize = 13.sp,
                        lineHeight = 18.sp,
                    ),
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.68f),
                    textAlign = TextAlign.Center,
                )

                Spacer(Modifier.height(16.dp))
                VersionFacts(update = update)

                val downloading = state as? AppUpdateChecker.DownloadState.Downloading
                val verifying = state as? AppUpdateChecker.DownloadState.Verifying
                if (downloading != null || verifying != null) {
                    val fraction = downloading?.fraction ?: verifying?.fraction ?: 0f
                    Spacer(Modifier.height(16.dp))
                    ProgressRow(fraction = fraction)
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = if (verifying != null) {
                            stringResource(R.string.update_verifying)
                        } else {
                            stringResource(R.string.update_downloading_percent, (fraction * 100).toInt())
                        },
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                (state as? AppUpdateChecker.DownloadState.Failed)?.let { failed ->
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = failed.message,
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, lineHeight = 15.sp),
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center,
                    )
                }

                if (!update.notes.isNullOrBlank()) {
                    Spacer(Modifier.height(16.dp))
                    AlertRule()
                    Text(
                        text = stringResource(R.string.whats_new),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 12.dp),
                        style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 0.8.sp),
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                    )
                    Box(
                        modifier = Modifier
                            .padding(top = 6.dp)
                            .heightIn(max = NOTES_MAX_HEIGHT)
                            .verticalScroll(rememberScrollState()),
                    ) {
                        CompositionLocalProvider(LocalContentColor provides MaterialTheme.colorScheme.onSurface) {
                            RichText(style = RichTextStyle.Default) {
                                Markdown(update.notes)
                            }
                        }
                    }
                }

                Spacer(Modifier.height(18.dp))
                when (state) {
                    is AppUpdateChecker.DownloadState.Downloading,
                    is AppUpdateChecker.DownloadState.Verifying,
                    -> GlassAction(
                        label = stringResource(R.string.cancel),
                        onClick = onCancelDownload,
                        filled = false,
                    )

                    is AppUpdateChecker.DownloadState.Ready -> {
                        GlassAction(
                            label = stringResource(R.string.install_now),
                            onClick = onInstall,
                            filled = true,
                        )
                        Spacer(Modifier.height(10.dp))
                        GlassAction(
                            label = stringResource(R.string.skip_one_day),
                            onClick = onSkip,
                            filled = false,
                        )
                    }

                    is AppUpdateChecker.DownloadState.Failed -> {
                        GlassAction(
                            label = stringResource(R.string.try_again),
                            onClick = onDownload,
                            filled = true,
                        )
                        Spacer(Modifier.height(10.dp))
                        GlassAction(
                            label = stringResource(R.string.open_releases_page),
                            onClick = onOpenReleasePage,
                            filled = false,
                        )
                    }

                    else -> {
                        GlassAction(
                            label = stringResource(R.string.install),
                            onClick = onDownload,
                            filled = true,
                        )
                        Spacer(Modifier.height(10.dp))
                        GlassAction(
                            label = stringResource(R.string.skip_one_day),
                            onClick = onSkip,
                            filled = false,
                        )
                    }
                }
            }
        }
    }
}

/** Current → new version, size, and the ABI the download is for. */
@Composable
private fun VersionFacts(update: AppUpdateChecker.UpdateInfo) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f))
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        FactRow(
            label = stringResource(R.string.update_current_version),
            value = BuildConfig.VERSION_NAME,
        )
        FactRow(
            label = stringResource(R.string.update_new_version),
            value = update.version,
            emphasised = true,
        )
        val size = formatBytes(update.sizeBytes)
        if (size != null) {
            FactRow(label = stringResource(R.string.update_download_size), value = size)
        }
    }
}

@Composable
private fun FactRow(label: String, value: String, emphasised: Boolean = false) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = if (emphasised) FontWeight.SemiBold else FontWeight.Medium,
            color = if (emphasised) {
                MaterialTheme.colorScheme.primary
            } else {
                MaterialTheme.colorScheme.onSurface
            },
        )
    }
}

@Composable
private fun ProgressRow(fraction: Float) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(DOWNLOAD_ROW_HEIGHT)
            .clip(RoundedCornerShape(DOWNLOAD_ROW_HEIGHT / 2))
            .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.12f)),
    ) {
        if (fraction > 0f) {
            Box(
                Modifier
                    .fillMaxWidth(fraction.coerceIn(0f, 1f))
                    .height(DOWNLOAD_ROW_HEIGHT)
                    .clip(RoundedCornerShape(DOWNLOAD_ROW_HEIGHT / 2))
                    .background(MaterialTheme.colorScheme.primary),
            )
        }
    }
}

/**
 * A full-width action. The filled one is the accent, the other a glass pill —
 * two clear weights, so Install is the obvious next step and Skip is still a
 * first-class choice rather than a hidden link.
 */
@Composable
private fun GlassAction(label: String, onClick: () -> Unit, filled: Boolean) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val shape = RoundedCornerShape(15.dp)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(46.dp)
            .clip(shape)
            .then(
                if (filled) {
                    Modifier.background(
                        if (pressed) {
                            MaterialTheme.colorScheme.primary.copy(alpha = 0.86f)
                        } else {
                            MaterialTheme.colorScheme.primary
                        },
                    )
                } else {
                    Modifier
                        .musoGlassSurface(shape, depth = 0.6f, body = 0.10f)
                        .background(
                            MaterialTheme.colorScheme.onSurface.copy(
                                alpha = if (pressed) 0.09f else 0.04f,
                            ),
                        )
                },
            )
            .clickable(interactionSource = interaction, indication = null, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge.copy(
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
            ),
            color = if (filled) {
                MaterialTheme.colorScheme.onPrimary
            } else {
                MaterialTheme.colorScheme.onSurface
            },
        )
    }
}

/** "48.2 MB", or null when the release did not publish a size. */
private fun formatBytes(bytes: Long?): String? {
    if (bytes == null || bytes <= 0L) return null
    val mb = bytes / (1024.0 * 1024.0)
    return if (mb >= 1.0) {
        String.format(java.util.Locale.US, "%.1f MB", mb)
    } else {
        String.format(java.util.Locale.US, "%.0f KB", bytes / 1024.0)
    }
}

/**
 * Full-bleed action row. Tinted rather than filled, so the two read as equals
 * in weight and only the font differentiates the default action — the alert's
 * whole point is that neither choice is a trap.
 *
 * [destructive] is the one exception to that: an action that deletes something
 * is red in this lineage, because the point there *is* to break the symmetry.
 * It stays a plain row rather than a filled button, so it reads as a warning
 * and not as the thing to press.
 */
@Composable
internal fun AlertAction(
    label: String,
    emphasised: Boolean,
    onClick: () -> Unit,
    enabled: Boolean = true,
    destructive: Boolean = false,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(ACTION_HEIGHT)
            // iOS washes the whole row instead of drawing a ripple inside it.
            .background(
                if (pressed) MaterialTheme.colorScheme.onSurface.copy(alpha = 0.09f) else Color.Transparent,
            )
            .clickable(
                enabled = enabled,
                indication = null,
                interactionSource = interactionSource,
                onClick = onClick,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyLarge.copy(
                fontSize = 17.sp,
                fontWeight = if (emphasised) FontWeight.W600 else FontWeight.W400,
            ),
            color = (if (destructive) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary)
                .copy(alpha = if (enabled) 1f else 0.4f),
        )
    }
}

/** Hairline separator — [HorizontalDivider][androidx.compose.material3.HorizontalDivider]'s 1dp reads as a bar at this scale. */
@Composable
internal fun AlertRule(modifier: Modifier = Modifier) {
    Box(
        modifier
            .fillMaxWidth()
            .height(0.5.dp)
            .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.14f)),
    )
}
