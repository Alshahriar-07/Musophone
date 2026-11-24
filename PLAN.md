# MusoPhone — implementation plan and status

## 1. Product

MusoPhone is an independent, premium Android music player with its own **Coral
Glass** visual identity. It is built on the open-source BitChord codebase under
GPL-3.0; complete attribution is in [`Credit.md`](Credit.md), and the change
record is in [`MODIFICATIONS.md`](MODIFICATIONS.md).

The direction is a dark, editorial player: coral light over warm ink,
translucent panels, artwork-led screens, large type and restrained motion. It
must not read as a reskinned copy of the inherited interface.

## 2. Current status — 1.11

Completed:

- Coral Glass colour, type, shape and surface system.
- New Home masthead using the complete supplied logo lockup.
- Shared editorial mastheads for Library and Explore.
- **Your Listening Experience** profile with real on-device totals, activity,
  recent history and top songs, artists, albums and playlists.
- Redesigned Settings groups and About colophon.
- Coral primary transport, redesigned Mini Player, search field/result card and
  release-page actions.
- Legacy neon launcher icons removed; MusoPhone icon family retained.
- Real playlist-context tracking added to the monthly listening buckets.
- Unit-test suite passing; signed 1.11 APK/AAB archived under
  [`release/v1.11/`](release/v1.11).

## 3. Architecture

- `app/` — Android phone application, playback service, settings, Profile.
- `shared/` — shared models, queue semantics and platform-neutral data logic.
- `sharedUi/` — Compose UI shared by Android and desktop/JVM.
- `tv/`, `wearos/` — television and watch companions.
- `backend/` — Listen Together party server.
- `web/` — web player and browser extension.
- `native/` — native audio and analysis components.

The Kotlin namespace remains `com.music.bitchord`; the Android application id is
`com.musophone.player`. The namespace is a technical compatibility contract for
JNI, reflection, databases, providers and deep links, not user-facing branding.

## 4. Design rules

1. One coral primary action per screen; everything structural is ink and glass.
2. Put artwork first. Chrome recedes behind the music.
3. Use the 8/12/18/24/32 dp shape scale; do not invent local corner values.
4. Prefer lightweight glass. Reserve live blur for navigation and player chrome,
   and honour “reduce dynamic blur”.
5. Motion explains a change and never delays a touch. Animate draw properties
   where possible instead of font size, layout or composition.
6. Empty states tell the truth. No demo statistics in Profile.
7. Keep every existing setting, API contract and integration working.

## 5. Remaining work

- Bespoke layout passes for the queue, lyrics and equalizer surfaces beyond the
  global theme.
- A dedicated About destination if the settings colophon needs to become a full
  page.
- Device/emulator validation of playback, notifications, profile navigation and
  the icon picker. The current environment has no attached Android device.
- Screenshot-based visual regression once a device is available.

## 6. Release process

1. Bump `bitchordVersionCode` and `bitchordVersionName` in the root
   `build.gradle.kts`.
2. Run `:app:testDevDebugUnitTest`.
3. Build `:app:assembleProdRelease` and `:app:bundleProdRelease` with the
   gitignored release keystore.
4. Verify package id, version, signature, launcher aliases and the absence of
   retired resources.
5. Archive the APK/AAB with SHA-256 checksums and build metadata in a new
   `release/v<version>/` directory. Never overwrite an older release.
