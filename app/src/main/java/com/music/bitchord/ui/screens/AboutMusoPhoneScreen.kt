package com.music.bitchord.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.music.bitchord.BuildConfig
import com.music.bitchord.ui.icons.SfIcons
import com.music.bitchord.ui.theme.accentPalette
import com.music.bitchord.sharedui.resources.Res
import com.music.bitchord.sharedui.resources.musophone_logo
import java.util.Calendar
import org.jetbrains.compose.resources.painterResource

private const val GITHUB_URL = "https://github.com/Alshahriar-07"
private const val PORTFOLIO_URL = "https://alshahriarsayon.vercel.app/"
private const val EAGOX_URL = "https://eagoxstudio.vercel.app/"
private const val CHATGPT_URL = "https://chatgpt.com/"
private const val DEEPSEEK_URL = "https://www.deepseek.com/"
private const val CLAUDE_URL = "https://claude.ai/"
private const val BITCHORD_URL = "https://github.com/kushagrasinghx/BitChord"
private const val GPL_URL = "https://www.gnu.org/licenses/gpl-3.0.html"
private const val APACHE_URL = "https://www.apache.org/licenses/LICENSE-2.0"

/**
 * About MusoPhone: the identity page.
 *
 * One scrolling column of glass cards in the order the page reads — who this
 * is, who made it, what helped make it, what it is built on, and what it is
 * licensed under. Everything that leaves the app goes through the platform's
 * URI handler, so a browser, an in-app browser or a link app all behave the
 * way the device expects.
 *
 * The version is read from [BuildConfig], never typed here: a release bump
 * changes this page without anyone remembering to.
 */
