# MusoPhone v2.1 — Implementation Status

Updated: 25 November 2026
Base commit: `1ed7752` (v1.11 "Coral Glass"); v2.1 work is in the working tree.

This is the honest status of the update against the plan in this folder. It
separates what was implemented and verified from what was not, because the
release gate in `05_QA_Release/RELEASE_CHECKLIST.md` depends on that distinction.

---

## 1. Repository audit

| Question | Finding |
|---|---|
| UI toolkit | Jetpack Compose + Compose Multiplatform (`sharedUi`, `shared`), Android app module in Kotlin |
| Modules | `:app` (Android phone), `:tv`, `:wearos`, `:shared`, `:sharedUi`; a web player and native C++ sources also exist |
| Screen model | Tabs rendered in `MainActivity` (`AppDestination.Tab`), pushed pages via `AppNavigator` (`AppRoute`), album/artist/playlist pages on `MainViewModel.detailStack` |
| Baseline version | 1.11 (versionCode 43), package `com.musophone.player`, minSdk 26, targetSdk 36, compileSdk 37 |
| Baseline UI | Already had a "Coral Glass" pass from 1.11: floating glass bottom bar, glass cards (`MusoDesign.kt`), frosted top bar |
| Known navigation state | 5 tabs: Play/Home, Explore, Radio, Library, Search |
| Global menu button | **Absent from the baseline source.** No hamburger/menu entry point exists in the app or shared UI; the account avatar is the profile entry. Nothing to remove. |
| Old BitChord icon options | **Already gone.** `AppIcon.entries` contains only MusoPhone glass/adaptive icons. User-facing strings contain no "BitChord"; the remaining occurrences are internal class/resource names and code comments, plus one `Theme.BitChord` style name (renamed for the phone app). |

### Feature inventory used for regression checks

Authentication and account (Google/YouTube session, account switcher,
scrobbling), playback service and MediaSession (play/pause/next/prev/seek,
queue, shuffle/repeat, background/notification/lock-screen/Bluetooth), search
and suggestions, Home/Explore/Library feeds, albums/artists/playlists, downloads,
local music, WebDAV/SMB, Spotify library, Listen Together, Replay, history,
equalizer, theme/font settings, app-icon switching, widgets, Android Auto, Wear
OS bridge.

No repository, service, playback engine or API client was rewritten. The changes
are presentation, settings persistence, navigation wiring and build packaging.

---

## 2. Implemented in this pass

### Eight accent themes

- `ui/theme/MusoAccents.kt` — `MusoAccentTheme` (8 palettes), semantic
  `ColorScheme` derivation, backdrop and glow brushes, `LocalMusoAccentPalette`.
- `ui/theme/Theme.kt` — `BitChordTheme(..., accentTheme)` now builds the colour
  scheme from the selected accent and provides the palette.
- `data/settings/AppSettings.kt` — `accentTheme` flow, `setAccentTheme`, persisted
  under `accent_theme`, restored on startup.
- `ui/components/AccentThemePicker.kt` — visual theme cards (palette preview,
  selected check, accessible radio role).
- `ui/screens/SettingsSheet.kt` — Appearance → Accent theme picker.
- `MainActivity` — collects the accent, paints the themed backdrop and halo.
- `MusoAccentThemeTest` — 4 tests: eight distinct themes; accent/on-accent
  contrast ≥ 4.5:1 for all 8 × light/dark; body text ≥ 4.5:1 and primary text
  ≥ 7:1; both light and dark palettes distinct.

### Navigation

- Four tabs, in order Home, Explore, Library, Search (`MainActivity` constants
  and `tabs` list).
- Radio removed from the bar. The mixes page moved to `AppRoute.Mixes`, opened
  from a dedicated Radio button in Library's top bar; the page, its feed and the
  radio-queue feature were preserved, not deleted.
- `safeTab` clamps a restored pre-v2.1 index so an update cannot index past the
  shorter tab list.
- `FloatingBottomBar`: accent selection pill and an animated accent rule under
  the active destination.
- Debug preview fixtures updated to the four-tab bar.
- Back stack, deep links and mini-player integration untouched; Mixes is a normal
  pushed route so Back returns to Library.

### Profile → App Settings

- `ProfileScreen` now takes `onAppSettings` for the gear and `onAccountSettings`
  for the "Account settings" chip.
- `MainActivity` wires the gear to `AppRoute.Settings`, the chip to
  `AppRoute.AccountScrobbling`.
- App Settings already contains the account card, so profile-specific account
  settings remain reachable and distinct.

### Branding

