package com.music.bitchord.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.music.bitchord.R
import com.music.bitchord.data.model.Account
import com.music.bitchord.data.model.Song
import com.music.bitchord.data.model.UiState
import com.music.bitchord.data.stats.ListeningStats
import com.music.bitchord.data.stats.RankedEntry
import com.music.bitchord.data.stats.ReplayPeriod
import com.music.bitchord.data.stats.ReplaySummary
import com.music.bitchord.ui.components.MusoActionRow
import com.music.bitchord.ui.components.MusoAvatar
import com.music.bitchord.ui.components.MusoEmptyState
import com.music.bitchord.ui.components.MusoFactRow
import com.music.bitchord.ui.components.MusoGlassCard
import com.music.bitchord.ui.components.MusoIconButton
import com.music.bitchord.ui.components.MusoLoadingState
import com.music.bitchord.ui.components.MusoPill
import com.music.bitchord.ui.components.MusoSectionHeading
import com.music.bitchord.ui.components.MusoStatTile
import com.music.bitchord.ui.components.MusoTokens
import com.music.bitchord.ui.icons.MusoIcons
import java.util.Locale

/**
 * The listener's own page: who they are and what this device has actually
 * heard.
 *
 * Everything numeric comes from [ListeningStats], which records real playback
 * on this phone. Nothing here is a demo statistic, and a new install honestly
 * shows an empty state rather than zero-filled charts. The account history is
 * separate and only used for the "Recently played" rail, because it is the
 * server's list and may be unavailable while the local totals still are not.
 */