@Composable
fun AboutMusoPhoneScreen(
    contentPadding: PaddingValues,
    modifier: Modifier = Modifier,
) {
    val palette = accentPalette
    val uriHandler = LocalUriHandler.current
    val open: (String) -> Unit = { runCatching { uriHandler.openUri(it) } }
    // Read from the installed package, so an update changes this page without
    // a second source of truth to keep in step. BuildConfig is the fallback
    // for the one case the package manager cannot answer (a preview render).
    val context = LocalContext.current
    val version = remember(context) {
        runCatching {
            val info = context.packageManager.getPackageInfo(context.packageName, 0)
            "${info.versionName} (${info.longVersionCode})"
        }.getOrNull() ?: "${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})"
    }
    val year = Calendar.getInstance().get(Calendar.YEAR)

    // A short settle on arrival — the page fades and lifts by a few dp — so
    // opening About feels like entering a page of the app rather than like a
    // jump cut. Read in a graphics layer, so only the animation frames redraw.
    var entered by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { entered = true }
    val entrance by animateFloatAsState(
        targetValue = if (entered) 1f else 0f,
        animationSpec = tween(durationMillis = 320, easing = FastOutSlowInEasing),
        label = "aboutEntrance",
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .graphicsLayer {
                alpha = entrance
                translationY = (1f - entrance) * 16.dp.toPx()
            }
            .verticalScroll(rememberScrollState())
            .padding(contentPadding)
            .padding(horizontal = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(20.dp))

        // ---- Identity ------------------------------------------------------
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center,
        ) {
            Image(
                painter = painterResource(Res.drawable.musophone_logo),
                contentDescription = "MusoPhone",
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .height(58.dp)
                    .aspectRatio(3f),
            )
        }

        Spacer(Modifier.height(14.dp))
        Text(
            text = "MusoPhone",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "An independently developed music player: MusoPhone's interface, " +
                "branding, design system and product direction are its own.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 8.dp),
        )
        Spacer(Modifier.height(14.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Pill(text = "Version $version")
            Pill(text = "GPL-3.0")
        }

        Spacer(Modifier.height(22.dp))

        // ---- Creator -------------------------------------------------------
        SectionTitle("Created & Developed by")
        GlassCard {
            Text(
                text = "Al Shahriar Sowan",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Text(
                text = "Eagox Studio",
                style = MaterialTheme.typography.bodySmall,
                color = palette.accent,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "Product direction, Android development, interface implementation " +
                    "and release engineering.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(10.dp))
            LinkRow("GitHub — github.com/Alshahriar-07", GITHUB_URL, open)
            LinkRow("Portfolio — alshahriarsayon.vercel.app", PORTFOLIO_URL, open)
            LinkRow("Eagox Studio — eagoxstudio.vercel.app", EAGOX_URL, open)
        }

        // ---- AI assistance -------------------------------------------------
        SectionTitle("AI Tools & Development Assistance")
        GlassCard {
            Text(
                text = "These tools assisted with design, planning, documentation and " +
                    "development. They are credited as assistance only — they do not " +
                    "develop, own, sponsor or officially endorse MusoPhone.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(6.dp))
            AiCreditRow("ChatGPT", "OpenAI", "GPT", CHATGPT_URL, open)
            AiCreditRow("DeepSeek", "DeepSeek", "DS", DEEPSEEK_URL, open)
            AiCreditRow("Claude", "Anthropic", "C", CLAUDE_URL, open)
        }

        // ---- Independence & attribution ------------------------------------
        SectionTitle("Independent by Design")
        GlassCard {
            Text(
                text = "Built by the MusoPhone team",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "MusoPhone is an independently developed music player. Its " +
                    "screens, iconography, colour and motion design system, visual " +
                    "identity and product development are its own work, made by the " +
                    "MusoPhone development team. It is not a reskin of another player " +
                    "and carries no other project's branding.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(12.dp))
            Text(
                text = "Technology it utilises",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "Streaming and playback are built on established third-party " +
                    "open-source technology — the YouTube audio pipeline and extractor, " +
                    "AndroidX Media3, Compose and the libraries below — together with " +
                    "the backend services they talk to. Those components are the work of " +
                    "their own authors and are used under their licenses; MusoPhone does " +
                    "not claim to have written them, and no project or service named here " +
                    "endorses MusoPhone.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        // ---- Licenses ------------------------------------------------------
        SectionTitle("Open Source & Licenses")
        GlassCard {
            Text(
                text = "MusoPhone is free software under the GNU General Public License, " +
                    "version 3. The full license text is bundled with the project's source " +
                    "and is available online.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(8.dp))
            LinkRow("GNU GPL-3.0 license text", GPL_URL, open)
            Spacer(Modifier.height(4.dp))
            // Legal attribution for the GPL-3.0 codebase this project derives
            // from belongs here, with the other notices, rather than as the
            // headline of a user-facing section.
            LicenseRow("BitChord (original codebase)", "GPL-3.0", open, BITCHORD_URL)
            LicenseRow("NewPipeExtractor", "GPL-3.0", open, GPL_URL)
            LicenseRow("AndroidX Media3", "Apache-2.0", open, APACHE_URL)
            LicenseRow("Coil", "Apache-2.0", open, APACHE_URL)
            LicenseRow("Ktor", "Apache-2.0", open, APACHE_URL)
            LicenseRow("Compose Multiplatform", "Apache-2.0", open, APACHE_URL)
            LicenseRow("Kotlin & Coroutines", "Apache-2.0", open, APACHE_URL)
        }

        Spacer(Modifier.height(22.dp))
        Text(
            text = "© $year MusoPhone · Eagox Studio. Open-source components © their " +
                "respective authors.",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
        Text(
            text = "MusoPhone is not affiliated with YouTube or Google.",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp, bottom = 28.dp),
        )
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 1.2.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.75f),
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 4.dp, top = 8.dp, bottom = 8.dp),
    )
}

@Composable
private fun GlassCard(content: @Composable ColumnScope.() -> Unit) {
    // The same radius and the same surface as every Settings group and every
    // MusoGlassCard, so About reads as part of the same family rather than a
    // page with its own card language.
    val shape = GroupShape
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            // One neutral fill and one hairline: the v2.5 panel everywhere.
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant, shape)
            .padding(horizontal = 16.dp, vertical = 14.dp),
    ) {
        content()
    }
}

@Composable
private fun Pill(text: String) {
    val palette = accentPalette
    Text(
        text = text,
        style = MaterialTheme.typography.labelSmall,
        color = palette.accent,
        modifier = Modifier
            .clip(CircleShape)
            .background(palette.accent.copy(alpha = 0.13f))
            .border(0.5.dp, palette.accent.copy(alpha = 0.35f), CircleShape)
            .padding(horizontal = 11.dp, vertical = 5.dp),
    )
}

@Composable
private fun LinkRow(label: String, url: String, open: (String) -> Unit) {
    val palette = accentPalette
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .clickable { open(url) }
            .padding(vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            fontSize = 12.sp,
            color = palette.accent,
            textDecoration = TextDecoration.Underline,
            modifier = Modifier.weight(1f),
        )
        Icon(
            imageVector = SfIcons.ChevronRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.55f),
            modifier = Modifier.size(15.dp),
        )
    }
}

@Composable
private fun LicenseRow(name: String, license: String, open: (String) -> Unit, url: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .clickable { open(url) }
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = name,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f),
        )
        Text(
            text = license,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.width(6.dp))
        Icon(
            imageVector = SfIcons.ChevronRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.55f),
            modifier = Modifier.size(14.dp),
        )
    }
}

@Composable
private fun AiCreditRow(name: String, company: String, monogram: String, url: String, open: (String) -> Unit) {
    val palette = accentPalette
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { open(url) }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(34.dp)
                .clip(CircleShape)
                .background(palette.accent.copy(alpha = 0.14f))
                .border(0.5.dp, palette.accent.copy(alpha = 0.35f), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = monogram,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = palette.accent,
            )
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = name,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Text(
                text = company,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Icon(
            imageVector = SfIcons.ChevronRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.55f),
            modifier = Modifier.size(15.dp),
        )
    }
}
