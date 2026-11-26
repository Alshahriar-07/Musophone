package com.music.bitchord.data

import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import androidx.work.ExistingWorkPolicy
import androidx.work.WorkManager
import com.music.bitchord.BuildConfig
import com.music.bitchord.data.update.ApkInspector
import com.music.bitchord.data.update.FOREGROUND_CHECK_INTERVAL_MILLIS
import com.music.bitchord.data.update.GitHubReleases
import com.music.bitchord.data.update.MUSO_ABIS
import com.music.bitchord.data.update.RemoteRelease
import com.music.bitchord.data.update.SKIP_DURATION_MILLIS
import com.music.bitchord.data.update.UpdateDownloadWorker
import com.music.bitchord.data.update.UpdatePreferences
import com.music.bitchord.data.update.UpdateScheduler
import com.music.bitchord.data.update.isUpdateAvailable
import com.music.bitchord.data.update.selectApk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File

/**
 * MusoPhone ships as a sideloaded APK off GitHub Releases rather than through
 * a store, so there is nothing to push an update notice on its own. This is
 * the whole update round trip: check the repository's latest stable release,
 * compare it with the running build, download the right APK in the
 * background, verify it, and hand it to Android's installer.
 *
 * The download is a [UpdateDownloadWorker], not a coroutine tied to a screen:
 * backgrounding the app no longer kills it, and its progress survives process
 * recreation. This object is the UI's view of that work.
 */
object AppUpdateChecker {

    /**
     * A newer release this install may take.
     *
     * [apkUrl], [sizeBytes] and [sha256] describe the one asset chosen for this
     * device's ABI; the dialog can therefore show an honest size and the
     * downloader has everything it needs without re-querying GitHub.
     */
    data class UpdateInfo(
        val version: String,
        val releaseUrl: String,
        val apkUrl: String?,
        /** The release's own Markdown body, shown as this update's "what's new". */
        val notes: String?,
        val versionCode: Int? = null,
        val sizeBytes: Long? = null,
        val sha256: String? = null,
        val assetName: String? = null,
    )

    enum class CheckResult { Ok, NoUpdate, Throttled, NetworkError, HttpError }

    private val releases = GitHubReleases()

    /** A launch check and a foreground check can arrive together; one wins. */
    private val checkMutex = kotlinx.coroutines.sync.Mutex()

    private var appContext: Context? = null

    private val _available = MutableStateFlow<UpdateInfo?>(null)
    val available: StateFlow<UpdateInfo?> = _available.asStateFlow()

    /** Where this update's APK download currently stands, for the dialog's progress row. */
    sealed interface DownloadState {
        data object Idle : DownloadState
        data class Downloading(val fraction: Float) : DownloadState
        data class Verifying(val fraction: Float) : DownloadState
        data class Ready(val file: File) : DownloadState
        data class Failed(val message: String) : DownloadState
    }

    private val _download = MutableStateFlow<DownloadState>(DownloadState.Idle)
    val download: StateFlow<DownloadState> = _download.asStateFlow()

    /** The version the current download belongs to, so a stale worker cannot overwrite a newer one. */
    @Volatile
    private var downloadingVersion: String? = null

    fun init(context: Context) {
        appContext = context.applicationContext
        // A download finished before this process existed is still installable.
        runCatching { restoreDownload(context) }
    }

    /** For Settings: whether automatic checking is on. */
    val autoCheck: StateFlow<Boolean>
        get() = UpdatePreferences.get(requireContext()).autoCheck

    /** For Settings: epoch millis of the last completed check, or 0. */
    val lastCheckAt: StateFlow<Long>
        get() = UpdatePreferences.get(requireContext()).lastCheckAt

    val lastCheckFailed: StateFlow<Boolean>
        get() = UpdatePreferences.get(requireContext()).lastCheckFailed

    fun setAutoCheck(context: Context, enabled: Boolean) {
        UpdatePreferences.get(context).setAutoCheck(enabled)
        if (enabled) {
            UpdateScheduler.ensurePeriodic(context)
        } else {
            UpdateScheduler.cancelPeriodic(context)
        }
    }

    private fun requireContext(): Context =
        appContext ?: error("AppUpdateChecker.init() has not been called")