@Composable
fun ProfileScreen(
    account: Account?,
    signedIn: Boolean,
    history: UiState<List<Song>>,
    onSignIn: () -> Unit,
    onLoadHistory: () -> Unit,
    onOpenHistory: () -> Unit,
    onOpenReplay: () -> Unit,
    /** The gear: the app's own settings, not the account's. */
    onAppSettings: () -> Unit,
    /** The "Account settings" chip: account, channel and scrobbling. */
    onAccountSettings: () -> Unit,
    /** Opens the account/profile switcher — the avatar's old job in the top bar. */
    onSwitchAccount: () -> Unit,
    onSongClick: (Song) -> Unit,
    contentPadding: PaddingValues,
    modifier: Modifier = Modifier,
) {
    var period by rememberSaveable { mutableStateOf(ReplayPeriod.ALL_TIME) }
    var summary by remember { mutableStateOf<ReplaySummary?>(null) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(period) {
        loading = true
        summary = runCatching { ListeningStats.summary(period) }.getOrNull()
        loading = false
    }
    LaunchedEffect(signedIn) {
        if (signedIn && history !is UiState.Success) onLoadHistory()
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = contentPadding,
    ) {
        item(key = "profile:header") {
            ProfileHeader(
                account = account,
                signedIn = signedIn,
                onAppSettings = onAppSettings,
            )
        }

        item(key = "profile:actions") {
            ProfileActions(
                signedIn = signedIn,
                onOpenReplay = onOpenReplay,
                onOpenHistory = onOpenHistory,
                onSwitchAccount = onSwitchAccount,
                onAccountSettings = onAccountSettings,
            )
        }

        item(key = "profile:period") {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                ReplayPeriod.entries.forEach { option ->
                    MusoPill(
                        text = option.chip,
                        selected = option == period,
                        onClick = { period = option },
                    )
                }
            }
        }

        if (!signedIn) {
            item(key = "profile:signin") {
                MusoGlassCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 8.dp),
                    onClick = onSignIn,
                ) {
                    Column {
                        Text(
                            text = stringResource(R.string.profile_sign_in_title),
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                        Text(
                            text = stringResource(R.string.profile_sign_in_body),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }

        when {
            loading -> item(key = "profile:loading") {
                MusoLoadingState()
            }

            summary == null || summary?.isEmpty == true -> item(key = "profile:empty") {
                MusoEmptyState(
                    icon = MusoIcons.Equalizer,
                    title = stringResource(R.string.profile_empty_title),
                    body = stringResource(R.string.profile_empty_body),
                )
            }

            else -> {
                val stats = summary ?: return@LazyColumn

                item(key = "profile:stats") {
                    Column(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            MusoStatTile(
                                value = formatListeningTime(stats.totalMs),
                                label = stringResource(R.string.profile_listened),
                                caption = stringResource(R.string.profile_plays, stats.totalPlays),
                                modifier = Modifier.weight(1f),
                            )
                            MusoStatTile(
                                value = stats.distinctSongs.toString(),
                                label = stringResource(R.string.profile_songs),
                                caption = stringResource(R.string.profile_distinct),
                                modifier = Modifier.weight(1f),
                                accent = MaterialTheme.colorScheme.tertiary,
                            )
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            MusoStatTile(
                                value = stats.distinctArtists.toString(),
                                label = stringResource(R.string.profile_artists),
                                modifier = Modifier.weight(1f),
                                accent = MaterialTheme.colorScheme.secondary,
                            )
                            MusoStatTile(
                                value = stats.distinctAlbums.toString(),
                                label = stringResource(R.string.profile_albums),
                                modifier = Modifier.weight(1f),
                                accent = MaterialTheme.colorScheme.tertiary,
                            )
                        }
                    }
                }

                if (stats.hourOfDay.any { it > 0 }) {
                    item(key = "profile:activity") {
                        ListeningActivity(
                            hours = stats.hourOfDay,
                            peak = stats.peakHour,
                        )
                    }
                }

                if (history is UiState.Success && history.data.isNotEmpty()) {
                    item(key = "profile:recent-heading") {
                        MusoSectionHeading(
                            title = stringResource(R.string.profile_recently_played),
                            eyebrow = stringResource(R.string.profile_history_eyebrow),
                            action = stringResource(R.string.profile_view_all),
                            onAction = onOpenHistory,
                            modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 22.dp, bottom = 8.dp),
                        )
                    }
                    item(key = "profile:recent") {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            items(history.data.take(10)) { song ->
                                RecentTile(song = song, onClick = { onSongClick(song) })
                            }
                        }
                    }
                }

                if (stats.songs.isNotEmpty()) {
                    item(key = "profile:top-songs-heading") {
                        MusoSectionHeading(
                            title = stringResource(R.string.profile_top_songs),
                            eyebrow = period.chip,
                            modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 8.dp),
                        )
                    }
                    items(stats.songs.take(5), key = { "song:${it.song.videoId}" }) { ranked ->
                        ProfileSongRow(
                            rank = stats.songs.indexOf(ranked) + 1,
                            ranked = ranked,
                            onClick = { onSongClick(ranked.song) },
                        )
                    }
                }

                if (stats.artists.isNotEmpty()) {
                    item(key = "profile:artists-heading") {
                        MusoSectionHeading(
                            title = stringResource(R.string.profile_top_artists),
                            eyebrow = period.chip,
                            modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 10.dp),
                        )
                    }
                    item(key = "profile:artists") {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp),
                        ) {
                            items(stats.artists.take(10)) { artist ->
                                RankedNameCard(entry = artist, circular = true)
                            }
                        }
                    }
                }

                if (stats.albums.isNotEmpty()) {
                    item(key = "profile:albums-heading") {
                        MusoSectionHeading(
                            title = stringResource(R.string.profile_top_albums),
                            eyebrow = period.chip,
                            modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 10.dp),
                        )
                    }
                    item(key = "profile:albums") {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp),
                        ) {
                            items(stats.albums.take(10)) { album ->
                                RankedNameCard(entry = album, circular = false)
                            }
                        }
                    }
                }

                if (stats.playlists.isNotEmpty()) {
                    item(key = "profile:playlists-heading") {
                        MusoSectionHeading(
                            title = stringResource(R.string.profile_top_playlists),
                            eyebrow = period.chip,
                            modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 10.dp),
                        )
                    }
                    item(key = "profile:playlists") {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp),
                        ) {
                            items(stats.playlists.take(10)) { playlist ->
                                RankedNameCard(entry = playlist, circular = false)
                            }
                        }
                    }
                }

                item(key = "profile:footer") {
                    Spacer(Modifier.height(24.dp))
                }
            }
        }
    }
}

/**
 * The account destinations, as one grouped card of rows rather than a row of
 * chips: every way off this page is the same shape, with the same glyph box
 * and the same chevron, and the card is the app's one raised panel.
 */
