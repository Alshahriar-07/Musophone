package com.music.bitchord.update

import com.music.bitchord.data.update.ReleaseAsset
import com.music.bitchord.data.update.abiOfAsset
import com.music.bitchord.data.update.selectApk
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * The release carries one APK per ABI plus a universal one. Picking the wrong
 * file installs an app that fails at its first native call, so the selection
 * rules are pinned here.
 */
class UpdateAssetSelectionTest {

    private fun asset(name: String) = ReleaseAsset(
        name = name,
        url = "https://example.invalid/$name",
        sizeBytes = 1_000,
        sha256 = "a".repeat(64),
    )

    private val release = listOf(
        asset("MusoPhone-v3.2.apk"),
        asset("MusoPhone-v3.2-arm64-v8a.apk"),
        asset("MusoPhone-v3.2-armeabi-v7a.apk"),
        asset("MusoPhone-v3.2-x86_64.apk"),
        asset("MusoPhoneTV-v3.2.apk"),
        asset("MusoPhoneTV-v3.2-arm64-v8a.apk"),
    )

    @Test
    fun `abi is read from either separator`() {
        assertEquals("arm64-v8a", abiOfAsset("MusoPhone-v3.2-arm64-v8a.apk"))
        assertEquals("arm64-v8a", abiOfAsset("MusoPhone-v3.1_arm64-v8a.apk"))
        assertNull(abiOfAsset("MusoPhone-v3.2.apk"))
    }

    @Test
    fun `prefers the device's own abi`() {
        val chosen = selectApk(release, listOf("x86_64", "arm64-v8a", "armeabi-v7a"))
        assertEquals("MusoPhone-v3.2-x86_64.apk", chosen?.name)
    }

    @Test
    fun `falls back to the first abi the device supports`() {
        val chosen = selectApk(release, listOf("armeabi-v7a", "arm64-v8a"))
        assertEquals("MusoPhone-v3.2-armeabi-v7a.apk", chosen?.name)
    }

    @Test
    fun `universal is only chosen when no split matches`() {
        val chosen = selectApk(release, listOf("mips", "riscv64"))
        assertEquals("MusoPhone-v3.2.apk", chosen?.name)
    }

    @Test
    fun `tv assets are never selected`() {
        val tvOnly = release.filter { it.name.startsWith("MusoPhoneTV") }
        assertNull(selectApk(tvOnly, listOf("arm64-v8a")))
    }

    @Test
    fun `incompatible split alone is not offered`() {
        val x86Only = listOf(asset("MusoPhone-v3.2-x86_64.apk"))
        assertNull(selectApk(x86Only, listOf("arm64-v8a", "armeabi-v7a")))
    }

    @Test
    fun `unsigned and benchmark builds are ignored`() {
        val trap = listOf(
            asset("MusoPhone-v3.2-unsigned.apk"),
            asset("MusoPhone-v3.2-benchmark.apk"),
        )
        assertNull(selectApk(trap, listOf("arm64-v8a")))
    }
}