- Phone app theme renamed `Theme.BitChord` → `Theme.MusoPhone`; launch window now
  uses a branded colour (`muso_launch_background`, light `#F7F5F8`, dark
  `#08070A`) instead of black.
- Icon picker audited: only MusoPhone icons. Watch/TV labels already MusoPhone.
- Verified no user-visible "BitChord" strings.

### Installer hardening

- `enableV2Signing` and `enableV3Signing` explicit; v1 documented as unavailable
  at minSdk ≥ 24 (AGP issue 134858541) and unnecessary on Android 8+.
- 16 KB page alignment verified for the APK and the native ELF libraries.
- `resources.arsc` stored uncompressed.
- Stray 32-bit `x86` native slice excluded; ABIs are arm64-v8a, armeabi-v7a,
  x86_64.
- ABI split APKs published; arm64 APK is 45 MB vs the 81 MB universal APK.
- `release/v2.1/` created with APKs, AAB, checksums, build manifest, release
  notes and installation report. `release/v1.11/` untouched.

---

## 3. Verification actually run

| Check | Result |
|---|---|
| `:app:compileDevDebugKotlin` / `:app:compileProdReleaseKotlin` | PASS |
| `:app:testDevDebugUnitTest` | PASS — 1,345 passed, 1 skipped |
| `:app:lintVitalProdRelease` | PASS |
| `:app:assembleProdRelease` | PASS |
| `:app:bundleProdRelease` | PASS |
| `apksigner verify` (universal + arm64) | PASS — v2 + v3 |
| `aapt2 dump badging` | PASS — name/version/SDK correct |
| `zipalign -c -P 16` | PASS on all four APKs |
| `sha256sum` recorded | PASS |
| On-device install / update / launch / login / playback | **NOT RUN** — no device or emulator (`adb devices` empty) |
| OEM device matrix | **NOT RUN** |

---

## 3a. UI refinement pass (25 Nov, later in the same day)

- **Bottom navigation** — `FloatingBottomBar` is now full-width with no outer
  gutter or lift, its glass/haze background runs behind the system navigation
  area, its content is inset by `WindowInsets.navigationBars`, and a single top
  hairline replaces the all-round floating border. This surface is used in every
  mode: `MainActivity` no longer swaps in the floating `GlassNavBar` when liquid
  glass is enabled; the same `MiniPlayer` still carries the transport above it.
- **Home logo** — `LOGO_TO_FONT` raised from 1.05 to 1.45 (about +38%), with the
  existing 3:1 `aspectRatio`, `ContentScale.Fit` and transparency untouched, plus
  a 190 dp width cap for large font scales.
- **Duplicate avatar** — root cause was two independent headers rendering on the
  Home tab: `HomeTitle`'s `HomeProfileControl` and the global
  `TopBarAccountButton`. The top-bar button is now omitted while the Home
  masthead is on screen (`homeHeadingVisible`); the masthead avatar, account
  image, profile navigation and account state are unchanged.
- **Player** — the portrait control deck is wrapped in a new rounded glass sheet
  (dark gradient, accent seam, grab handle) containing the existing lyric strip,
  scrubber, transport, volume and action row. No playback state, callback or
  subview (lyrics, queue, output, menu, like, canvas) was changed.

## 4. Remaining gaps (not claimed as done)

1. **Page-by-page layout redesign is partial.** This pass adds a new global
   visual system (accent palettes, backdrop + halo, theme-aware navigation,
   themed picker) plus the navigation, masthead and player-deck refinements. It
   does **not** produce a genuinely new composition for every one of the 20+
   screens, dialogs and sheets in the sense the plan's originality acceptance
   test demands. Home's feed, Explore, Library, Search and Details still use
   their 1.11 compositions. This remains the largest unmet requirement.
2. **No runtime UI verification, and no screenshots.** No device or emulator was
   attached, so the refined bar's insets, the new deck's contrast over artwork,
   the logo's fit at large font scales, the single-avatar result and theme
   switching were not observed. Compile, unit tests, lint and artifact checks are
   the only evidence. Before/after screenshots requested by the brief could not
   be captured.
3. **Authentication and playback were not exercised.** No Google credentials or
   device were available. They were not modified, but "works" is unproven.
4. **Package Installer crash is not root-caused.** Artifact checks pass; the
   failure could not be reproduced. Size/signature changes are mitigation and
   require the device matrix in `release/v2.1/INSTALLATION-TESTS.md`.
5. **Localization.** The ten new accent-theme strings are present in every locale
   (required by `LocaleStringsTest`) but are English text; they still need
   translation.
6. **Radio relocation UX.** Mixes now lives behind Library's top-bar button. It is
   reachable and functional in code, but the placement was not visually reviewed.