@Composable
private fun ProfileActions(
    signedIn: Boolean,
    onOpenReplay: () -> Unit,
    onOpenHistory: () -> Unit,
    onSwitchAccount: () -> Unit,
    onAccountSettings: () -> Unit,
) {
    MusoGlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = MusoTokens.Gutter, vertical = 6.dp),
        corner = MusoTokens.GroupRadius,
        contentPadding = 6.dp,
    ) {
        Column {
            MusoActionRow(
                icon = MusoIcons.Rewind,
                title = stringResource(R.string.profile_open_replay),
                onClick = onOpenReplay,
            )
            ProfileActionDivider()
            MusoActionRow(
                icon = MusoIcons.Clock,
                title = stringResource(R.string.profile_open_history),
                onClick = onOpenHistory,
            )
            if (signedIn) {
                ProfileActionDivider()
                MusoActionRow(
                    icon = MusoIcons.SwitchAccount,
                    title = stringResource(R.string.switch_account),
                    onClick = onSwitchAccount,
                )
            }
            ProfileActionDivider()
            MusoActionRow(
                icon = MusoIcons.Profile,
                title = stringResource(R.string.profile_account_settings),
                onClick = onAccountSettings,
            )
        }
    }
}

@Composable
private fun ProfileActionDivider() {
    HorizontalDivider(
        modifier = Modifier.padding(start = 61.dp, end = 14.dp),
        thickness = 0.5.dp,
        color = MaterialTheme.colorScheme.outlineVariant,
    )
}

@Composable
private fun ProfileHeader(
    account: Account?,
    signedIn: Boolean,
    onAppSettings: () -> Unit,
) {
    val accent = MaterialTheme.colorScheme.primary
    Column(
        modifier = Modifier
            .fillMaxWidth()
            // One soft wash of the theme's own light behind the portrait, so
            // the page opens on a lit surface rather than on flat black. It is
            // the same gesture Home's masthead makes, at the same opacity.
            .drawBehind {
                drawRect(
                    brush = Brush.radialGradient(
                        colors = listOf(accent.copy(alpha = 0.11f), Color.Transparent),
                        center = Offset(size.width * 0.12f, 0f),
                        radius = size.width * 0.95f,
                    ),
                )
            }
            .padding(start = MusoTokens.Gutter, end = MusoTokens.Gutter, top = 10.dp, bottom = 6.dp),
    ) {
        Row(verticalAlignment = Alignment.Top) {
            MusoAvatar(
                name = account?.name,
                imageUrl = account?.thumbnailUrl?.takeIf { signedIn },
                size = 82.dp,
            )
            Spacer(Modifier.width(16.dp))
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(top = 4.dp),
            ) {
                Text(
                    text = account?.name?.takeIf { signedIn } ?: stringResource(R.string.profile_guest),
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onBackground,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = account?.email?.takeIf { signedIn && it.isNotBlank() }
                        ?: stringResource(if (signedIn) R.string.signed_in else R.string.not_signed_in),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(9.dp))
                MusoFactRow(
                    facts = listOf(
                        stringResource(R.string.profile_local_stats),
                        stringResource(R.string.profile_private),
                    ),
                )
            }
            Spacer(Modifier.width(8.dp))
            MusoIconButton(
                icon = MusoIcons.Settings,
                contentDescription = stringResource(R.string.settings),
                onClick = onAppSettings,
                tint = MaterialTheme.colorScheme.onSurface,
            )
        }

        Spacer(Modifier.height(26.dp))
        Text(
            text = stringResource(R.string.profile_your_listening).uppercase(),
            style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 1.4.sp),
            color = accent,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = stringResource(R.string.profile_your_listening),
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Spacer(Modifier.height(6.dp))
        Text(
            text = stringResource(R.string.profile_your_listening_body),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ListeningActivity(
    hours: List<Long>,
    peak: Int?,
) {
    val max = (hours.maxOrNull() ?: 0L).coerceAtLeast(1L)
    MusoGlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp),
        corner = 24.dp,
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(
                        text = stringResource(R.string.profile_activity),
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                    Text(
                        text = peak?.let { stringResource(R.string.profile_peak_hour, hourLabel(it)) }
                            ?: stringResource(R.string.profile_activity_body),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Text(
                    text = stringResource(R.string.profile_activity_local),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.tertiary,
                )
            }
            Spacer(Modifier.height(16.dp))
            // One animation for the whole chart, read only in the draw phase.
            // A per-bar animateFloatAsState recomposed every bar on every frame
            // of the reveal; drawing the bars directly keeps that work off the
            // composition and layout threads entirely.
            val reveal by animateFloatAsState(
                targetValue = if (hours.isEmpty()) 0f else 1f,
                animationSpec = tween(durationMillis = 720),
                label = "profile-hour-reveal",
            )
            val barColor = MaterialTheme.colorScheme.primary
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(76.dp)
                    .drawBehind {
                        if (hours.isEmpty()) return@drawBehind
                        val gap = 3.dp.toPx()
                        val width = ((size.width - gap * (hours.size - 1)) / hours.size).coerceAtLeast(1f)
                        val floor = 10.dp.toPx()
                        val range = 66.dp.toPx()
                        val radius = CornerRadius(4.dp.toPx())
                        hours.forEachIndexed { index, ms ->
                            val target = (ms.toFloat() / max.toFloat()).coerceIn(0.04f, 1f)
                            val stagger = (index * 0.012f).coerceAtMost(0.35f)
                            val grow = ((reveal - stagger) / (1f - stagger)).coerceIn(0f, 1f)
                            val height = floor + range * target * grow
                            drawRoundRect(
                                color = if (index == peak) {
                                    barColor
                                } else {
                                    barColor.copy(alpha = 0.22f + target * 0.45f * grow)
                                },
                                topLeft = Offset(index * (width + gap), size.height - height),
                                size = Size(width, height),
                                cornerRadius = radius,
                            )
                        }
                    },
            ) {}
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                listOf("12a", "6a", "12p", "6p").forEach { label ->
                    Text(
                        text = label,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    )
                }
            }
        }
    }
}

