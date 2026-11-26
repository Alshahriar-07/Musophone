package com.music.bitchord.data.update

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Everything about updating that has to outlive a process: the release the
 * user snoozed and until when, when the last check succeeded, which release
 * was already announced, whether automatic checking is on, and where a
 * finished APK was left.
 *
 * Kept in plain SharedPreferences rather than an encrypted store: none of it
 * is a secret, and an update check must work before any keystore-backed store
 * has finished opening.
 */
class UpdatePreferences private constructor(context: Context) {

    private val prefs = context.applicationContext
        .getSharedPreferences("musophone_updates", Context.MODE_PRIVATE)

    private val _autoCheck = MutableStateFlow(prefs.getBoolean(KEY_AUTO_CHECK, true))
    val autoCheck: StateFlow<Boolean> = _autoCheck.asStateFlow()

    private val _lastCheckAt = MutableStateFlow(prefs.getLong(KEY_LAST_CHECK_AT, 0L))
    val lastCheckAt: StateFlow<Long> = _lastCheckAt.asStateFlow()

    private val _lastCheckFailed = MutableStateFlow(prefs.getBoolean(KEY_LAST_CHECK_FAILED, false))
    val lastCheckFailed: StateFlow<Boolean> = _lastCheckFailed.asStateFlow()

    var skippedVersion: String?
        get() = prefs.getString(KEY_SKIP_VERSION, null)
        private set(value) = prefs.edit().putString(KEY_SKIP_VERSION, value).apply()

    var skippedUntil: Long
        get() = prefs.getLong(KEY_SKIP_UNTIL, 0L)
        private set(value) = prefs.edit().putLong(KEY_SKIP_UNTIL, value).apply()

    var notifiedVersion: String?
        get() = prefs.getString(KEY_NOTIFIED_VERSION, null)
        private set(value) = prefs.edit().putString(KEY_NOTIFIED_VERSION, value).apply()

    var downloadedVersion: String?
        get() = prefs.getString(KEY_DOWNLOADED_VERSION, null)
        private set(value) = prefs.edit().putString(KEY_DOWNLOADED_VERSION, value).apply()

    var downloadedPath: String?
        get() = prefs.getString(KEY_DOWNLOADED_PATH, null)
        private set(value) = prefs.edit().putString(KEY_DOWNLOADED_PATH, value).apply()

    /** The checksum the finished download was verified against, kept for a later install. */
    var downloadedSha256: String?
        get() = prefs.getString(KEY_DOWNLOADED_SHA256, null)
        private set(value) = prefs.edit().putString(KEY_DOWNLOADED_SHA256, value).apply()

    /** The release's version code, so Installation can be re-checked after a restart. */
    var downloadedVersionCode: Int
        get() = prefs.getInt(KEY_DOWNLOADED_VERSION_CODE, 0)
        private set(value) = prefs.edit().putInt(KEY_DOWNLOADED_VERSION_CODE, value).apply()

    var lastError: String?
        get() = prefs.getString(KEY_LAST_ERROR, null)
        private set(value) = prefs.edit().putString(KEY_LAST_ERROR, value).apply()

    fun setAutoCheck(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_AUTO_CHECK, enabled).apply()
        _autoCheck.value = enabled
    }

    fun recordCheck(atMillis: Long, failed: Boolean) {
        prefs.edit()
            .putLong(KEY_LAST_CHECK_AT, atMillis)
            .putBoolean(KEY_LAST_CHECK_FAILED, failed)
            .apply()
        _lastCheckAt.value = atMillis
        _lastCheckFailed.value = failed
    }

    fun skip(version: String, untilMillis: Long) {
        prefs.edit()
            .putString(KEY_SKIP_VERSION, version)
            .putLong(KEY_SKIP_UNTIL, untilMillis)
            .apply()
    }

    fun markNotified(version: String) {
        prefs.edit().putString(KEY_NOTIFIED_VERSION, version).apply()
    }

    fun markDownloaded(version: String, path: String, sha256: String?, versionCode: Int) {
        prefs.edit()
            .putString(KEY_DOWNLOADED_VERSION, version)
            .putString(KEY_DOWNLOADED_PATH, path)
            .putString(KEY_DOWNLOADED_SHA256, sha256)
            .putInt(KEY_DOWNLOADED_VERSION_CODE, versionCode)
            .remove(KEY_LAST_ERROR)
            .apply()
        prefs.edit().putString(KEY_NOTIFIED_VERSION, version).apply()
    }

    fun clearDownloaded() {
        prefs.edit()
            .remove(KEY_DOWNLOADED_VERSION)
            .remove(KEY_DOWNLOADED_PATH)
            .remove(KEY_DOWNLOADED_SHA256)
            .remove(KEY_DOWNLOADED_VERSION_CODE)
            .apply()
        downloadedVersion = null
        downloadedPath = null
    }

    /**
     * Lets an expired skip be announced again. Called when Skip is tapped: the
     * next check inside the 24 hours is suppressed by the skip itself, and the
     * first one after it is a fresh notification rather than "already seen".
     */
    fun clearNotified() {
        prefs.edit().remove(KEY_NOTIFIED_VERSION).apply()
    }

    fun recordError(message: String?) {
        prefs.edit().putString(KEY_LAST_ERROR, message).apply()
        lastError = message
    }

    fun shouldSuppress(version: String, nowMillis: Long = System.currentTimeMillis()): Boolean =
        isSkippedNow(nowMillis, skippedVersion, skippedUntil, version)

    companion object {
        private const val KEY_AUTO_CHECK = "auto_check"
        private const val KEY_LAST_CHECK_AT = "last_check_at"
        private const val KEY_LAST_CHECK_FAILED = "last_check_failed"
        private const val KEY_SKIP_VERSION = "skip_version"
        private const val KEY_SKIP_UNTIL = "skip_until"
        private const val KEY_NOTIFIED_VERSION = "notified_version"
        private const val KEY_DOWNLOADED_VERSION = "downloaded_version"
        private const val KEY_DOWNLOADED_PATH = "downloaded_path"
        private const val KEY_DOWNLOADED_SHA256 = "downloaded_sha256"
        private const val KEY_DOWNLOADED_VERSION_CODE = "downloaded_version_code"
        private const val KEY_LAST_ERROR = "last_error"

        @Volatile
        private var instance: UpdatePreferences? = null

        /** The process-wide store. Safe to call from a worker and from the UI. */
        fun get(context: Context): UpdatePreferences =
            instance ?: synchronized(this) {
                instance ?: UpdatePreferences(context).also { instance = it }
            }
    }
}
