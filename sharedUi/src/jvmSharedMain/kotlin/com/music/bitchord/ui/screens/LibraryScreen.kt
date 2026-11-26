package com.music.bitchord.ui.screens

import com.music.bitchord.sharedui.resources.*
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyGridState
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Album
import androidx.compose.material.icons.rounded.Folder
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.QueueMusic
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.sp
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.music.bitchord.data.YtMusicRepository
import com.music.bitchord.data.model.HomeShelf
import com.music.bitchord.data.model.LibraryPage
import com.music.bitchord.data.model.ShelfItem
import com.music.bitchord.data.model.UiState
import com.music.bitchord.data.model.artworkAt
import com.music.bitchord.data.settings.LibrarySort
import com.music.bitchord.ui.AppUi
import com.music.bitchord.ui.components.LIBRARY_GRID_SPACING
import com.music.bitchord.ui.components.MessageState
import com.music.bitchord.ui.components.MusoV26Header
import com.music.bitchord.ui.components.PAGE_GUTTER
import com.music.bitchord.ui.components.PAGE_HEADER_LIFT
import com.music.bitchord.ui.components.PullToRefresh
import com.music.bitchord.ui.components.contextClick
import com.music.bitchord.ui.components.libraryGrid
import com.music.bitchord.ui.components.librarySkeleton
import com.music.bitchord.ui.components.longPressMenuClickable
import com.music.bitchord.ui.icons.BitChordIcons
import com.music.bitchord.ui.components.thumbnailBorder