    private fun hasNetwork(context: Context): Boolean {
        val manager = context.getSystemService(ConnectivityManager::class.java) ?: return true
        val capabilities = manager.getNetworkCapabilities(manager.activeNetwork) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    /**
     * A foreground check, throttled to once every six hours unless [force] is
     * set by the Settings screen. Called after launch and when the app returns
     * to the foreground; the navigation between tabs never calls it.
     */
    suspend fun check(force: Boolean = false): CheckResult =
        performCheck(requireContext(), background = false, force = force)

    /**
     * The shared body of both the foreground check and [UpdateCheckWorker].
     *
     * Never throws: an update check is a courtesy, and a phone that cannot
     * reach GitHub must keep playing music exactly as before.
     */
    suspend fun performCheck(
        context: Context,
        background: Boolean,
        force: Boolean = false,
    ): CheckResult = checkMutex.withLock {
      withContext(Dispatchers.IO) {
        val prefs = UpdatePreferences.get(context)
        val now = System.currentTimeMillis()
        if (!prefs.autoCheck.value && !force) return@withContext CheckResult.Throttled
        val sinceLast = now - prefs.lastCheckAt.value
        if (!force && sinceLast in 0 until FOREGROUND_CHECK_INTERVAL_MILLIS) {
            return@withContext CheckResult.Throttled
        }
        if (!hasNetwork(context)) {
            // Offline is not a failed check; leave the timestamp alone so the
            // first online launch checks immediately. An APK already
            // downloaded remains ready to install.
            restoreDownload(context)
            return@withContext CheckResult.NetworkError
        }

        val release = try {
            releases.latest()
        } catch (error: Exception) {
            prefs.recordCheck(now, failed = true)
            _available.value = null
            restoreDownload(context)
            return@withContext if (error is java.io.IOException) {
                CheckResult.NetworkError
            } else {
                CheckResult.HttpError
            }
        }
        prefs.recordCheck(now, failed = false)
        if (release == null) {
            _available.value = null
            return@withContext CheckResult.NoUpdate
        }

        val enriched = runCatching { releases.enrich(release) }.getOrElse { release }
        if (!isUpdateAvailable(enriched, BuildConfig.VERSION_NAME, BuildConfig.VERSION_CODE)) {
            _available.value = null
            prefs.clearDownloaded()
            return@withContext CheckResult.NoUpdate
        }
        if (!force && prefs.shouldSuppress(enriched.versionName)) {
            _available.value = null
            return@withContext CheckResult.NoUpdate
        }

        val apk = enriched.apkFor(deviceAbis())
        val info = enriched.toInfo(apk)
        // Already announced in an earlier session and not snoozed: the top
        // bar keeps its quiet icon, but no second popup is raised.
        // Announced once per release. The release still has its quiet top-bar
        // icon, and Settings can ask for it again; what does not happen is the
        // same popup appearing launch after launch for the same build.
        val announcedBefore = !force && prefs.notifiedVersion == enriched.versionName
        _available.value = if (announcedBefore) null else info
        if (!announcedBefore) prefs.markNotified(enriched.versionName)

        restoreDownload(context, info)
        CheckResult.Ok
      }
    }

    private fun deviceAbis(): List<String> {
        // The project builds arm64-v8a, armeabi-v7a and x86_64. Anything else
        // a device reports (a riscv64 phone, say) is not ours to offer.
        val supported = Build.SUPPORTED_ABIS.toList()
        return supported.filter { it in MUSO_ABIS } + supported.filter { it !in MUSO_ABIS }
    }

    private fun RemoteRelease.toInfo(apk: com.music.bitchord.data.update.ReleaseAsset?): UpdateInfo =
        UpdateInfo(
            version = versionName,
            releaseUrl = releaseUrl,
            apkUrl = apk?.url,
            notes = notes,
            versionCode = versionCode,
            sizeBytes = apk?.sizeBytes,
            sha256 = apk?.sha256,
            assetName = apk?.name,
        )

    /**
     * Re-adopts a download finished by a worker before this process started,
     * and clears any APK left over from a different release.
     */
    fun restoreDownload(context: Context, info: UpdateInfo? = _available.value) {
        val prefs = UpdatePreferences.get(context)
        val path = prefs.downloadedPath ?: return
        val version = prefs.downloadedVersion ?: return
        val file = File(path)
        if (!file.isFile || file.length() == 0L) {
            prefs.clearDownloaded()
            return
        }
        if (info != null && version != info.version) {
            file.delete()
            prefs.clearDownloaded()
            return
        }
        if (_download.value is DownloadState.Downloading) return
        _download.value = DownloadState.Ready(file)
    }

    /** Starts (or resumes) the background download of the advertised release. */
    fun downloadApk(context: Context) {
        val info = _available.value ?: return
        val url = info.apkUrl ?: return
        downloadingVersion = info.version
        _download.value = DownloadState.Downloading(0f)
        UpdatePreferences.get(context).recordError(null)
        val request = UpdateDownloadWorker.request(
            version = info.version,
            url = url,
            sha256 = info.sha256,
            versionCode = info.versionCode,
            fileName = info.assetName ?: "MusoPhone-${info.version}.apk",
        ).build()
        WorkManager.getInstance(context).enqueueUniqueWork(
            UpdateDownloadWorker.UNIQUE_NAME,
            ExistingWorkPolicy.REPLACE,
            request,
        )
    }

    /** Stops an in-flight download; its partial file is removed by the worker. */
    fun cancelDownload(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(UpdateDownloadWorker.UNIQUE_NAME)
        _download.value = DownloadState.Idle
        downloadingVersion = null
    }

    /** Back to square one after a failure, so the dialog offers Download again. */
    fun resetDownload() {
        _download.value = DownloadState.Idle
        downloadingVersion = null
    }

    // ---- Worker callbacks -------------------------------------------------
    // Same process, so the worker reports straight into the flows the dialog
    // reads. The (version) guard keeps a late callback from a cancelled
    // download from painting over a newer one.

    fun onDownloadProgress(version: String, fraction: Float) {
        if (downloadingVersion != version) return
        _download.value = DownloadState.Downloading(fraction)
    }

    fun onDownloadFinished(version: String, file: File) {
        if (downloadingVersion != version) return
        downloadingVersion = null
        _download.value = DownloadState.Ready(file)
    }

    fun onDownloadFailed(message: String) {
        downloadingVersion = null
        _download.value = DownloadState.Failed(message)
    }

    fun onDownloadCancelled() {
        downloadingVersion = null
        _download.value = DownloadState.Idle
    }

    /**
     * Snoozes this release for exactly 24 hours. The version and the deadline
     * both persist, so the dialog stays away across restarts and comes back
     * when the day is up — or never, if a newer release supersedes it.
     */
    fun skipForOneDay(context: Context) {
        val info = _available.value ?: return
        val prefs = UpdatePreferences.get(context)
        val now = System.currentTimeMillis()
        prefs.skip(info.version, now + SKIP_DURATION_MILLIS)
        // So the check after the 24 hours announces it again rather than
        // treating it as already seen — see clearNotified.
        prefs.clearNotified()
        _available.value = null
    }

    /**
     * Wipes APKs left in the cache. Kept for the cold-start call site; a
     * finished download this session is re-adopted by [restoreDownload]
     * rather than deleted, so "Install" does not vanish on a rotation or a
     * process restart.
     */
    suspend fun clearCache(context: Context) = withContext(Dispatchers.IO) {
        val prefs = UpdatePreferences.get(context)
        val keep = prefs.downloadedPath
        File(context.cacheDir, UpdateDownloadWorker.CACHE_SUBDIR).listFiles()?.forEach { file ->
            if (file.absolutePath != keep) file.delete()
        }
    }

    /**
     * Hands a downloaded APK to the system installer.
     *
     * The file is verified once more here, immediately before the intent: a
     * file in a cache directory is writable by nothing else, but the gap
     * between download and Install can be hours, and the check is cheap
     * relative to installing the wrong thing.
     *
     * Sideloaded apps need the user's blessing per app ("install unknown
     * apps"). Without it the installer intent silently does nothing on most
     * ROMs, so the user is sent to that one switch first and taps Install
     * again after. The Ready state is kept so the button is still there.
     */
    fun installApk(context: Context, file: File): ApkInspector.Result {
        val info = _available.value
        // The advertised release is the live source, but a process restart (or
        // an offline launch) can leave a finished download with no release in
        // memory; its own persisted metadata is then the authority.
        val prefs = UpdatePreferences.get(context)
        val verify = ApkInspector.verifyInstallable(
            context = context,
            file = file,
            expectedVersionCode = info?.versionCode ?: prefs.downloadedVersionCode.takeIf { it > 0 },
            expectedChecksum = info?.sha256 ?: prefs.downloadedSha256,
        )
        if (verify is ApkInspector.Result.Invalid) {
            file.delete()
            UpdatePreferences.get(context).clearDownloaded()
            _download.value = DownloadState.Failed(verify.reason)
            return verify
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            val opened = runCatching {
                context.startActivity(
                    Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES)
                        .setData(Uri.parse("package:${context.packageName}"))
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                )
            }.isSuccess
            if (opened) return verify
        }

        val uri: Uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file,
        )
        val mime = "application/vnd.android.package-archive"
        fun installer(action: String) = Intent(action)
            .setDataAndType(uri, mime)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            .putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true)
            .putExtra(Intent.EXTRA_RETURN_RESULT, true)
            .apply { clipData = android.content.ClipData.newRawUri("apk", uri) }
        // Some TV / minimal ROMs have no ACTION_VIEW handler for package
        // archives; the legacy package-installer action is the fallback.
        val install = installer(Intent.ACTION_VIEW)
        val resolved = context.packageManager.queryIntentActivities(install, 0).isNotEmpty()
        val target = if (resolved) install else installer(Intent.ACTION_INSTALL_PACKAGE)
        runCatching { context.startActivity(target) }.onFailure { error ->
            _download.value = DownloadState.Failed(
                error.message ?: "No app on this device can install the update.",
            )
        }
        return verify
    }
}
