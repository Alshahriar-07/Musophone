package com.music.bitchord.update

import com.music.bitchord.data.update.SKIP_DURATION_MILLIS
import com.music.bitchord.data.update.isSkippedNow
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * "Skip for 1 Day" is a snooze, not a dismissal. These are the edges that
 * make that true: it expires, it only covers the release it was tapped on,
 * and a newer release is never hidden by an older skip.
 */
class UpdateSkipTest {

    private val now = 1_000_000_000_000L

    @Test
    fun `one day is exactly 24 hours`() {
        assertEquals(24L * 60L * 60L * 1000L, SKIP_DURATION_MILLIS)
    }

    @Test
    fun `skipped release is suppressed while the day is running`() {
        assertTrue(
            isSkippedNow(
                nowMillis = now,
                skippedVersion = "3.2",
                skippedUntilMillis = now + SKIP_DURATION_MILLIS,
                version = "3.2",
            ),
        )
    }

    @Test
    fun `suppression ends when the deadline passes`() {
        assertFalse(
            isSkippedNow(
                nowMillis = now,
                skippedVersion = "3.2",
                skippedUntilMillis = now,
                version = "3.2",
            ),
        )
        assertFalse(
            isSkippedNow(
                nowMillis = now,
                skippedVersion = "3.2",
                skippedUntilMillis = now - 1,
                version = "3.2",
            ),
        )
    }

    @Test
    fun `a newer release is offered through an older skip`() {
        assertFalse(
            isSkippedNow(
                nowMillis = now,
                skippedVersion = "3.2",
                skippedUntilMillis = now + SKIP_DURATION_MILLIS,
                version = "3.3",
            ),
        )
    }

    @Test
    fun `other releases are not affected`() {
        assertFalse(
            isSkippedNow(
                nowMillis = now,
                skippedVersion = "3.2",
                skippedUntilMillis = now + SKIP_DURATION_MILLIS,
                version = "3.1",
            ),
        )
    }

    @Test
    fun `no skip stored means nothing is suppressed`() {
        assertFalse(isSkippedNow(now, null, now + SKIP_DURATION_MILLIS, "3.2"))
        assertFalse(isSkippedNow(now, "", now + SKIP_DURATION_MILLIS, "3.2"))
    }
}