@Composable
private fun ProfileSongRow(
    rank: Int,
    ranked: com.music.bitchord.data.stats.RankedSong,
    onClick: () -> Unit,
) {
    val song = ranked.song
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = rank.toString().padStart(2, '0'),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.W700,
            color = if (rank == 1) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.width(28.dp),
        )
        AsyncImage(
            model = song.thumbnailUrl,
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(46.dp)
                .clip(RoundedCornerShape(12.dp)),
        )
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = song.title,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.W600,
                color = MaterialTheme.colorScheme.onBackground,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = song.artist,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        Text(
            text = stringResource(R.string.profile_plays_short, ranked.plays),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun RecentTile(song: Song, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(108.dp)
            .clickable(onClick = onClick),
    ) {
        AsyncImage(
            model = song.thumbnailUrl,
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(108.dp)
                .clip(RoundedCornerShape(18.dp)),
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = song.title,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.W600,
            color = MaterialTheme.colorScheme.onBackground,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            text = song.artist,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Composable
private fun RankedNameCard(entry: RankedEntry, circular: Boolean) {
    Column(modifier = Modifier.width(108.dp)) {
        val shape = if (circular) CircleShape else RoundedCornerShape(18.dp)
        Box(
            modifier = Modifier
                .size(108.dp)
                .clip(shape)
                .background(MaterialTheme.colorScheme.surfaceVariant),
        ) {
            AsyncImage(
                model = entry.artworkUrl,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = entry.title,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.W600,
            color = MaterialTheme.colorScheme.onBackground,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            text = entry.subtitle.orEmpty().ifBlank { formatListeningTime(entry.ms) },
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

private fun formatListeningTime(ms: Long): String {
    val minutes = ms / 60_000
    return when {
        minutes >= 60 -> {
            val hours = minutes / 60
            val rest = minutes % 60
            if (rest == 0L) "${hours}h" else "${hours}h ${rest}m"
        }
        minutes > 0 -> "${minutes}m"
        else -> "0m"
    }
}

private fun hourLabel(hour: Int): String {
    val normalized = ((hour % 24) + 24) % 24
    val suffix = if (normalized < 12) "AM" else "PM"
    val display = when (val h = normalized % 12) {
        0 -> 12
        else -> h
    }
    return String.format(Locale.ROOT, "%d %s", display, suffix)
}
