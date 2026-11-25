package com.music.bitchord.ui.icons

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathBuilder
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.unit.dp

/**
 * MusoPhone's icon language, v2.5.
 *
 * One family: a 24 dp grid, a single 1.9 stroke, round caps and round joins,
 * open counters and no filled silhouettes except where a state has to be read
 * without colour (the liked heart). Everything is drawn on the same optical
 * grid — a 16 to 18 unit body inside 4 dp margins — so a row of these reads as
 * one set rather than as glyphs borrowed from three libraries.
 *
 * The bottom bar, the top bar, Profile, Settings and every secondary action
 * read from here. [BitChordIcons] remains for the player's older transport
 * artwork, which is drawn on artwork rather than on themed surfaces.
 */
object MusoIcons {

    /** The one stroke weight, in the 24 dp viewport. */
    private const val SW = 1.9f

    private val ink = SolidColor(Color.Black)

    private fun glyph(name: String, block: ImageVector.Builder.() -> Unit): ImageVector =
        ImageVector.Builder(
            name = name,
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f,
        ).apply(block).build()

    /** A stroked outline in the family's one weight. */
    private fun ImageVector.Builder.outline(block: PathBuilder.() -> Unit) {
        path(
            fill = null,
            stroke = ink,
            strokeLineWidth = SW,
            strokeLineCap = StrokeCap.Round,
            strokeLineJoin = StrokeJoin.Round,
            pathBuilder = block,
        )
    }

    /** A solid shape — state, not decoration. */
    private fun ImageVector.Builder.solid(block: PathBuilder.() -> Unit) {
        path(fill = ink, pathBuilder = block)
    }

    /** Home: a roof and two walls, with the door as a notch in the floor. */
    val Home: ImageVector by lazy {
        glyph("muso_home") {
            outline {
                moveTo(4f, 10.5f)
                lineTo(12f, 4.2f)
                lineTo(20f, 10.5f)
                lineTo(20f, 18.6f)
                lineTo(14.9f, 18.6f)
                lineTo(14.9f, 13.9f)
                lineTo(9.1f, 13.9f)
                lineTo(9.1f, 18.6f)
                lineTo(4f, 18.6f)
                close()
            }
        }
    }

    /** Explore: a compass dial with a two-point needle. */
    val Explore: ImageVector by lazy {
        glyph("muso_explore") {
            outline {
                moveTo(3.9f, 12f)
                arcToRelative(8.1f, 8.1f, 0f, isMoreThanHalf = true, isPositiveArc = true, 16.2f, 0f)
                arcToRelative(8.1f, 8.1f, 0f, isMoreThanHalf = true, isPositiveArc = true, -16.2f, 0f)
                moveTo(15.1f, 8.9f)
                lineTo(13.3f, 13.3f)
                lineTo(8.9f, 15.1f)
                lineTo(10.7f, 10.7f)
                close()
            }
        }
    }

    /** Library: three upright spines and one leaning, the collection at rest. */
    val Library: ImageVector by lazy {
        glyph("muso_library") {
            outline {
                moveTo(5f, 4.8f); lineTo(5f, 19.2f)
                moveTo(9.4f, 4.8f); lineTo(9.4f, 19.2f)
                moveTo(13.8f, 4.8f); lineTo(13.8f, 19.2f)
                moveTo(17.1f, 5.7f); lineTo(20.3f, 18.7f)
            }
        }
    }

    /** Search: one lens, one handle, nothing else. */
    val Search: ImageVector by lazy {
        glyph("muso_search") {
            outline {
                moveTo(4.6f, 10.8f)
                arcToRelative(6.2f, 6.2f, 0f, isMoreThanHalf = true, isPositiveArc = true, 12.4f, 0f)
                arcToRelative(6.2f, 6.2f, 0f, isMoreThanHalf = true, isPositiveArc = true, -12.4f, 0f)
                moveTo(15.4f, 15.4f)
                lineTo(20f, 20f)
            }
        }
    }

    /**
     * Profile: a head over an open shoulder line.
     *
     * The app's one profile glyph — top bar, Home masthead and every account
     * action use it, so the way into the listener's page is the same shape
     * wherever it appears. It is deliberately not the account's photograph:
     * the photo belongs *on* the Profile page, not to the button that opens it.
     */
    val Profile: ImageVector by lazy {
        glyph("muso_profile") {
            outline {
                moveTo(8.4f, 9f)
                arcToRelative(3.6f, 3.6f, 0f, isMoreThanHalf = true, isPositiveArc = true, 7.2f, 0f)
                arcToRelative(3.6f, 3.6f, 0f, isMoreThanHalf = true, isPositiveArc = true, -7.2f, 0f)
                moveTo(5.2f, 19.4f)
                curveTo(6f, 15.8f, 8.5f, 13.9f, 12f, 13.9f)
                curveTo(15.5f, 13.9f, 18f, 15.8f, 18.8f, 19.4f)
            }
        }
    }