/**
 * The signed-in library, arranged as a browsable collection rather than a feed.
 *
 * A sticky category rail is the page's spine: All keeps the Replay entry,
 * sources and every shelf; the other categories narrow the page to one kind of
 * collection without throwing away its position or its data. Shelves preview
 * four covers in a two-column grid, because Library is where artwork is the
 * content — a horizontal strip of five small covers made albums and playlists
 * look interchangeable.
 *
 * Nothing is fabricated: categories that the account has no shelf for are not
 * offered, and every card, folder and "See all" opens the same destination it
 * did before.
 */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun LibraryScreen(
    signedIn: Boolean,
    state: UiState<LibraryPage>,
    listState: LazyListState,
    onShelfItemClick: (ShelfItem) -> Unit,
    onShelfItemLongPress: (ShelfItem) -> Unit,
    onNewPlaylist: () -> Unit,
    onImportSpotifyPlaylist: (() -> Unit)? = null,
    onShowAll: (HomeShelf) -> Unit,
    replay: @Composable () -> Unit,
    onSignIn: () -> Unit,
    onRetry: () -> Unit,
    refreshing: Boolean,
    onRefresh: () -> Unit,
    pullState: PullToRefreshState,
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues,
    links: List<LibraryLink>,
    deviceItems: List<ShelfItem>,
    showTitle: Boolean = true,
) {
    val pinnedPlaylists by AppUi.host.pinnedPlaylists.collectAsStateWithLifecycle()
    val onDevice = stringResource(Res.string.on_device)
    val shelves = (state as? UiState.Success)?.data?.shelves.orEmpty()
    val categories = remember(shelves, links, deviceItems) {
        buildList {
            add(LibraryCategory.ALL)
            add(LibraryCategory.PLAYLISTS)
            if (shelves.any { it.category == LibraryCategory.ALBUMS }) add(LibraryCategory.ALBUMS)
            if (shelves.any { it.category == LibraryCategory.ARTISTS }) add(LibraryCategory.ARTISTS)
            if (links.isNotEmpty() || deviceItems.isNotEmpty()) add(LibraryCategory.FOLDERS)
        }
    }
    var category by remember { mutableStateOf(LibraryCategory.ALL) }
    // A category can disappear when an account's shelves change. Falling back
    // to All is better than leaving the page filtered to nothing.
    LaunchedEffect(categories) {
        if (category !in categories) category = LibraryCategory.ALL
    }

    PullToRefresh(
        refreshing = refreshing,
        onRefresh = onRefresh,
        state = pullState,
        modifier = modifier,
    ) {
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
            // Library draws its own heading, so it sits the same distance under
            // the status bar as Home and Explore rather than a whole frosted
            // bar lower — see [PAGE_HEADER_LIFT].
            contentPadding = if (showTitle) {
                PaddingValues(
                    top = (contentPadding.calculateTopPadding() - PAGE_HEADER_LIFT)
                        .coerceAtLeast(0.dp),
                    bottom = contentPadding.calculateBottomPadding(),
                )
            } else {
                contentPadding
            },
        ) {
            if (showTitle) {
                item(key = "library:header") {
                    LibraryHeader(
                        signedIn = signedIn,
                        shelves = shelves,
                        deviceCount = deviceItems.size,
                    )
                }
            }
            item(key = "library:categories") {
                LibraryCategoryRail(
                    categories = categories,
                    selected = category,
                    onSelect = { category = it },
                )
            }
            if (!signedIn) {
                item(key = "library:signed-out") {
                    MessageState(
                        message = stringResource(Res.string.library_sign_in_description),
                        actionLabel = stringResource(Res.string.sign_in),
                        onAction = onSignIn,
                    )
                }
            }
            if (category == LibraryCategory.ALL) {
                item(key = "library:replay") { replay() }
            }
            if ((category == LibraryCategory.ALL || category == LibraryCategory.FOLDERS) &&
                links.isNotEmpty()
            ) {
                item(key = "library:sources") {
                    LibrarySources(links = links, onClick = onShelfItemClick)
                }
            }
            if ((category == LibraryCategory.ALL || category == LibraryCategory.FOLDERS) &&
                deviceItems.isNotEmpty()
            ) {
                item(key = "shelf:$onDevice") {
                    val onDeviceShelf = HomeShelf(title = onDevice, items = deviceItems)
                    LibraryShelfBlock(
                        shelf = onDeviceShelf,
                        onItemClick = onShelfItemClick,
                        onItemLongPress = onShelfItemLongPress,
                        onShowAll = { onShowAll(onDeviceShelf) },
                    )
                }
            }
            if (category == LibraryCategory.FOLDERS) return@LazyColumn

            when (state) {
                is UiState.Loading -> librarySkeleton()
                is UiState.Error -> item(key = "library:error") {
                    MessageState(
                        state.message,
                        actionLabel = stringResource(Res.string.retry),
                        onAction = onRetry,
                    )
                }
                is UiState.Success -> {
                    if (!signedIn) {
                        if (category == LibraryCategory.ALL || category == LibraryCategory.PLAYLISTS) {
                            item(key = "shelf:$PLAYLISTS") {
                                LibraryPlaylistBlock(
                                    shelf = HomeShelf(PLAYLISTS, emptyList()),
                                    onItemClick = onShelfItemClick,
                                    onItemLongPress = onShelfItemLongPress,
                                    onNewPlaylist = onNewPlaylist,
                                    onImportSpotifyPlaylist = onImportSpotifyPlaylist,
                                    onShowAll = { onShowAll(HomeShelf(PLAYLISTS, emptyList())) },
                                )
                            }
                        }
                        return@LazyColumn
                    }
                    val visible = state.data.shelves
                        .filter { category == LibraryCategory.ALL || it.category == category }
                        .sortedBy { it.category?.order ?: Int.MAX_VALUE }
                    val playlistShelf = visible.firstOrNull { it.category == LibraryCategory.PLAYLISTS }
                    if (category in listOf(LibraryCategory.ALL, LibraryCategory.PLAYLISTS) &&
                        playlistShelf == null
                    ) {
                        item(key = "shelf:$PLAYLISTS") {
                            LibraryPlaylistBlock(
                                shelf = HomeShelf(PLAYLISTS, emptyList()),
                                onItemClick = onShelfItemClick,
                                onItemLongPress = onShelfItemLongPress,
                                onNewPlaylist = onNewPlaylist,
                                onImportSpotifyPlaylist = onImportSpotifyPlaylist,
                                onShowAll = { onShowAll(HomeShelf(PLAYLISTS, emptyList())) },
                            )
                        }
                    }
                    visible.forEach { shelf ->
                        item(key = "shelf:${shelf.title}") {
                            if (shelf.category == LibraryCategory.PLAYLISTS) {
                                val pinnedFirst = shelf.pinnedFirst(pinnedPlaylists)
                                LibraryPlaylistBlock(
                                    shelf = pinnedFirst,
                                    onItemClick = onShelfItemClick,
                                    onItemLongPress = onShelfItemLongPress,
                                    onNewPlaylist = onNewPlaylist,
                                    onImportSpotifyPlaylist = onImportSpotifyPlaylist,
                                    onShowAll = { onShowAll(pinnedFirst) },
                                    pinnedPlaylists = pinnedPlaylists,
                                )
                            } else {
                                LibraryShelfBlock(
                                    shelf = shelf,
                                    onItemClick = onShelfItemClick,
                                    onItemLongPress = onShelfItemLongPress,
                                    onShowAll = { onShowAll(shelf) },
                                    pinnedPlaylists = pinnedPlaylists,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * The page's opening line, v2.6: the name at heading size over an honest
 * count of what is in the library, with no brand line and no display masthead.
 * The rail directly under it is the page's spine; anything taller than this
 * pushed the first cover off a short phone's first screen.
 */
@Composable
private fun LibraryHeader(signedIn: Boolean, shelves: List<HomeShelf>, deviceCount: Int) {
    val counts = shelves.mapNotNull { shelf ->
        val category = shelf.category
        if (category == null || shelf.items.isEmpty()) null
        else "${shelf.items.size} ${category.title()}"
    }
    val onDevice = stringResource(Res.string.on_device)
    val summary = when {
        !signedIn -> null
        counts.isNotEmpty() -> counts.joinToString("   ·   ")
        deviceCount > 0 -> "$deviceCount $onDevice"
        else -> null
    }
    MusoV26Header(
        title = stringResource(Res.string.library),
        subtitle = summary,
        modifier = Modifier.padding(top = 4.dp),
    )
}

/**
 * The rail that filters the page, v2.6: text and an underline rather than a row
 * of filled capsules. It reads as a table of contents over the covers instead
 * of as a second row of buttons, and it takes half the height the old chips
 * did, which is what puts the first shelf back on screen.
 */
@Composable
private fun LibraryCategoryRail(
    categories: List<LibraryCategory>,
    selected: LibraryCategory,
    onSelect: (LibraryCategory) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.background),
    ) {
        LazyRow(
            contentPadding = PaddingValues(horizontal = PAGE_GUTTER - 4.dp, vertical = 2.dp),
            horizontalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            items(categories.size, key = { categories[it].name }) { index ->
                val category = categories[index]
                LibraryCategoryChip(
                    category = category,
                    selected = category == selected,
                    onClick = { onSelect(category) },
                )
            }
        }
        Box(
            Modifier
                .fillMaxWidth()
                .height(0.5.dp)
                .background(MaterialTheme.colorScheme.outlineVariant),
        )
    }
}

@Composable
private fun LibraryCategoryChip(
    category: LibraryCategory,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val content by animateColorAsState(
        targetValue = if (selected) {
            MaterialTheme.colorScheme.onBackground
        } else {
            MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.75f)
        },
        label = "libraryChipInk",
    )
    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            category.icon?.let { icon ->
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (selected) MaterialTheme.colorScheme.primary else content,
                    modifier = Modifier.size(15.dp),
                )
            }
            Text(
                text = category.title(),
                style = MaterialTheme.typography.titleSmall,
                color = content,
                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                maxLines = 1,
            )
        }
        Spacer(Modifier.height(5.dp))
        Box(
            Modifier
                .size(width = 18.dp, height = 2.dp)
                .clip(CircleShape)
                .background(
                    if (selected) MaterialTheme.colorScheme.primary else Color.Transparent,
                ),
        )
    }
}

/** The page's section heading: title, honest count and one way to see the rest. */
@Composable
private fun LibrarySectionHeader(
    title: String,
    count: Int,
    onShowAll: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = PAGE_GUTTER, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            if (count > 0) {
                Text(
                    text = "$count",
                    style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 0.9.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.65f),
                )
            }
        }
        if (onShowAll != null) {
            Text(
                text = stringResource(Res.string.show_all),
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable(onClick = onShowAll)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
            )
        }
    }
}

