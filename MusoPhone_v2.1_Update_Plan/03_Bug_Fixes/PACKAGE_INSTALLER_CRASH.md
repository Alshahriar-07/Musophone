# 4. Critical Bug: “Package Installer keeps stopping”

## 4.1 Severity

**Release blocker (P0).** The owner reports that package installer crashes on many phones while installing MusoPhone. v2.1 must not be declared ready until the issue is reproduced, root-caused, fixed, and verified on multiple devices.

## 4.2 Do not guess the root cause

The current evidence is only the owner's report. “Package Installer keeps stopping” may be caused by APK packaging/signing/metadata, Android-version compatibility, OEM installer behavior, a corrupted download, or another issue. The developer must gather evidence first.

## 4.3 Reproduction information to collect

For every affected device:
- Manufacturer and exact model.
- Android version and security patch if available.
- Install source (browser, file manager, USB, messaging app, etc.).
- APK filename, size, SHA-256 checksum.
- APK variant (debug/release, universal/split, ABI).
- Fresh install or update over an existing app.
- Existing installed package name and version.
- Exact point at which installer crashes.
- Whether another known-good APK installs on that phone.
- Whether the same MusoPhone APK installs on another phone.

Do not ask the user to share private account data or device identifiers.

## 4.4 Build artifact inspection

For every candidate APK:
- Verify file exists and is not zero/truncated.
- Calculate SHA-256 and compare after transfer/download.
- Run Android SDK `apkanalyzer` / `aapt` (or equivalent) to inspect package metadata.
- Run `apksigner verify --verbose --print-certs`.
- Inspect min/target SDK, versionCode/versionName, applicationId, manifest, ABI splits, native libraries, and signing schemes.
- Confirm the APK is a valid installable APK, not an AAB renamed to `.apk`.
- If split APKs are produced, verify they are installed as a compatible set; do not distribute a single split as a universal APK.
- Compare debug and release artifact metadata.
- Check whether the release artifact is signed with the intended stable release key.
- Keep signing keys secure; never commit keystore passwords or private keys.

## 4.5 Android logs and install diagnostics

Use a controlled test device and collect:
- `adb logcat` during the installer crash.
- `adb install -r path/to/app.apk` output.
- `adb install --no-streaming path/to/app.apk` where relevant.
- `adb shell dumpsys package` for installed package details.
- `adb shell getprop ro.build.version.release`
- `adb shell getprop ro.build.version.sdk`

Record the exact failure code and stack trace. If Package Installer itself crashes, capture system log entries around the crash timestamp. Do not expose personal data from logs in public issue reports.

## 4.6 Manifest and compatibility audit

Inspect:
- `minSdkVersion`, `targetSdkVersion`, `compileSdk`.
- `applicationId` and namespace.
- All permissions and permission groups.
- Exported activities, services, and receivers.
- Intent filters and deep links.
- FileProvider authorities and paths.
- Content provider declarations.
- Manifest placeholders and build-type-specific manifest merging.
- Native library ABIs and 16 KB page-size requirements where applicable to the project's native dependencies/device range.
- Feature declarations that might incorrectly filter or break installation.
- Conflicting provider authorities across variants.
- Duplicate or malformed metadata.

Do not lower target SDK or weaken security as a blind workaround. Follow current platform requirements and preserve appropriate security behavior.

## 4.7 Signing and update compatibility

- Configure a stable production release signing key.
- Verify the final APK signature with `apksigner`.
- Ensure updates use the same signing certificate as the currently installed production app.
- If the package has previously been distributed with a different key, document the migration/update limitation; do not silently replace signing identity.
- Keep debug and production signing identities separate.
- Do not include secrets in source control or build logs.
- Verify both fresh install and update install.
- Test signature mismatch behavior deliberately on a disposable test device.

## 4.8 Fix validation matrix

At minimum test:
- Fresh install on a lower-supported Android version.
- Fresh install on a recent Android version.
- Update over previous MusoPhone release.
- Update over an earlier BitChord-based package only if package ID/signature make that a supported migration.
- Install from browser download.
- Install from local file manager.
- Install via ADB.
- Install the exact final release artifact after copying it to another device.
- Verify app launch, login, playback, background service, notification, and uninstall/reinstall.

Use several OEM devices if available (for example Samsung, Xiaomi/Redmi, Vivo, Oppo/Realme, Pixel/AOSP). These are test targets, not claims that the issue is caused by any particular OEM.

## 4.9 Definition of done

The issue is fixed only when:
- A documented root cause is identified or a clearly justified compatibility correction is implemented.
- Final signed APK passes signature and metadata checks.
- Fresh install succeeds on all available target devices.
- Update install succeeds where signing/package continuity allows it.
- No Package Installer crash is observed in the agreed device matrix.
- App launches and core features work after installation.
- The final distributed APK checksum matches the tested artifact.
