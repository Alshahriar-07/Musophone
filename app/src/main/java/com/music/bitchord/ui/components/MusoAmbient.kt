package com.music.bitchord.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.translate
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.music.bitchord.data.settings.AppSettings
import com.music.bitchord.ui.rememberIsForeground
import kotlin.math.cos
import kotlin.math.sin

/**
 * The shared ambient backdrop of the v3.2 Liquid Glass design.
 *
 * Apple Music meets Liquid Glass in a dark room: a near-black ground, a
 * MusoPhone accent glow, a muted violet counter-light and one soft white
 * highlight. Every page is drawn over this, so the app reads as one place
 * rather than as five pages that happen to share a palette.
 *
 * The tokens live here and nowhere else — a screen that painted its own
 * gradient is how the app ended up looking like several apps in one.
 */
object MusoAmbient {
    /** The floor everything sits on. */
    val Ground = Color(0xFF040406)

    /** The shallow charcoal at the head of the screen. */
    val GroundRaised = Color(0xFF0B0B11)

    /** The complementary light: muted, dusty violet rather than a second accent. */
    val Violet = Color(0xFF5A4A86)

    /** A low-opacity white highlight, the "light in the room". */
    val Highlight = Color(0xFFFFFFFF)

    /** One full pass of the drift, in milliseconds. Slow on purpose. */
    const val CycleMillis = 46_000

    /** The phase the still frame sits at under "Reduce animation". */
    const val StillPhase = 0.18f

    /**
     * Frame budget: a gradient this slow does not need 120 updates a second.
     *
     * Eight a second is deliberate. The backdrop is a recorded layer, so every
     * frame that invalidates it re-records the window; at this drift speed a
     * step is well under two pixels, which reads as continuous while costing
     * a fraction of a full-rate animation.
     */
    internal const val MIN_FRAME_NANOS = 125_000_000L
}

/**
 * Drives the ambient drift, and stops when the app is not on screen.
 *
 * Returned as a [State] so callers can read it *inside* a draw pass: a slow
 * gradient should invalidate the picture, never recompose a page of lists and
 * artwork over it.
 *
 * [active] is the app being foregrounded; "Reduce animation" freezes the
 * gradient at a pleasant still frame, which is exactly what that setting
 * promises. When Compose pauses animations (app backgrounded, window hidden)
 * `withInfiniteAnimationFrameNanos` stops producing frames on its own as well.
 */
@Composable
fun rememberAmbientPhase(active: Boolean = true): State<Float> {
    val reduceAnimation by AppSettings.reduceAnimation.collectAsStateWithLifecycle()
    val phase = remember { mutableFloatStateOf(MusoAmbient.StillPhase) }
    LaunchedEffect(active, reduceAnimation) {
        if (!active || reduceAnimation) return@LaunchedEffect
        var lastPublished = 0L
        while (true) {
            val frame = withFrameNanos { it }
            if (frame - lastPublished < MusoAmbient.MIN_FRAME_NANOS) continue
            lastPublished = frame
            phase.floatValue = (frame % (MusoAmbient.CycleMillis * 1_000_000L)).toFloat() /
                (MusoAmbient.CycleMillis * 1_000_000f)
        }
    }
    return phase
}

/** One soft, blurred region of colour and where its centre wanders. */
private class AmbientBlob(
    val brush: Brush,
    val centre: Offset,
    val radius: Float,
    val driftX: Float,
    val driftY: Float,
    val phaseOffset: Float,
    val alpha: Float,
)

/**
 * The gradients of one ambient layer, built once per size and palette.
 *
 * Rebuilding shaders every frame is the usual way an "animated background"
 * turns into a jank source: each `Brush.radialGradient` is a new shader, and a
 * handful of those per frame is real work on a mid-range phone. Here the
 * shaders are made once and each blob is only *translated* per frame.
 */
class MusoAmbientLayer(size: Size, accent: Color, dark: Boolean) {

    private val base: Brush = Brush.verticalGradient(
        0f to MusoAmbient.GroundRaised,
        0.55f to MusoAmbient.Ground,
        1f to Color.Black,
    )

    private val blobs: List<AmbientBlob>

