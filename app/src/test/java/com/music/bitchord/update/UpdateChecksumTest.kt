package com.music.bitchord.update

import com.music.bitchord.data.update.ApkInspector
import com.music.bitchord.data.update.parseChecksums
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

/** The checksum gate, and the SHA256SUMS.txt parser that feeds it. */
class UpdateChecksumTest {

    @get:Rule
    val folder = TemporaryFolder()

    @Test
    fun `sha256 of known bytes`() {
        val file = folder.newFile("abc.bin").apply { writeText("abc") }
        // SHA-256("abc"), the canonical test vector.
        assertEquals(
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
            ApkInspector.sha256(file),
        )
    }

    @Test
    fun `checksum match accepts plain and prefixed digests`() {
        val file = folder.newFile("payload.apk").apply { writeText("musophone") }
        val digest = ApkInspector.sha256(file)
        assertTrue(ApkInspector.matchesChecksum(file, digest))
        assertTrue(ApkInspector.matchesChecksum(file, "sha256:$digest"))
        assertTrue(ApkInspector.matchesChecksum(file, "  ${digest.uppercase()}  "))
    }

    @Test
    fun `checksum mismatch is rejected`() {
        val file = folder.newFile("payload.apk").apply { writeText("musophone") }
        assertFalse(ApkInspector.matchesChecksum(file, "0".repeat(64)))
    }

    @Test
    fun `missing or malformed checksum fails closed`() {
        val file = folder.newFile("payload.apk").apply { writeText("musophone") }
        assertFalse(ApkInspector.matchesChecksum(file, null))
        assertFalse(ApkInspector.matchesChecksum(file, ""))
        assertFalse(ApkInspector.matchesChecksum(file, "not-a-digest"))
        assertFalse(ApkInspector.matchesChecksum(file, "z".repeat(64)))
    }

    @Test
    fun `sha256sums file is parsed`() {
        val digest = "a".repeat(64)
        val text = """
            # MusoPhone v3.2
            $digest  MusoPhone-v3.2.apk
            ${"b".repeat(64)} *MusoPhone-v3.2-arm64-v8a.apk

        """.trimIndent()
        val sums = parseChecksums(text)
        assertEquals(digest, sums["MusoPhone-v3.2.apk"])
        assertEquals("b".repeat(64), sums["MusoPhone-v3.2-arm64-v8a.apk"])
        assertEquals(2, sums.size)
    }

    @Test
    fun `malformed lines are ignored`() {
        assertTrue(parseChecksums("nonsense\n${"c".repeat(63)}  short.apk").isEmpty())
    }
}
