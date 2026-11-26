package com.music.bitchord.data.update

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import java.io.File
import java.security.MessageDigest

/**
 * Checks a downloaded APK before Android is asked to install it.
 *
 * Three things have to hold, and none of them is optional: the bytes must be
 * the ones the release published (SHA-256), the archive must be this app
 * (package name), and it must be a version this install may replace (version
 * code not lower than what is running). A signature mismatch is caught too
 * where the platform will report it, which is the case that matters most:
 * an APK signed by another key cannot update this app at all.
 */
object ApkInspector {

    sealed interface Result {
        data object Valid : Result
        data class Invalid(val reason: String) : Result
    }

    /** SHA-256 of a file, lowercase hex, streamed so an 85 MB APK does not sit in memory. */
    fun sha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().use { input ->
            val buffer = ByteArray(64 * 1024)
            while (true) {
                val read = input.read(buffer)
                if (read < 0) break
                digest.update(buffer, 0, read)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    /**
     * True when [expected] is the digest of [file]. [expected] may be bare
     * hex or `sha256:<hex>`; anything else is treated as unverifiable and
     * fails closed.
     */
    fun matchesChecksum(file: File, expected: String?): Boolean {
        val wanted = expected?.trim()?.lowercase()
            ?.removePrefix("sha256:") ?: return false
        if (wanted.length != 64 || wanted.any { it !in "0123456789abcdef" }) return false
        return sha256(file) == wanted
    }

    /**
     * Package, version code and signing identity of [file], checked against
     * the running app. [expectedVersionCode] is the release's own code when the
     * manifest supplied one; otherwise the installed code is the floor.
     */
    fun verifyInstallable(
        context: Context,
        file: File,
        expectedVersionCode: Int?,
        expectedChecksum: String?,
    ): Result {
        if (!file.isFile || file.length() == 0L) {
            return Result.Invalid("The downloaded file is empty.")
        }
        if (!matchesChecksum(file, expectedChecksum)) {
            return Result.Invalid("The download did not match the release checksum.")
        }

        val pm = context.packageManager
        val archive = archiveInfo(context, file)
            ?: return Result.Invalid("The downloaded file is not an Android app.")

        if (archive.packageName != context.packageName) {
            return Result.Invalid("The download is not MusoPhone (${archive.packageName}).")
        }

        val installed = installedInfo(context)
            ?: return Result.Invalid("MusoPhone's installed package could not be read.")

        val floor = expectedVersionCode ?: installed.longVersionCode.toInt()
        if (archive.longVersionCode < floor) {
            return Result.Invalid(
                "The download is not newer than the installed version " +
                    "(${archive.longVersionCode}, need $floor).",
            )
        }

        val archiveSigner = signerDigest(context, archive)
        val installedSigner = installedSignerDigest(context, installed)
        if (archiveSigner != null && installedSigner != null && archiveSigner != installedSigner) {
            return Result.Invalid("The download is signed with a different key than MusoPhone.")
        }

        return Result.Valid
    }

    private fun archiveInfo(context: Context, file: File): android.content.pm.PackageInfo? {
        val flags = signerFlags()
        return runCatching {
            context.packageManager.getPackageArchiveInfo(file.absolutePath, flags)
        }.getOrNull()
    }

    @Suppress("DEPRECATION")
    private fun installedInfo(context: Context): android.content.pm.PackageInfo? =
        runCatching {
            context.packageManager.getPackageInfo(context.packageName, signerFlags())
        }.getOrNull()

    private fun signerFlags(): Int =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            PackageManager.GET_SIGNING_CERTIFICATES
        } else {
            PackageManager.GET_SIGNATURES
        }

    @Suppress("DEPRECATION")
    private fun signerDigest(
        context: Context,
        info: android.content.pm.PackageInfo,
    ): String? {
        val signatures = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            info.signingInfo?.apkContentsSigners
        } else {
            info.signatures
        } ?: return null
        return signatures.firstOrNull()?.let { signature ->
            MessageDigest.getInstance("SHA-256")
                .digest(signature.toByteArray())
                .joinToString("") { "%02x".format(it) }
        }
    }

    @Suppress("DEPRECATION")
    private fun installedSignerDigest(context: Context, info: android.content.pm.PackageInfo): String? =
        signerDigest(context, info)
}