    /** Settings: three sliders with their knobs — the tuning metaphor, not a gear. */
    val Settings: ImageVector by lazy {
        glyph("muso_settings") {
            outline {
                moveTo(4f, 6.8f); lineTo(20f, 6.8f)
                moveTo(4f, 12f); lineTo(20f, 12f)
                moveTo(4f, 17.2f); lineTo(20f, 17.2f)
            }
            solid {
                for ((x, y) in listOf(9.2f to 6.8f, 15f to 12f, 7.6f to 17.2f)) {
                    // From the knob's left edge, so the two arcs close a circle
                    // centred on x rather than one shifted by a radius.
                    moveTo(x - 1.7f, y)
                    arcToRelative(1.7f, 1.7f, 0f, isMoreThanHalf = true, isPositiveArc = true, 3.4f, 0f)
                    arcToRelative(1.7f, 1.7f, 0f, isMoreThanHalf = true, isPositiveArc = true, -3.4f, 0f)
                    close()
                }
            }
        }
    }

    /** An equalizer: three vertical bands, for audio shape rather than sliders. */
    val Equalizer: ImageVector by lazy {
        glyph("muso_equalizer") {
            outline {
                moveTo(6.4f, 4.5f); lineTo(6.4f, 19.5f)
                moveTo(12f, 7.5f); lineTo(12f, 16.5f)
                moveTo(17.6f, 4.5f); lineTo(17.6f, 19.5f)
            }
        }
    }

    val ChevronRight: ImageVector by lazy {
        glyph("muso_chevron_right") {
            outline {
                moveTo(9.6f, 6.2f)
                lineTo(15.4f, 12f)
                lineTo(9.6f, 17.8f)
            }
        }
    }

    val ChevronDown: ImageVector by lazy {
        glyph("muso_chevron_down") {
            outline {
                moveTo(6.2f, 9.6f)
                lineTo(12f, 15.4f)
                lineTo(17.8f, 9.6f)
            }
        }
    }

    val Heart: ImageVector by lazy { heart("muso_heart", filled = false) }

    val HeartFilled: ImageVector by lazy { heart("muso_heart_filled", filled = true) }

    private fun heart(name: String, filled: Boolean): ImageVector = glyph(name) {
        path(
            stroke = ink,
            strokeLineWidth = SW,
            strokeLineCap = StrokeCap.Round,
            strokeLineJoin = StrokeJoin.Round,
            fill = if (filled) ink else null,
        ) {
            moveTo(12f, 19.8f)
            curveTo(12f, 19.8f, 3.6f, 14.6f, 3.6f, 9.1f)
            arcToRelative(4.4f, 4.4f, 0f, isMoreThanHalf = false, isPositiveArc = true, 8.4f, -1.5f)
            arcToRelative(4.4f, 4.4f, 0f, isMoreThanHalf = false, isPositiveArc = true, 8.4f, 1.5f)
            curveTo(20.4f, 14.6f, 12f, 19.8f, 12f, 19.8f)
            close()
        }
    }

    /** Download: a stem into a tray. */
    val Download: ImageVector by lazy {
        glyph("muso_download") {
            outline {
                moveTo(12f, 4.4f); lineTo(12f, 15.2f)
                moveTo(7.6f, 10.8f); lineTo(12f, 15.2f); lineTo(16.4f, 10.8f)
                moveTo(4.6f, 19f); lineTo(19.4f, 19f)
            }
        }
    }

    val Clock: ImageVector by lazy {
        glyph("muso_clock") {
            outline {
                moveTo(3.9f, 12f)
                arcToRelative(8.1f, 8.1f, 0f, isMoreThanHalf = true, isPositiveArc = true, 16.2f, 0f)
                arcToRelative(8.1f, 8.1f, 0f, isMoreThanHalf = true, isPositiveArc = true, -16.2f, 0f)
                moveTo(12f, 7.4f); lineTo(12f, 12f); lineTo(15.4f, 13.8f)
            }
        }
    }

    val Plus: ImageVector by lazy {
        glyph("muso_plus") {
            outline {
                moveTo(12f, 5f); lineTo(12f, 19f)
                moveTo(5f, 12f); lineTo(19f, 12f)
            }
        }
    }

