package com.music.bitchord.data.update

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.ForegroundInfo
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.music.bitchord.R
import com.music.bitchord.data.AppUpdateChecker
import kotlinx.coroutines.CancellationException
import java.io.File
import java.util.concurrent.TimeUnit

/**
 * Downloads one update APK in the background.
 *
 * WorkManager rather than a bare coroutine: the download survives the app
 * being backgrounded, its progress is persisted, and a transient network
 * failure is retried with backoff instead of leaving the user to find the
 * Download button again. It is unique per release, so tapping Install twice
 * cannot start two downloads of the same file.
 *
 * The integrity checks are done here, before the file is ever handed to the
 * installer — see [ApkInspector]. A failed check deletes the file rather than
 * leaving something installable-looking in the cache.
 */
class UpdateDownloadWorker(
    appContext: Context,
    params: WorkerParameters,
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val version = inputData.getString(KEY_VERSION) ?: return Result.failure()
        val url = inputData.getString(KEY_URL) ?: return Result.failure()
        val expectedSha = inputData.getString(KEY_SHA256)
        val expectedCode = inputData.getInt(KEY_VERSION_CODE, 0).takeIf { it > 0 }
        val fileName = inputData.getString(KEY_FILE_NAME) ?: "MusoPhone-$version.apk"

        val dir = File(applicationContext.cacheDir, CACHE_SUBDIR).apply { mkdirs() }
        // One download at a time: whatever an older attempt left is not this file.
        dir.listFiles()?.filter { it.name != fileName && !it.name.endsWith(".part") }?.forEach { it.delete() }
        val target = File(dir, fileName)
        val part = File(dir, "$fileName.part")

        showProgressNotification(version, 0f)

        try {
            val response = GitHubReleases.defaultClient.newCall(
                okhttp3.Request.Builder()
                    .url(url)
                    .header("User-Agent", "MusoPhone-Android-Updater")
                    .build(),
            ).execute()
            response.use {
                if (!it.isSuccessful) {
                    return failure("Download failed: HTTP ${it.code}")
                }
                val body = it.body ?: return failure("Download failed: empty response")
                val total = body.contentLength().takeIf { length -> length > 0 }
                body.byteStream().use { input ->
                    part.outputStream().use { output ->
                        val buffer = ByteArray(64 * 1024)
                        var readTotal = 0L
                        var lastPublishedPercent = -1
                        while (true) {
                            val read = input.read(buffer)
                            if (read < 0) break
                            output.write(buffer, 0, read)
                            readTotal += read
                            val fraction = total?.let { (readTotal.toFloat() / it).coerceIn(0f, 1f) }
                            // A percent at a time: a StateFlow write per 64 KB
                            // would recompose the dialog far more than it changes.
                            if (fraction != null && (fraction * 100).toInt() != lastPublishedPercent) {
                                lastPublishedPercent = (fraction * 100).toInt()
                                setProgress(workDataOf(KEY_PROGRESS to fraction))
                                AppUpdateChecker.onDownloadProgress(version, fraction)
                                showProgressNotification(version, fraction)
                            }
                        }
                    }
                }
            }
            if (part.length() == 0L) return failure("The download was empty.")

            if (!ApkInspector.matchesChecksum(part, expectedSha)) {
                part.delete()
                return failure(
                    if (expectedSha.isNullOrBlank()) {
                        "This release published no checksum, so the download could not be verified."
                    } else {
                        "The download did not match the release's SHA-256 checksum."
                    },
                )
            }

            if (target.exists()) target.delete()
            if (!part.renameTo(target)) {
                part.copyTo(target, overwrite = true)
                part.delete()
            }

            when (val check = ApkInspector.verifyInstallable(applicationContext, target, expectedCode, expectedSha)) {
                is ApkInspector.Result.Invalid -> {
                    target.delete()
                    return failure(check.reason)
                }
                ApkInspector.Result.Valid -> Unit
            }

            UpdatePreferences.get(applicationContext).markDownloaded(
                version = version,
                path = target.absolutePath,
                sha256 = expectedSha,
                versionCode = expectedCode ?: 0,
            )
            AppUpdateChecker.onDownloadFinished(version, target)
            cancelNotification()
            return Result.success()
        } catch (cancelled: CancellationException) {
            part.delete()
            AppUpdateChecker.onDownloadCancelled()
            cancelNotification()
            throw cancelled
        } catch (error: Exception) {
            part.delete()
            // Transient failures get WorkManager's exponential backoff; a
            // permanent one (bad URL, 4xx) should not spin for hours.
            val retryable = error is java.io.IOException
            return if (retryable && runAttemptCount < MAX_ATTEMPTS) {
                AppUpdateChecker.onDownloadProgress(version, 0f)
                Result.retry()
            } else {
                failure(error.message ?: "Download failed")
            }
        }
    }

    /**
     * A check that cannot succeed on a retry — a bad checksum, a wrong
     * package, a 4xx — ends the work rather than spending the battery on it.
     * Transient I/O failures take the retry path in [doWork] instead.
     */
    private fun failure(message: String): Result {
        UpdatePreferences.get(applicationContext).recordError(message)
        AppUpdateChecker.onDownloadFailed(message)
        cancelNotification()
        return Result.failure()
    }

    private fun channelId() = CHANNEL_ID

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = applicationContext.getSystemService(NotificationManager::class.java) ?: return
        if (manager.getNotificationChannel(channelId()) != null) return
        manager.createNotificationChannel(
            NotificationChannel(
                channelId(),
                applicationContext.getString(R.string.update_channel_name),
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = applicationContext.getString(R.string.update_channel_description)
                setShowBadge(false)
            },
        )
    }

    private fun buildNotification(version: String, fraction: Float) =
        NotificationCompat.Builder(applicationContext, channelId())
            .setSmallIcon(R.drawable.ic_notification_logo)
            .setContentTitle(applicationContext.getString(R.string.update_download_title))
            .setContentText(
                applicationContext.getString(
                    R.string.update_download_progress,
                    version,
                    (fraction * 100).toInt(),
                ),
            )
            .setProgress(100, (fraction * 100).toInt(), false)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(openAppIntent())
            .build()

    private suspend fun showProgressNotification(version: String, fraction: Float) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = androidx.core.content.ContextCompat.checkSelfPermission(
                applicationContext,
                android.Manifest.permission.POST_NOTIFICATIONS,
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED
            if (!granted) return
        }
        ensureChannel()
        val info = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ForegroundInfo(
                NOTIFICATION_ID,
                buildNotification(version, fraction),
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC,
            )
        } else {
            ForegroundInfo(NOTIFICATION_ID, buildNotification(version, fraction))
        }
        // A manufacturer can refuse the foreground promotion; the download
        // itself still runs as ordinary WorkManager work, so this is not fatal.
        // Awaited rather than fire-and-forget so a refusal lands here instead of
        // surfacing as an unhandled future failure.
        try {
            setForeground(info)
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            // Promotion refused; the WorkManager job continues.
        }
    }

    private fun cancelNotification() {
        runCatching {
            applicationContext.getSystemService(NotificationManager::class.java)
                ?.cancel(NOTIFICATION_ID)
        }
    }

    private fun openAppIntent(): PendingIntent? = runCatching {
        val intent = applicationContext.packageManager
            .getLaunchIntentForPackage(applicationContext.packageName)
            ?: return@runCatching null
        PendingIntent.getActivity(
            applicationContext,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }.getOrNull()

    companion object {
        const val KEY_VERSION = "version"
        const val KEY_URL = "url"
        const val KEY_SHA256 = "sha256"
        const val KEY_VERSION_CODE = "version_code"
        const val KEY_FILE_NAME = "file_name"
        const val KEY_PROGRESS = "progress"

        const val CACHE_SUBDIR = "updates"
        private const val NOTIFICATION_ID = 0x4D55
        private const val CHANNEL_ID = "musophone_update_download"
        private const val MAX_ATTEMPTS = 3

        fun request(
            version: String,
            url: String,
            sha256: String?,
            versionCode: Int?,
            fileName: String,
        ): androidx.work.OneTimeWorkRequest.Builder =
            OneTimeWorkRequestBuilder<UpdateDownloadWorker>().apply {
                setInputData(
                    workDataOf(
                        KEY_VERSION to version,
                        KEY_URL to url,
                        KEY_SHA256 to sha256,
                        KEY_VERSION_CODE to (versionCode ?: 0),
                        KEY_FILE_NAME to fileName,
                    ),
                )
                setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build(),
                )
                addTag(TAG)
            }

        const val TAG = "musophone-update-download"
        const val UNIQUE_NAME = "musophone-update-download"
    }
}

