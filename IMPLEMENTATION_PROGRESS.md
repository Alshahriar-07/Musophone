# MusoPhone — implementation progress

Source of truth for the current release: `MusoPhone_UI_Redesign_v3.1_Implementation_Plan.md`
(v3.1) and the v3.2 brief (animated Liquid Glass + GitHub auto update).

## Current state

**v3.2 (version code 53) is implemented, unit-tested, release-built, signed and
packaged in `release/v3.2/`.**

**It has not been seen on a screen.** `adb devices` returned an empty list and no
emulator is installed on this machine, so there are no screenshots, no install/launch
test, and no end-to-end download-and-install test. Every UI claim below is a
source-level claim backed by compilation and artifact inspection; the update logic
is additionally covered by unit tests, including a real mock HTTP server for the
GitHub contract.

## v3.2 — 26 November 2026

### Animated Liquid Glass

| Area | File | Change |
| :-- | :-- | :-- |
| Ambient layer | `app/.../ui/components/MusoAmbient.kt` (new) | `MusoAmbient` tokens (ground `#040406`, raised `#0B0B11`, violet `#5A4A86`, white highlight), a 46 s cycle, four cached radial-gradient blobs that are translated rather than rebuilt, `MusoAmbientLayer`, `MusoAmbientCache` (one layer per size), `rememberAmbientPhase` and `drawMusoAmbient`. Animation pauses when the lifecycle is not RESUMED and freezes under "Reduce animation". Updated at 8 fps because each update re-records the backdrop layer; at this drift speed a step is under two pixels. |
| App backdrop | `app/.../MainActivity.kt` | The ambient layer is drawn inside the existing `rememberLayerBackdrop(onDraw=…)`, after the vertical wash and before the accent halo, so every glass surface samples it. Phase is read in the draw pass only — no recomposition. |
| Glass body | `app/.../ui/components/MusoDesign.kt` | `MusoGlass.BodyAlpha` 0.55 → 0.44. |
| Bottom navigation | `app/.../ui/components/FloatingBottomBar.kt` | Full-width dock attached to the bottom edge: 26 dp top corners, no horizontal inset, no bottom lift, body 14%. The surface runs into the gesture area and the tabs alone are inset with `WindowInsets.navigationBars`; no black strip beneath. |
| Mini player | `app/.../ui/components/MiniPlayer.kt` | Body 18% → 10%, `HazeMaterials.thin` → `ultraThin`; rim, artwork, text and 40 dp targets unchanged. |
| Player | — | Untouched: artwork-derived `MeshGradientBackground`, lyrics, favourite, queue, shuffle, repeat, autoplay and transitions remain as they were. |

### GitHub auto update

| Area | File | Change |
| :-- | :-- | :-- |
| Release model / rules | `app/.../data/update/UpdateModels.kt` (new) | `ReleaseAsset`, `RemoteRelease`, numeric version comparison (incl. prerelease suffixes), code-aware `isUpdateAvailable`, ABI parsing, `selectApk` (device ABI → universal, never incompatible, never TV/unsigned/benchmark), `parseChecksums`, `isSkippedNow`, timing constants. |
| GitHub client | `app/.../data/update/GitHubReleases.kt` (new) | `releases/latest` on `Alshahriar-07/Musophone`, Accept/UA headers, 10/20/30 s timeouts, drafts/prereleases rejected, unfinished assets dropped, optional `update-manifest.json` for the version code, optional `SHA256SUMS.txt` for missing digests. |
| Preferences | `app/.../data/update/UpdatePreferences.kt` (new) | Skip version/deadline, last check, last notified release, automatic-check flag, persisted download path + checksum + code. |
| Checker | `app/.../data/AppUpdateChecker.kt` | Rewritten around the above: throttled (6 h) foreground checks, network handling, one announcement per release, skip-for-one-day, WorkManager download start/cancel, restore of a finished download, and install with a final verification. Existing public API (`available`, `download`, `check`, `downloadApk`, `cancelDownload`, `resetDownload`, `installApk`, `clearCache`) kept so old call sites still compile. |
| Workers | `app/.../data/update/UpdateWorkers.kt` (new) | `UpdateDownloadWorker` (unique work, progress, foreground notification with dataSync type, retry on I/O, cache cleanup, SHA-256 → package/version → signer checks, persisted result) and `UpdateCheckWorker`; `UpdateScheduler` for the daily network-constrained check and the launch check. |
| APK inspection | `app/.../data/update/ApkInspector.kt` (new) | Streamed SHA-256, fail-closed checksum comparison, `PackageManager` archive checks for package name, version code floor and signing-certificate equality with the installed app. |
| Update popup | `app/.../ui/components/UpdateAvailableDialog.kt` | Redesigned as a Liquid Glass sheet: icon, "MusoPhone Update Available", the requested description, current/new version, download size, Markdown notes, progress and error states, **Install** and **Skip for 1 Day**. |
| App wiring | `app/.../BitChordApplication.kt`, `app/.../ui/MainViewModel.kt`, `app/.../MainActivity.kt` | Checker initialised and daily work scheduled at startup; foreground-return check (throttled); dialog call site updated for the new API and skip. |
| Settings | `app/.../ui/screens/SettingsSheet.kt` | Small Updates section: installed version, manual check with status, automatic checks switch, last-check time. |
| Manifest | `app/src/main/AndroidManifest.xml` | `SystemForegroundService` merged with `foregroundServiceType="dataSync"` so the download may run in the foreground on Android 14+. |
| R8 | `app/proguard-rules.pro` | Keep rules for both worker classes (WorkManager instantiates them by name). |
| Release pipeline | `.github/workflows/android.yml` | Produces the updater's asset names plus `SHA256SUMS.txt` and `update-manifest.json` from the built APKs. |
| Strings | `app/src/main/res/values/strings.xml` + every locale catalogue | New update strings. Locales currently carry the English source text for these keys — they need translation review. |