/** One shelf previewed as a 2 × 2 cover grid. */
@Composable
private fun LibraryShelfBlock(
    shelf: HomeShelf,
    onItemClick: (ShelfItem) -> Unit,
    onItemLongPress: (ShelfItem) -> Unit,
    onShowAll: () -> Unit,
    pinnedPlaylists: List<String> = emptyList(),
) {
    val visible = shelf.items.take(LIBRARY_PREVIEW_LIMIT)
    Column(Modifier.padding(bottom = 20.dp)) {
        LibrarySectionHeader(
            title = localizeShelfTitle(shelf.title),
            count = shelf.items.size,
            onShowAll = onShowAll.takeIf { shelf.items.size > LIBRARY_PREVIEW_LIMIT },
        )
        Column(
            modifier = Modifier.padding(horizontal = PAGE_GUTTER),
            verticalArrangement = Arrangement.spacedBy(LIBRARY_GRID_SPACING),
        ) {
            visible.chunked(2).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(LIBRARY_GRID_SPACING)) {
                    row.forEach { item ->
                        LibraryTile(
                            item = item,
                            onClick = { onItemClick(item) },
                            onLongPress = { onItemLongPress(item) },
                            isPinned = item.browseId != null && item.browseId in pinnedPlaylists,
                            modifier = Modifier.weight(1f),
                        )
                    }
                    if (row.size == 1) Spacer(Modifier.weight(1f))
                }
            }
        }
    }
}