    val Check: ImageVector by lazy {
        glyph("muso_check") {
            outline {
                moveTo(5f, 12.8f); lineTo(9.6f, 17.4f); lineTo(19f, 6.9f)
            }
        }
    }

    val Close: ImageVector by lazy {
        glyph("muso_close") {
            outline {
                moveTo(6.2f, 6.2f); lineTo(17.8f, 17.8f)
                moveTo(17.8f, 6.2f); lineTo(6.2f, 17.8f)
            }
        }
    }

    /** Shuffle: two crossing strands with their arrow heads. */
    val Shuffle: ImageVector by lazy {
        glyph("muso_shuffle") {
            outline {
                moveTo(3.6f, 7.4f); lineTo(7f, 7.4f); lineTo(16.6f, 16.6f); lineTo(20.4f, 16.6f)
                moveTo(18f, 14.2f); lineTo(20.4f, 16.6f); lineTo(18f, 19f)
                moveTo(3.6f, 16.6f); lineTo(7f, 16.6f); lineTo(9.8f, 13.9f)
                moveTo(13.9f, 10.1f); lineTo(16.6f, 7.4f); lineTo(20.4f, 7.4f)
                moveTo(18f, 5f); lineTo(20.4f, 7.4f); lineTo(18f, 9.8f)
            }
        }
    }

    val Repeat: ImageVector by lazy {
        glyph("muso_repeat") {
            outline {
                moveTo(8.6f, 7.6f); lineTo(15.4f, 7.6f)
                arcToRelative(4.4f, 4.4f, 0f, isMoreThanHalf = false, isPositiveArc = true, 0f, 8.8f)
                lineTo(8.6f, 16.4f)
                arcToRelative(4.4f, 4.4f, 0f, isMoreThanHalf = false, isPositiveArc = true, 0f, -8.8f)
                close()
                moveTo(13.5f, 5.7f); lineTo(15.4f, 7.6f); lineTo(13.5f, 9.5f)
                moveTo(10.5f, 14.5f); lineTo(8.6f, 16.4f); lineTo(10.5f, 18.3f)
            }
        }
    }

    /** Queue: three lines with their bullets. */
    val Queue: ImageVector by lazy {
        glyph("muso_queue") {
            outline {
                for (y in listOf(6f, 12f, 18f)) {
                    moveTo(8.5f, y); lineTo(20.4f, y)
                }
            }
            solid {
                for (y in listOf(6f, 12f, 18f)) {
                    moveTo(3.3f, y)
                    arcToRelative(1.2f, 1.2f, 0f, isMoreThanHalf = true, isPositiveArc = true, 2.4f, 0f)
                    arcToRelative(1.2f, 1.2f, 0f, isMoreThanHalf = true, isPositiveArc = true, -2.4f, 0f)
                    close()
                }
            }
        }
    }

    /** Lyrics: a speech bubble with two lines of words. */
    val Lyrics: ImageVector by lazy {
        glyph("muso_lyrics") {
            outline {
                moveTo(6.2f, 4.6f); lineTo(17.8f, 4.6f)
                arcToRelative(2.8f, 2.8f, 0f, isMoreThanHalf = false, isPositiveArc = true, 2.8f, 2.8f)
                lineTo(20.6f, 13.6f)
                arcToRelative(2.8f, 2.8f, 0f, isMoreThanHalf = false, isPositiveArc = true, -2.8f, 2.8f)
                lineTo(10.6f, 16.4f)
                lineTo(6.8f, 19.6f)
                lineTo(6.8f, 16.4f)
                lineTo(6.2f, 16.4f)
                arcToRelative(2.8f, 2.8f, 0f, isMoreThanHalf = false, isPositiveArc = true, -2.8f, -2.8f)
                lineTo(3.4f, 7.4f)
                arcToRelative(2.8f, 2.8f, 0f, isMoreThanHalf = false, isPositiveArc = true, 2.8f, -2.8f)
                close()
                moveTo(7.6f, 9f); lineTo(16.4f, 9f)
                moveTo(7.6f, 12.1f); lineTo(13.2f, 12.1f)
            }
        }
    }

