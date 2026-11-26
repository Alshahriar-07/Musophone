package com.music.bitchord.data.update

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

/**
 * The official GitHub Releases API, and nothing else.
 *
 * The repository is the one the app is published from; there is deliberately
 * no configurable update server, because a configurable one would mean the
 * APK installed on a listener's phone could be chosen by whoever controls
 * that setting rather than by the project's own release page.
 *
 * `releases/latest` already excludes drafts and prereleases, which is exactly
 * the "stable release only" rule this app wants — GitHub applies it, so the
 * app cannot get it wrong.
 */
class GitHubReleases(
    private val latestReleaseUrl: String = DEFAULT_LATEST_RELEASE_URL,
    private val client: OkHttpClient = defaultClient,
    private val json: Json = JSON,
) {

    /**
     * Fetches the newest stable release, or null when there is none (a 404 is
     * a repository with no published releases, not an error worth surfacing).
     *
     * @throws java.io.IOException on network failure, so the caller can tell
     * "could not check" from "nothing newer".
     */
    suspend fun latest(): RemoteRelease? = withContext(Dispatchers.IO) {
        val response = client.newCall(
            Request.Builder()
                .url(latestReleaseUrl)
                .header("Accept", "application/vnd.github+json")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .header("User-Agent", USER_AGENT)
                .build(),
        ).execute()
        response.use {
            if (it.code == 404) return@use null
            if (!it.isSuccessful) error("GitHub API returned HTTP ${it.code}")
            val body = it.body?.string() ?: return@use null
            parseRelease(body)
        }
    }

    /** Parses one release object. Exposed for tests rather than duplicated there. */
    fun parseRelease(body: String): RemoteRelease? {
        val release = runCatching { json.parseToJsonElement(body).jsonObject }.getOrNull()
            ?: return null
        val tag = release["tag_name"]?.jsonPrimitive?.contentOrNull ?: return null
        val releaseUrl = release["html_url"]?.jsonPrimitive?.contentOrNull ?: return null
        if (release["draft"]?.jsonPrimitive?.contentOrNull == "true") return null
        if (release["prerelease"]?.jsonPrimitive?.contentOrNull == "true") return null

        val assets = release["assets"]?.jsonArray
            ?.mapNotNull { element ->
                val asset = runCatching { element.jsonObject }.getOrNull() ?: return@mapNotNull null
                val name = asset["name"]?.jsonPrimitive?.contentOrNull ?: return@mapNotNull null
                val url = asset["browser_download_url"]?.jsonPrimitive?.contentOrNull
                    ?: return@mapNotNull null
                val state = asset["state"]?.jsonPrimitive?.contentOrNull
                if (state != null && state != "uploaded") return@mapNotNull null
                ReleaseAsset(
                    name = name,
                    url = url,
                    sizeBytes = asset["size"]?.jsonPrimitive?.intOrNull?.toLong(),
                    sha256 = parseDigest(asset["digest"]?.jsonPrimitive?.contentOrNull),
                )
            }
            .orEmpty()

        return RemoteRelease(
            tag = tag,
            versionName = normalizedVersion(tag),
            versionCode = null,
            notes = release["body"]?.jsonPrimitive?.contentOrNull,
            releaseUrl = releaseUrl,
            assets = assets,
            publishedAt = release["published_at"]?.jsonPrimitive?.contentOrNull,
        )
    }

    /**
     * Fills in the version code from the release's optional `update-manifest.json`
     * and, where an asset carries no digest of its own, from the release's
     * `SHA256SUMS.txt`.
     *
     * Both files are assets of the same release, so they arrive from the same
     * origin as the APK. No checksum from outside the release is ever trusted.
     * A failure here is not fatal: the APK can still be downloaded, and the
     * downloader then refuses to install it without a digest (see
     * `ApkInspector`), so an unverifiable build is reported rather than
     * silently installed.
     */
    suspend fun enrich(release: RemoteRelease): RemoteRelease = withContext(Dispatchers.IO) {
        var enriched = release
        manifestAsset(release)?.let { asset ->
            runCatching {
                fetch(asset.url)?.let { body ->
                    json.parseToJsonElement(body).jsonObject.let { manifest ->
                        val code = manifest["versionCode"]?.jsonPrimitive?.intOrNull
                        val name = manifest["versionName"]?.jsonPrimitive?.contentOrNull
                        enriched = enriched.copy(
                            versionCode = code ?: enriched.versionCode,
                            versionName = name?.let(::normalizedVersion) ?: enriched.versionName,
                        )
                    }
                }
            }
        }
        val assetsWithoutDigest = enriched.assets.filter { it.sha256 == null && it.name.endsWith(".apk", true) }
        if (assetsWithoutDigest.isNotEmpty()) {
            checksumsAsset(enriched)?.let { asset ->
                runCatching {
                    fetch(asset.url)?.let { body ->
                        val sums = parseChecksums(body)
                        if (sums.isNotEmpty()) {
                            enriched = enriched.copy(
                                assets = enriched.assets.map { a ->
                                    if (a.sha256 == null) a.copy(sha256 = sums[a.name]) else a
                                },
                            )
                        }
                    }
                }
            }
        }
        enriched
    }

    private fun manifestAsset(release: RemoteRelease): ReleaseAsset? =
        release.assets.firstOrNull { it.name.equals(MANIFEST_NAME, ignoreCase = true) }

    private fun checksumsAsset(release: RemoteRelease): ReleaseAsset? =
        release.assets.firstOrNull { it.name.equals(CHECKSUMS_NAME, ignoreCase = true) }

    private fun fetch(url: String): String? {
        val response = client.newCall(
            Request.Builder()
                .url(url)
                .header("User-Agent", USER_AGENT)
                .build(),
        ).execute()
        return response.use { if (it.isSuccessful) it.body?.string() else null }
    }

    private fun parseDigest(raw: String?): String? {
        val value = raw?.trim()?.lowercase() ?: return null
        val hex = value.removePrefix("sha256:").removePrefix("sha256=")
        return hex.takeIf { it.length == 64 && it.all { c -> c in "0123456789abcdef" } }
    }

    companion object {
        const val DEFAULT_LATEST_RELEASE_URL =
            "https://api.github.com/repos/Alshahriar-07/Musophone/releases/latest"

        const val MANIFEST_NAME = "update-manifest.json"
        const val CHECKSUMS_NAME = "SHA256SUMS.txt"

        private const val USER_AGENT = "MusoPhone-Android-Updater"

        val JSON = Json { ignoreUnknownKeys = true }

        /** Bounded well below OkHttp's stock calls, which is what "reasonable timeouts" means here. */
        val defaultClient: OkHttpClient = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .callTimeout(30, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }
}
