package com.music.bitchord.data.update

/**
 * One downloadable file attached to a GitHub release.
 *
 * [sha256] is only ever filled from the release's own metadata — the `digest`
 * field the GitHub API returns for an uploaded asset, or a `SHA256SUMS.txt`
 * attached to the same release — never from anywhere the user or a third
 * party could substitute. That rule is the whole point of verifying a
 * sideloaded APK at all: a checksum that arrives beside the file it describes,
 * from the same origin, still proves the download was not corrupted and that
 * the asset is the one the release published.
 */
data class ReleaseAsset(
    val name: String,
    val url: String,
    val sizeBytes: Long? = null,
    val sha256: String? = null,
)

/**
 * The subset of a GitHub release this app needs, already stripped of drafts
 * and prereleases by the API's `releases/latest` endpoint.
 *
 * [versionCode] is optional on purpose: it comes from the optional
 * `update-manifest.json` asset the release workflow publishes. Without it the
 * comparison falls back to the version name, which is what every 3.1 release
 * had to do.
 */
data class RemoteRelease(
    val tag: String,
    val versionName: String,
    val versionCode: Int? = null,
    val notes: String? = null,
    val releaseUrl: String,
    val assets: List<ReleaseAsset> = emptyList(),
    val publishedAt: String? = null,
) {
    /** The phone APK this device should install, or null if the release has none. */
    fun apkFor(deviceAbis: List<String>): ReleaseAsset? =
        selectApk(assets, deviceAbis)
}

/** The ABIs this app is built for, in the order the build declares them. */
val MUSO_ABIS = listOf("arm64-v8a", "armeabi-v7a", "x86_64")

/**
 * The version name without its release-tag `v`, and with any beta suffix kept.
 *
 * Tags are `v3.2`; `BuildConfig.VERSION_NAME` is `3.2`. Comparing one with the
 * other without this step makes every release look older than itself.
 */
fun normalizedVersion(raw: String): String = raw.trim().removePrefix("v").removePrefix("V")

private data class ParsedVersion(
    val parts: List<Int>,
    val isPreRelease: Boolean,
    /** The `-suffix` itself, so `beta2` can outrank `beta1`. */
    val suffix: String?,
)

private fun parseVersion(raw: String): ParsedVersion {
    val clean = normalizedVersion(raw)
    val dash = clean.indexOf('-')
    val base = if (dash >= 0) clean.substring(0, dash) else clean
    return ParsedVersion(
        parts = base.split(".").map { it.toIntOrNull() ?: 0 },
        isPreRelease = dash >= 0,
        suffix = if (dash >= 0) clean.substring(dash + 1) else null,
    )
}

/** Compares prerelease suffixes naturally: `beta10` above `beta9`, `rc1` above `beta2`. */
private fun compareSuffixes(a: String?, b: String?): Int {
    if (a == b) return 0
    if (a == null) return 1
    if (b == null) return -1
    // A plain "-beta" has no number; treat the digits it does have as its order.
    val trailing = Regex("""(\d+)$""")
    val an = trailing.find(a)?.groupValues?.get(1)?.toIntOrNull()
    val bn = trailing.find(b)?.groupValues?.get(1)?.toIntOrNull()
    val aName = trailing.replace(a, "")
    val bName = trailing.replace(b, "")
    if (aName != bName) return aName.compareTo(bName)
    return (an ?: 0).compareTo(bn ?: 0)
}

/**
 * Numeric, dot-separated comparison: `3.10` outranks `3.9`.
 *
 * A `-betaN` build sorts below a plain release of the same numbers, because
 * the beta predates the tag it was testing toward. Without that rule a beta
 * and the release it matches compare equal and a tester is never nudged off
 * the beta.
 */
fun compareVersions(a: String, b: String): Int {
    val left = parseVersion(a)
    val right = parseVersion(b)
    for (i in 0 until maxOf(left.parts.size, right.parts.size)) {
        val x = left.parts.getOrElse(i) { 0 }
        val y = right.parts.getOrElse(i) { 0 }
        if (x != y) return x.compareTo(y)
    }
    return when {
        left.isPreRelease == right.isPreRelease ->
            if (left.isPreRelease) compareSuffixes(left.suffix, right.suffix) else 0
        left.isPreRelease -> -1
        else -> 1
    }
}