    init {
        val short = minOf(size.width, size.height)
        val long = maxOf(size.width, size.height)
        val accentStrength = if (dark) 0.20f else 0.12f
        val violetStrength = if (dark) 0.16f else 0.08f
        blobs = listOf(
            // The accent light, high and to the left, the way a lamp would be.
            AmbientBlob(
                brush = radial(
                    radius = long * 0.62f,
                    colors = listOf(
                        accent.copy(alpha = accentStrength),
                        accent.copy(alpha = accentStrength * 0.35f),
                        Color.Transparent,
                    ),
                ),
                centre = Offset(size.width * 0.18f, size.height * 0.12f),
                radius = long * 0.62f,
                driftX = short * 0.16f,
                driftY = long * 0.10f,
                phaseOffset = 0f,
                alpha = 1f,
            ),
            // The violet counter-light, low and right: what stops the screen
            // being "black with a red glow" and makes the dark read as space.
            AmbientBlob(
                brush = radial(
                    radius = long * 0.70f,
                    colors = listOf(
                        lerp(MusoAmbient.Violet, accent, 0.18f).copy(alpha = violetStrength),
                        MusoAmbient.Violet.copy(alpha = violetStrength * 0.28f),
                        Color.Transparent,
                    ),
                ),
                centre = Offset(size.width * 0.86f, size.height * 0.72f),
                radius = long * 0.70f,
                driftX = short * 0.12f,
                driftY = long * 0.14f,
                phaseOffset = 0.36f,
                alpha = 1f,
            ),
            // A second, weaker accent bloom low-left: the two cannot both be
            // at rest, so the accent visibly travels rather than pulsing.
            AmbientBlob(
                brush = radial(
                    radius = long * 0.48f,
                    colors = listOf(
                        accent.copy(alpha = accentStrength * 0.55f),
                        Color.Transparent,
                    ),
                ),
                centre = Offset(size.width * 0.30f, size.height * 0.92f),
                radius = long * 0.48f,
                driftX = short * 0.20f,
                driftY = long * 0.07f,
                phaseOffset = 0.68f,
                alpha = 1f,
            ),
            // The white highlight, faint enough to be felt and not seen.
            AmbientBlob(
                brush = radial(
                    radius = long * 0.36f,
                    colors = listOf(
                        MusoAmbient.Highlight.copy(alpha = if (dark) 0.055f else 0.10f),
                        Color.Transparent,
                    ),
                ),
                centre = Offset(size.width * 0.62f, size.height * 0.22f),
                radius = long * 0.36f,
                driftX = short * 0.10f,
                driftY = long * 0.09f,
                phaseOffset = 0.84f,
                alpha = 1f,
            ),
        )
    }

    fun draw(scope: DrawScope, phase: Float) {
        scope.drawRect(base)
        blobs.forEach { blob ->
            val angle = (phase + blob.phaseOffset) * (2f * Math.PI.toFloat())
            val centre = Offset(
                x = blob.centre.x + cos(angle) * blob.driftX,
                y = blob.centre.y + sin(angle * 0.84f) * blob.driftY,
            )
            // Shader centred on the origin, so translating the canvas moves the
            // gradient rather than rebuilding it.
            scope.translate(centre.x, centre.y) {
                drawCircle(brush = blob.brush, radius = blob.radius, center = Offset.Zero)
            }
        }
    }

    private fun radial(radius: Float, colors: List<Color>): Brush =
        Brush.radialGradient(colors = colors, center = Offset.Zero, radius = radius)
}

/**
 * Draws the ambient backdrop. [phase] is 0..1 around the cycle; the same
 * phase always produces the same frame, so the animation is deterministic and
 * a still frame is just a fixed value.
 */
fun DrawScope.drawMusoAmbient(layer: MusoAmbientLayer, phase: Float) {
    layer.draw(this, phase)
}

/** Whether the ambient drift should be running. Reads the process lifecycle. */
@Composable
fun rememberAmbientActive(): Boolean = rememberIsForeground()

/**
 * Keeps one [MusoAmbientLayer] per size.
 *
 * A window resize (a rotation, a desktop window drag) rebuilds the shaders
 * once; ordinary frames only translate them. Built by the host at composition
 * time because the draw pass cannot call `remember`.
 */
class MusoAmbientCache(private val accent: Color, private val dark: Boolean) {
    private var size: Size = Size.Zero
    private var layer: MusoAmbientLayer? = null

    fun layerFor(size: Size): MusoAmbientLayer {
        val existing = layer
        if (existing != null && this.size == size) return existing
        this.size = size
        return MusoAmbientLayer(size, accent, dark).also { layer = it }
    }
}

