package com.music.bitchord.update

import com.music.bitchord.data.update.RemoteRelease
import com.music.bitchord.data.update.compareVersions
import com.music.bitchord.data.update.isUpdateAvailable
import com.music.bitchord.data.update.normalizedVersion
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Version comparison is the gate in front of every update prompt, so it is
 * pinned here rather than left to whatever the UI happened to show.
 */
class UpdateVersionTest {

    private fun release(name: String, code: Int? = null) = RemoteRelease(
        tag = "v$name",
        versionName = name,
        versionCode = code,
        releaseUrl = "https://example.invalid",
    )

    @Test
    fun `tag prefix is stripped`() {
        assertEquals("3.2", normalizedVersion("v3.2"))
        assertEquals("3.2", normalizedVersion("V3.2"))
        assertEquals("3.2-beta1", normalizedVersion("v3.2-beta1"))
    }

    @Test
    fun `numeric comparison beats string comparison`() {
        assertTrue(compareVersions("3.10", "3.9") > 0)
        assertTrue(compareVersions("3.2", "3.1") > 0)
        assertEquals(0, compareVersions("3.2", "v3.2"))
    }

    @Test
    fun `beta sorts below the matching release`() {
        assertTrue(compareVersions("3.2", "3.2-beta2") > 0)
        assertTrue(compareVersions("3.2-beta2", "3.2") < 0)
        assertTrue(compareVersions("3.2-beta2", "3.2-beta1") > 0)
    }

    @Test
    fun `same version is not an update`() {
        assertFalse(isUpdateAvailable(release("3.2"), currentVersionName = "3.2", currentVersionCode = 53))
    }

    @Test
    fun `newer name is an update when no version code is published`() {
        assertTrue(isUpdateAvailable(release("3.3"), currentVersionName = "3.2", currentVersionCode = 53))
        assertFalse(isUpdateAvailable(release("3.1"), currentVersionName = "3.2", currentVersionCode = 53))
    }

    @Test
    fun `version code wins over the name when both exist`() {
        // A renamed build with an equal code would be refused by Android's
        // installer, so it must not be offered.
        assertFalse(
            isUpdateAvailable(release("3.2.1", 53), currentVersionName = "3.2", currentVersionCode = 53),
        )
        assertTrue(
            isUpdateAvailable(release("3.2.1", 54), currentVersionName = "3.2", currentVersionCode = 53),
        )
        // Even a lower name with a higher code is installable — the code is
        // the thing the signed APK is actually compared by.
        assertTrue(
            isUpdateAvailable(release("3.2", 54), currentVersionName = "3.2.1", currentVersionCode = 53),
        )
    }
}