/**
 * Whether [release] is worth telling this install about.
 *
 * The version code wins whenever the release publishes one, because it is what
 * Android itself uses to decide whether an APK may replace the installed app.
 * A release whose code is not newer would be refused by the installer even if
 * its version name reads higher, so offering it would be a dead end.
 */
fun isUpdateAvailable(
    release: RemoteRelease,
    currentVersionName: String,
    currentVersionCode: Int,
): Boolean {
    val remoteCode = release.versionCode
    if (remoteCode != null) return remoteCode > currentVersionCode
    return compareVersions(release.versionName, currentVersionName) > 0
}

/** The ABI an APK's file name announces, or null for the universal build. */
fun abiOfAsset(name: String): String? {
    val stem = name.removeSuffix(".apk").removeSuffix(".APK")
    return MUSO_ABIS.firstOrNull { abi ->
        stem.endsWith("-$abi", ignoreCase = true) || stem.endsWith("_$abi", ignoreCase = true)
    } ?: OTHER_ABI.find(stem)?.groupValues?.get(1)?.lowercase()
}

private val OTHER_ABI = Regex("(?:[-_])(x86|arm64|x86_64|aarch64|armeabi.*)$", RegexOption.IGNORE_CASE)

/**
 * Picks the APK to install from a release's assets.
 *
 * The order is the one Android's own split installer uses: the device's most
 * preferred ABI first, then its fallbacks, and only then the universal build.
 * A release that carries only an incompatible ABI yields null rather than a
 * file that would install and then fail on its first `dlopen`.
 *
 * [prefix] keeps the phone app's files apart from the TV app's, which ship in
 * the same release (`MusoPhone-` never matches `MusoPhoneTV-`).
 */
fun selectApk(
    assets: List<ReleaseAsset>,
    deviceAbis: List<String>,
    prefix: String = "MusoPhone-",
): ReleaseAsset? {
    val candidates = assets.mapNotNull { asset ->
        val name = asset.name
        val ours = name.startsWith(prefix, ignoreCase = true) &&
            name.endsWith(".apk", ignoreCase = true) &&
            !name.contains("unsigned", ignoreCase = true) &&
            !name.contains("benchmark", ignoreCase = true) &&
            !name.contains("dev-", ignoreCase = true)
        if (ours) asset to abiOfAsset(name) else null
    }
    if (candidates.isEmpty()) return null

    // 1. A split for one of this device's ABIs, in its own preference order.
    for (abi in deviceAbis) {
        candidates.firstOrNull { (_, assetAbi) -> assetAbi == abi }?.let { return it.first }
    }
    // 2. The universal build — it installs anywhere, native code included.
    candidates.firstOrNull { (_, assetAbi) -> assetAbi == null }?.let { return it.first }
    // 3. An ABI nobody on the device supports is not a candidate at all.
    return null
}

/**
 * Parses a `SHA256SUMS.txt` in the `<hex>  <filename>` form `sha256sum`
 * writes. Blank lines and comments are ignored.
 */
fun parseChecksums(text: String): Map<String, String> = buildMap {
    text.lineSequence().forEach { line ->
        val trimmed = line.trim()
        if (trimmed.isEmpty() || trimmed.startsWith("#")) return@forEach
        val parts = trimmed.split(Regex("\\s+"), limit = 2)
        if (parts.size == 2) {
            val hex = parts[0].lowercase()
            if (hex.length == 64 && hex.all { it in "0123456789abcdef" }) {
                put(parts[1].trim().removePrefix("*"), hex)
            }
        }
    }
}

/**
 * Whether a skipped release is still inside its 24-hour quiet period.
 *
 * Skip is a snooze, not a dismissal: once [skippedUntil] passes the release is
 * offered again, and an update that is superseded by a newer release is never
 * suppressed by an older skip because the version must match too.
 */
fun isSkippedNow(
    nowMillis: Long,
    skippedVersion: String?,
    skippedUntilMillis: Long,
    version: String,
): Boolean =
    !skippedVersion.isNullOrBlank() &&
        compareVersions(skippedVersion, version) == 0 &&
        skippedUntilMillis > nowMillis

/** How long "Skip for 1 Day" silences one release. */
const val SKIP_DURATION_MILLIS: Long = 24L * 60L * 60L * 1000L

/** How often the lightweight foreground check may touch the network. */
const val FOREGROUND_CHECK_INTERVAL_MILLIS: Long = 6L * 60L * 60L * 1000L

/** How often WorkManager re-checks while the app is not running. */
const val PERIODIC_CHECK_INTERVAL_HOURS: Long = 24L