/**
 * Checks GitHub in the background. Separate from the download so a failed
 * check can never affect an in-flight install, and so the check can be
 * scheduled as a daily, battery-friendly job.
 */
class UpdateCheckWorker(
    appContext: Context,
    params: WorkerParameters,
) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        val result = AppUpdateChecker.performCheck(applicationContext, background = true)
        return when (result) {
            AppUpdateChecker.CheckResult.Ok,
            AppUpdateChecker.CheckResult.NoUpdate,
            AppUpdateChecker.CheckResult.Throttled,
            -> Result.success()
            AppUpdateChecker.CheckResult.NetworkError -> Result.retry()
            AppUpdateChecker.CheckResult.HttpError -> Result.failure()
        }
    }

    companion object {
        const val UNIQUE_PERIODIC = "musophone-update-check-periodic"
        const val UNIQUE_ONE_OFF = "musophone-update-check-once"
    }
}

/** Schedules the two kinds of check: one at start-up, one daily in the background. */
object UpdateScheduler {

    private val networkConstraint = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .build()

    /**
     * Schedules the daily check. KEEP rather than UPDATE: replacing it every
     * launch would reset the period, so a listener who opens the app hourly
     * would never actually reach the 24-hour mark.
     */
    fun ensurePeriodic(context: Context) {
        if (!UpdatePreferences.get(context).autoCheck.value) {
            cancelPeriodic(context)
            return
        }
        val request = PeriodicWorkRequestBuilder<UpdateCheckWorker>(
            PERIODIC_CHECK_INTERVAL_HOURS,
            TimeUnit.HOURS,
        )
            .setConstraints(networkConstraint)
            .setBackoffCriteria(androidx.work.BackoffPolicy.EXPONENTIAL, 30, TimeUnit.MINUTES)
            .build()
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            UpdateCheckWorker.UNIQUE_PERIODIC,
            ExistingPeriodicWorkPolicy.KEEP,
            request,
        )
    }

    fun cancelPeriodic(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(UpdateCheckWorker.UNIQUE_PERIODIC)
    }

    /**
     * A one-off check after launch. Unique and KEEP, so a relaunch inside the
     * same window coalesces into the check that is already queued instead of
     * adding a second.
     */
    fun checkAtLaunch(context: Context) {
        if (!UpdatePreferences.get(context).autoCheck.value) return
        val request = OneTimeWorkRequestBuilder<UpdateCheckWorker>()
            .setConstraints(networkConstraint)
            .setBackoffCriteria(androidx.work.BackoffPolicy.EXPONENTIAL, 30, TimeUnit.MINUTES)
            .build()
        WorkManager.getInstance(context).enqueueUniqueWork(
            UpdateCheckWorker.UNIQUE_ONE_OFF,
            ExistingWorkPolicy.KEEP,
            request,
        )
    }
}
