package com.music.bitchord.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp

/**
 * The shared page masthead, now the v2.6 compact header.
 *
 * v2.5 opened every page with a brand line over a 38 sp page name, which took
 * a fifth of a phone screen before any content. v2.6 opens with one line at
 * heading size; this wrapper keeps the old call sites (Explore, and any host
 * that names a page through it) on the new proportions rather than leaving one
 * screen on the old masthead.
 */
@Composable
fun MusoPageTitle(
    title: String,
    subtitle: String? = null,
    modifier: Modifier = Modifier,
) {
    MusoV26Header(
        title = title,
        subtitle = subtitle,
        modifier = modifier,
    )
}