### Verification actually run

| Check | Result |
| :-- | :-- |
| `:app:compileProdReleaseKotlin` | success |
| `:app:testProdDebugUnitTest` | **1,377 tests, 1 skipped, 0 failed** (includes 30 new update tests) |
| New update tests | version comparison (numeric, prerelease, code precedence), ABI/asset selection (7), skip window (6), checksums and SHA256SUMS parsing (6), GitHub contract against MockWebServer (5) — **30/30 pass** |
| `:app:assembleProdRelease` | **BUILD SUCCESSFUL in 4m 43s** |
| `apksigner verify --print-certs` | verifies; v2 true, v3 true, 1 signer; cert `9edcb3…a4a847` (unchanged) |
| `aapt2 dump badging` (all four) | `com.musophone.player`, versionCode 53, versionName 3.2, minSdk 26; native-code matches each split |
| `zipalign -c -P 16 4` (all four) | passes |
| Device install / launch / screenshots | **not performed** — no device, no emulator |
| End-to-end GitHub download + Android installer | **not performed** — needs a device; installer flow is framework behaviour |

### Artifacts

`release/v3.2/` (all signed, R8-minified, resource-shrunk):

| Artifact | Bytes | SHA-256 |
| :-- | --: | :-- |
| `MusoPhone-v3.2.apk` (universal) | 84,362,465 | `f5cfb5466600a2b477582a8e669473dcd2bedf69e4dd9d6e72f87fbe19d4cebb` |
| `MusoPhone-v3.2-arm64-v8a.apk` | 46,932,426 | `86b5cfa003063d506b0d50a76e81afb7e2cdce41602004b91b0af9977736a80e` |
| `MusoPhone-v3.2-armeabi-v7a.apk` | 40,232,092 | `27f23aae397f1c7b81bad40a260ed370f449167fe84f29188e76c14537479f04` |
| `MusoPhone-v3.2-x86_64.apk` | 49,413,307 | `457753fe9e626b8455ac069132fe23f66cb5ed4f8ada2ad3aafada3d342a7fce` |

Also `SHA256SUMS.txt`, `update-manifest.json`, `build-info.txt`, `RELEASE_NOTES.md`.

### Known limitations

1. **No visual verification.** The ambient drift, the attached dock and the mini
   player's transparency have not been seen running. Judge them on a device.
2. **No end-to-end update test.** The download worker, verification and installer
   intent are compiled and unit-tested at the logic level (checksum, selection,
   skip, parsing) but not exercised on Android.
3. **Background download is best-effort.** WorkManager survives app backgrounding
   and process recreation, and a dataSync foreground service is declared, but
   force-stop and some manufacturer battery managers can still stop it. The app
   does not claim otherwise.
4. **Checksum requires release metadata.** If a release publishes neither an
   asset `digest` nor `SHA256SUMS.txt`, the download is refused rather than
   installed unverified — by design. Publish both from the workflow.
5. **Version code comes from `update-manifest.json` when present**; otherwise the
   app compares version names numerically. Publishing the manifest avoids the
   fallback entirely.
6. **Locales** carry the English text for the 22 new update strings.
7. **No emulator/device on this machine**, so no screenshots were produced.
8. The build machine's JVM is JDK 25, which Gradle 8.11 rejects; a project-local
   JDK 21 was fetched to `.jdk/` (gitignored) purely to build. This does not
   affect the APK.

## Earlier v3.1 work (kept for history)

v3.1 (52) implemented the Liquid Glass correction pass, the full player's lyric
line changes, compact Search recents and shared page headers. See the v3.1
section preserved in the release notes and `release/v3.1/`. Its verification
status was the same: compiled, unit-tested, built, but never viewed on a screen.
