package com.music.bitchord.update

import com.music.bitchord.data.update.GitHubReleases
import kotlinx.coroutines.runBlocking
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test

/**
 * The GitHub side, against a real HTTP server rather than a fake of the client:
 * what this app sends and how it reads what comes back is the whole contract.
 */
class GitHubReleasesTest {

    private lateinit var server: MockWebServer

    private fun host() = server.url("/").toString().trimEnd('/')

    @Before
    fun setUp() {
        server = MockWebServer()
        server.dispatcher = object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse =
                when (request.requestUrl?.encodedPath) {
                    "/latest" -> MockResponse().setBody(releaseJson())
                    "/manifest.json" -> MockResponse().setBody("""{"versionName":"3.2","versionCode":53}""")
                    "/SHA256SUMS.txt" -> MockResponse().setBody(
                        "${"d".repeat(64)}  MusoPhone-v3.2.apk\n",
                    )
                    else -> MockResponse().setResponseCode(404)
                }
        }
        server.start()
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    private fun releaseJson(
        draft: Boolean = false,
        prerelease: Boolean = false,
    ): String {
        val h = host()
        return """
        {
          "tag_name": "v3.2",
          "html_url": "https://github.com/Alshahriar-07/Musophone/releases/tag/v3.2",
          "body": "Liquid glass and in-app updates.",
          "draft": $draft,
          "prerelease": $prerelease,
          "published_at": "2026-11-26T12:00:00Z",
          "assets": [
            {
              "name": "MusoPhone-v3.2.apk",
              "browser_download_url": "$h/MusoPhone-v3.2.apk",
              "size": 84000000,
              "state": "uploaded"
            },
            {
              "name": "MusoPhone-v3.2-arm64-v8a.apk",
              "browser_download_url": "$h/MusoPhone-v3.2-arm64-v8a.apk",
              "size": 46000000,
              "state": "uploaded",
              "digest": "sha256:${"a".repeat(64)}"
            },
            {
              "name": "update-manifest.json",
              "browser_download_url": "$h/manifest.json",
              "size": 64,
              "state": "uploaded"
            },
            {
              "name": "SHA256SUMS.txt",
              "browser_download_url": "$h/SHA256SUMS.txt",
              "size": 128,
              "state": "uploaded"
            },
            {
              "name": "MusoPhone-v3.2-x86_64.apk",
              "browser_download_url": "$h/uploading.apk",
              "size": 100,
              "state": "starter"
            }
          ]
        }
        """.trimIndent()
    }

    @Test
    fun `latest release is parsed with its assets`() = runBlocking {
        val releases = GitHubReleases(latestReleaseUrl = "${host()}/latest")
        val release = releases.latest()
        assertNotNull(release)
        assertEquals("v3.2", release!!.tag)
        assertEquals("3.2", release.versionName)
        assertEquals("Liquid glass and in-app updates.", release.notes)
        // The unfinished asset is dropped; the rest are kept.
        assertEquals(4, release.assets.size)
        val arm64 = release.assets.first { it.name.endsWith("arm64-v8a.apk") }
        assertEquals("a".repeat(64), arm64.sha256)
        assertEquals(46_000_000L, arm64.sizeBytes)
    }

    @Test
    fun `prerelease and draft are ignored`() = runBlocking {
        val releases = GitHubReleases(latestReleaseUrl = "${host()}/latest")
        assertNull(releases.parseRelease(releaseJson(prerelease = true)))
        assertNull(releases.parseRelease(releaseJson(draft = true)))
    }

    @Test
    fun `a repository with no releases is not an error`() = runBlocking {
        val releases = GitHubReleases(latestReleaseUrl = "${host()}/missing")
        assertNull(releases.latest())
    }

    @Test
    fun `manifest supplies the version code and checksums fill missing digests`() = runBlocking {
        val releases = GitHubReleases(latestReleaseUrl = "${host()}/latest")
        val release = releases.latest()!!
        val enriched = releases.enrich(release)
        assertEquals(53, enriched.versionCode)
        assertEquals(
            "d".repeat(64),
            enriched.assets.first { it.name == "MusoPhone-v3.2.apk" }.sha256,
        )
        // An asset that already carried a digest keeps it.
        assertEquals(
            "a".repeat(64),
            enriched.assets.first { it.name.endsWith("arm64-v8a.apk") }.sha256,
        )
        // And the selection now uses the code-aware path.
        assertEquals(
            "MusoPhone-v3.2-arm64-v8a.apk",
            enriched.apkFor(listOf("arm64-v8a", "armeabi-v7a"))?.name,
        )
    }

    @Test
    fun `requests identify the app and ask for the stable API`() = runBlocking {
        val releases = GitHubReleases(latestReleaseUrl = "${host()}/latest")
        releases.latest()
        val request = server.takeRequest()
        assertEquals("MusoPhone-Android-Updater", request.getHeader("User-Agent"))
        assertEquals("application/vnd.github+json", request.getHeader("Accept"))
    }
}