    /** Album: a sleeve carrying one disc. */
    val Album: ImageVector by lazy {
        glyph("muso_album") {
            outline {
                moveTo(3.6f, 7.4f)
                arcToRelative(2.2f, 2.2f, 0f, isMoreThanHalf = false, isPositiveArc = true, 2.2f, -2.2f)
                lineTo(18.2f, 5.2f)
                arcToRelative(2.2f, 2.2f, 0f, isMoreThanHalf = false, isPositiveArc = true, 2.2f, 2.2f)
                lineTo(20.4f, 16.6f)
                arcToRelative(2.2f, 2.2f, 0f, isMoreThanHalf = false, isPositiveArc = true, -2.2f, 2.2f)
                lineTo(5.8f, 18.8f)
                arcToRelative(2.2f, 2.2f, 0f, isMoreThanHalf = false, isPositiveArc = true, -2.2f, -2.2f)
                close()
                moveTo(12f, 9.2f)
                arcToRelative(2.9f, 2.9f, 0f, isMoreThanHalf = true, isPositiveArc = true, 0f, 5.8f)
                arcToRelative(2.9f, 2.9f, 0f, isMoreThanHalf = true, isPositiveArc = true, 0f, -5.8f)
            }
        }
    }

    /** Artist: a person without the ring, distinct from [Profile]. */
    val Person: ImageVector by lazy {
        glyph("muso_person") {
            outline {
                moveTo(9.1f, 8.4f)
                arcToRelative(2.9f, 2.9f, 0f, isMoreThanHalf = true, isPositiveArc = true, 5.8f, 0f)
                arcToRelative(2.9f, 2.9f, 0f, isMoreThanHalf = true, isPositiveArc = true, -5.8f, 0f)
                moveTo(6.2f, 18.8f)
                curveTo(6.9f, 15.6f, 9.2f, 13.9f, 12f, 13.9f)
                curveTo(14.8f, 13.9f, 17.1f, 15.6f, 17.8f, 18.8f)
            }
        }
    }

    /** Folder: the device library's own shape. */
    val Folder: ImageVector by lazy {
        glyph("muso_folder") {
            outline {
                moveTo(3.8f, 7.2f)
                arcToRelative(2f, 2f, 0f, isMoreThanHalf = false, isPositiveArc = true, 2f, -2f)
                lineTo(9.4f, 5.2f)
                lineTo(11.2f, 7.4f)
                lineTo(18.2f, 7.4f)
                arcToRelative(2f, 2f, 0f, isMoreThanHalf = false, isPositiveArc = true, 2f, 2f)
                lineTo(20.2f, 17f)
                arcToRelative(2f, 2f, 0f, isMoreThanHalf = false, isPositiveArc = true, -2f, 2f)
                lineTo(5.8f, 19f)
                arcToRelative(2f, 2f, 0f, isMoreThanHalf = false, isPositiveArc = true, -2f, -2f)
                close()
            }
        }
    }

    /** Switch: two arrows trading places. */
    val SwitchAccount: ImageVector by lazy {
        glyph("muso_switch_account") {
            outline {
                moveTo(4.4f, 8.2f); lineTo(19.6f, 8.2f)
                moveTo(16.4f, 5f); lineTo(19.6f, 8.2f); lineTo(16.4f, 11.4f)
                moveTo(19.6f, 15.8f); lineTo(4.4f, 15.8f)
                moveTo(7.6f, 12.6f); lineTo(4.4f, 15.8f); lineTo(7.6f, 19f)
            }
        }
    }

    /** Replay: a year in review, as a circular arrow. */
    val Rewind: ImageVector by lazy {
        glyph("muso_rewind") {
            outline {
                moveTo(4.2f, 12f)
                arcToRelative(7.8f, 7.8f, 0f, isMoreThanHalf = true, isPositiveArc = true, 3.1f, 6.2f)
                moveTo(4.2f, 12f)
                lineTo(4.2f, 6.8f)
                moveTo(4.2f, 12f)
                lineTo(9.4f, 12f)
            }
        }
    }

    /** Info: a ringed i, for About and release notes. */
    val Info: ImageVector by lazy {
        glyph("muso_info") {
            outline {
                moveTo(3.9f, 12f)
                arcToRelative(8.1f, 8.1f, 0f, isMoreThanHalf = true, isPositiveArc = true, 16.2f, 0f)
                arcToRelative(8.1f, 8.1f, 0f, isMoreThanHalf = true, isPositiveArc = true, -16.2f, 0f)
                moveTo(12f, 11f); lineTo(12f, 16.6f)
            }
            solid {
                moveTo(11.05f, 7.6f)
                arcToRelative(0.95f, 0.95f, 0f, isMoreThanHalf = true, isPositiveArc = true, 1.9f, 0f)
                arcToRelative(0.95f, 0.95f, 0f, isMoreThanHalf = true, isPositiveArc = true, -1.9f, 0f)
                close()
            }
        }
    }
}