/** Playlists lead with creation, then show the same cover grid as every shelf. */
@Composable
private fun LibraryPlaylistBlock(
    shelf: HomeShelf,
    onItemClick: (ShelfItem) -> Unit,
    onItemLongPress: (ShelfItem) -> Unit,
    onNewPlaylist: () -> Unit,
    onImportSpotifyPlaylist: (() -> Unit)?,
    onShowAll: () -> Unit,
    pinnedPlaylists: List<String> = emptyList(),
) {
    val visible = shelf.items.take(LIBRARY_PREVIEW_LIMIT)
    Column(Modifier.padding(bottom = 20.dp)) {
        LibrarySectionHeader(
            title = stringResource(Res.string.playlists),
            count = shelf.items.size,
            onShowAll = onShowAll.takeIf { shelf.items.size > LIBRARY_PREVIEW_LIMIT },
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = PAGE_GUTTER),
            horizontalArrangement = Arrangement.spacedBy(LIBRARY_GRID_SPACING),
        ) {
            LibraryQuickAction(
                icon = BitChordIcons.Plus,
                label = stringResource(Res.string.new_playlist),
                onClick = onNewPlaylist,
                modifier = Modifier.weight(1f),
            )
            if (onImportSpotifyPlaylist != null) {
                LibraryQuickAction(
                    icon = BitChordIcons.Download,
                    label = stringResource(Res.string.import_spotify),
                    onClick = onImportSpotifyPlaylist,
                    modifier = Modifier.weight(1f),
                    logo = Res.drawable.spotify_logo,
                )
            } else {
                Spacer(Modifier.weight(1f))
            }
        }
        if (visible.isNotEmpty()) {
            Spacer(Modifier.height(14.dp))
            Column(
                modifier = Modifier.padding(horizontal = PAGE_GUTTER),
                verticalArrangement = Arrangement.spacedBy(LIBRARY_GRID_SPACING),
            ) {
                visible.chunked(2).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(LIBRARY_GRID_SPACING)) {
                        row.forEach { item ->
                            LibraryTile(
                                item = item,
                                onClick = { onItemClick(item) },
                                onLongPress = { onItemLongPress(item) },
                                isPinned = item.browseId != null && item.browseId in pinnedPlaylists,
                                modifier = Modifier.weight(1f),
                            )
                        }
                        if (row.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

/** A compact creation row, deliberately smaller than a playlist cover. */
@Composable
private fun LibraryQuickAction(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    logo: DrawableResource? = null,
) {
    val shape = RoundedCornerShape(16.dp)
    Row(
        modifier = modifier
            .heightIn(min = 62.dp)
            .clip(shape)
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant, shape)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(
            modifier = Modifier
                .size(34.dp)
                .clip(RoundedCornerShape(11.dp))
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center,
        ) {
            if (logo != null) {
                Icon(
                    painter = painterResource(logo),
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp),
                )
            } else {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp),
                )
            }
        }
        Text(
            text = label,
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.SemiBold,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

/** One collection cover: the artwork carries the card, text stays quiet under it. */
@Composable
internal fun LibraryTile(
    item: ShelfItem,
    onClick: () -> Unit,
    onLongPress: (() -> Unit)?,
    modifier: Modifier = Modifier,
    isPinned: Boolean = false,
) {
    val shape = RoundedCornerShape(12.dp)
    Column(
        modifier = modifier
            .longPressMenuClickable(onClick = onClick, onLongClick = onLongPress)
            .contextClick(onLongPress),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(shape)
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .thumbnailBorder(shape),
        ) {
            if (item.thumbnailUrl != null) {
                AsyncImage(
                    model = item.thumbnailUrl.artworkAt(LIBRARY_ART_PX),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            } else {
                Icon(
                    imageVector = Icons.Rounded.Album,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier
                        .size(38.dp)
                        .align(Alignment.Center),
                )
            }
            if (isPinned) {
                Row(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.background.copy(alpha = 0.82f))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Icon(
                        imageVector = BitChordIcons.Pin,
                        contentDescription = stringResource(Res.string.pinned),
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(12.dp),
                    )
                }
            }
        }
        Spacer(Modifier.height(9.dp))
        Text(
            text = item.title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onBackground,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        val subtitle = localizeCardSubtitle(item.subtitle)
        if (subtitle.isNotBlank()) {
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

/** Device folders and connected services as two-column entry tiles. */
@Composable
private fun LibrarySources(links: List<LibraryLink>, onClick: (ShelfItem) -> Unit) {
    Column(Modifier.padding(bottom = 20.dp)) {
        LibrarySectionHeader(
            title = stringResource(Res.string.sources),
            count = links.size,
            onShowAll = null,
        )
        Column(
            modifier = Modifier.padding(horizontal = PAGE_GUTTER),
            verticalArrangement = Arrangement.spacedBy(LIBRARY_GRID_SPACING),
        ) {
            links.chunked(2).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(LIBRARY_GRID_SPACING)) {
                    row.forEach { link ->
                        LibrarySourceTile(
                            link = link,
                            onClick = { onClick(link.item) },
                            modifier = Modifier.weight(1f),
                        )
                    }
                    if (row.size == 1) Spacer(Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun LibrarySourceTile(
    link: LibraryLink,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val shape = RoundedCornerShape(16.dp)
    Row(
        modifier = modifier
            .heightIn(min = 78.dp)
            .clip(shape)
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant, shape)
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center,
        ) {
            if (link.logo != null) {
                Icon(
                    painter = painterResource(link.logo),
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(22.dp),
                )
            } else {
                Icon(
                    imageVector = link.icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(22.dp),
                )
            }
        }
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = link.item.title,
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = link.item.subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        Icon(
            imageVector = BitChordIcons.ChevronRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.55f),
            modifier = Modifier.size(16.dp),
        )
    }
}

private const val LIBRARY_PREVIEW_LIMIT = 4
private const val LIBRARY_ART_PX = 640

/** One of the Library's folder rows: the page [item] opens, behind [icon]. */
data class LibraryLink(val item: ShelfItem, val icon: ImageVector, val logo: DrawableResource? = null)

private enum class LibraryCategory(
    val order: Int,
    val icon: ImageVector?,
) {
    ALL(0, null),
    PLAYLISTS(1, Icons.Rounded.QueueMusic),
    ALBUMS(2, Icons.Rounded.Album),
    ARTISTS(3, Icons.Rounded.Person),
    FOLDERS(4, Icons.Rounded.Folder),
    ;

    @Composable
    fun title(): String = stringResource(
        when (this) {
            ALL -> Res.string.all
            PLAYLISTS -> Res.string.playlists
            ALBUMS -> Res.string.albums
            ARTISTS -> Res.string.artists
            FOLDERS -> Res.string.folders
        },
    )
}

private val HomeShelf.category: LibraryCategory?
    get() = when {
        title.equals(YtMusicRepository.PLAYLISTS_SHELF, ignoreCase = true) -> LibraryCategory.PLAYLISTS
        title.equals("Albums", ignoreCase = true) -> LibraryCategory.ALBUMS
        title.equals("Artists", ignoreCase = true) -> LibraryCategory.ARTISTS
        else -> null
    }

/**
 * Everything a Library shelf's "Show all" opens onto — the same covers, at the
 * same [libraryGrid] width, run down the screen instead of stopping at one row.
 */
@Composable
fun LibraryGridPage(
    shelf: HomeShelf,
    gridState: LazyGridState,
    onItemClick: (ShelfItem) -> Unit,
    onItemLongPress: (ShelfItem) -> Unit,
    contentPadding: PaddingValues,
    modifier: Modifier = Modifier,
    onNewPlaylist: (() -> Unit)? = null,
) {
    val pinnedPlaylists by AppUi.host.pinnedPlaylists.collectAsStateWithLifecycle()
    val librarySort by AppUi.host.librarySort.collectAsStateWithLifecycle()
    val sortedShelf = shelf.pinnedFirst(pinnedPlaylists).sortedForLibrary(librarySort)
    BoxWithConstraints(modifier.fillMaxSize()) {
        val grid = libraryGrid(maxWidth - PAGE_GUTTER * 2)
        LazyVerticalGrid(
            columns = GridCells.Fixed(grid.columns),
            state = gridState,
            contentPadding = contentPadding,
            horizontalArrangement = Arrangement.spacedBy(LIBRARY_GRID_SPACING),
            verticalArrangement = Arrangement.spacedBy(22.dp),
            modifier = Modifier.padding(horizontal = PAGE_GUTTER),
        ) {
            if (onNewPlaylist != null) {
                item(key = "leading") {
                    LibraryQuickAction(
                        icon = BitChordIcons.Plus,
                        label = stringResource(Res.string.new_playlist),
                        onClick = onNewPlaylist,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
            items(sortedShelf.items, key = { it.browseId ?: it.title }) { item ->
                LibraryTile(
                    item = item,
                    onClick = { onItemClick(item) },
                    onLongPress = { onItemLongPress(item) },
                    modifier = Modifier.fillMaxWidth(),
                    isPinned = item.browseId != null && item.browseId in pinnedPlaylists,
                )
            }
        }
    }
}

/**
 * One key per card in a shelf row, unique however the cards repeat. A lazy row
 * throws on a key it has seen twice, and two cards can share a browse id (a
 * shelf that lists one twice) or, with none, a title. Prefixed so no card's
 * key can be the row's "leading" or "trailing" card's.
 */
internal fun shelfCardKeys(items: List<ShelfItem>): List<String> {
    val seen = HashMap<String, Int>()
    return items.map { item ->
        val base = "card:" + (item.browseId ?: item.videoId ?: item.title)
        val count = (seen[base] ?: 0) + 1
        seen[base] = count
        if (count == 1) base else "$base#$count"
    }
}

/**
 * Moves whichever of this shelf's cards are in [pinned] to the front, in the
 * order they were pinned, leaving everything else in its existing order behind
 * them.
 */
private fun HomeShelf.pinnedFirst(pinned: List<String>): HomeShelf {
    if (pinned.isEmpty()) return this
    val byId = items.filter { it.browseId != null }.associateBy { it.browseId }
    val pinnedItems = pinned.mapNotNull { byId[it] }
    if (pinnedItems.isEmpty()) return this
    val pinnedSet = pinnedItems.toSet()
    return copy(items = pinnedItems + items.filter { it !in pinnedSet })
}

/** A card's title is all a Library shelf carries, so [LibrarySort.DEFAULT] is the only option that isn't alphabetical. */
private fun HomeShelf.sortedForLibrary(sort: LibrarySort): HomeShelf = when (sort) {
    LibrarySort.DEFAULT -> this
    LibrarySort.TITLE_ASC -> copy(items = items.sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.title }))
    LibrarySort.TITLE_DESC -> copy(
        items = items.sortedWith(compareByDescending(String.CASE_INSENSITIVE_ORDER) { it.title }),
    )
}

/** The library feed whose cards are the account's own — see [LibraryPlaylistBlock]. */
private const val PLAYLISTS = YtMusicRepository.PLAYLISTS_SHELF
