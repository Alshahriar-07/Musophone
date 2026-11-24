# MusoPhone — modifications from BitChord

MusoPhone is a **modified version** of the free software project **BitChord**
(<https://github.com/kushagrasinghx/BitChord>), distributed under the
**GNU General Public License v3.0**. The original `LICENSE` file is unchanged and
the original authors retain copyright over their work.

- Upstream revision this build is based on: `21356206` (`1.10`, version code 42).
- Modifications made: **24 November 2026**.
- Official website: <https://musophone.vercel.app>
- Official repository and corresponding source: <https://github.com/Alshahriar-07/Musophone>
- Project owner: **Al Shahriar Sowan**. AI-assisted development: ChatGPT (OpenAI)
  and DeepSeek. Full attribution is in [`Credit.md`](Credit.md).

MusoPhone is not affiliated with, endorsed by, or connected to BitChord, Google
LLC or YouTube. The project is a derivative work, not a replacement or
re-licensing of the upstream project.

## Repository layout

MusoPhone develops directly from the repository root. The upstream BitChord tree
was moved up from an intermediate `BitChord/` directory, so `app/`, `shared/`,
`sharedUi/`, `tv/`, `wearos/`, `backend/`, `web/`, `native/`, Gradle files,
`.git` and the GPL `LICENSE` all live beside [`PLAN.md`](PLAN.md) and
[`Credit.md`](Credit.md). The supplied brand artwork stays in [`assets/`](assets).
Git history and the upstream branches were preserved; `origin` points at the
official Musophone repository and `upstream` at `kushagrasinghx/BitChord`.

## What changed

Only branding and the minimum configuration needed for an independent Android
application identity were changed. No screen was redesigned and no feature,
service, dependency or integration was removed.

### Application identity

| Item | BitChord | MusoPhone |
|---|---|---|
| Display name (prod) | BitChord | MusoPhone |
| Display name (dev) | BitChord Dev | MusoPhone Dev |
| Application id (prod) | `com.music.bitchord` | `com.musophone.player` |
| Application id (dev) | `com.dev.bitchord` | `com.dev.musophone.player` |
| TV application id | `com.music.bitchord.tv` | `com.musophone.player.tv` |
| TV dev application id | `com.dev.bitchord.tv` | `com.dev.musophone.player.tv` |
| Wear application id | `com.music.bitchord` | `com.musophone.player` |
| Wear dev application id | `com.dev.bitchord` | `com.dev.musophone.player` |

The Kotlin/Java **namespace remains `com.music.bitchord`**. Android allows the
application id to differ from the namespace, and keeping the namespace avoids a
751-file package rewrite that would have risked breaking the existing source,
JNI classes, reflection-based integrations and the manifest aliases. The watch
application id is aligned with the phone's so the Wearable Data Layer pairing
feature continues to work.

Gradle root project name is `MusoPhone`; phone APK/AAB artefact names use the
`MusoPhone` prefix (`MusoPhone-dev-debug.apk`, etc.).

### Icons and visual assets

The supplied MusoPhone assets were integrated without modifying the originals:

- `assets/icon.png` → legacy launcher icons at every density
  (`mipmap-{m,h,xh,xxh,xxxh}dpi/ic_launcher.webp`) and circular round icons
  (`ic_launcher_round.webp`).
- Adaptive launcher icon: the supplied artwork, cropped to a disc and placed in
  the 72dp safe zone of the 108dp adaptive canvas
  (`drawable-nodpi/ic_launcher_foreground.png`), on the supplied near-black
  background (`drawable/ic_launcher_background.xml`).
- Monochrome/themed launcher layer (`mipmap-*/ic_monochrome_foreground.png`)
  derived from the same mark for Android 13+ themed icons.
- Play Store artwork (`app/src/main/ic_launcher-playstore.png`), 512×512.
- In-app mark (`drawable-nodpi/ic_logo.png` and the shared-UI equivalent) uses
  the same MusoPhone mark while keeping the original 730×484 drawable box, so
  onboarding, Replay and the lyrics share card keep their existing layouts.
- Notification / Quick Settings tile silhouette
  (`drawable-nodpi/ic_notification_logo.png`).
- The Wear OS companion app received the same launcher, monochrome, logo and
  notification assets.

Android 12+ system splash screens use the application icon automatically; no
separate splash screen existed in the original and none was invented.

Original icon and branding files are backed up under
`branding-backup/original-res/` (not part of the application).

### Text and metadata

- `app_name` is `MusoPhone` in all 20 phone locale files; dev builds use
  `MusoPhone Dev`.
- User-facing references to the app name in the phone and shared-UI string
  catalogues were changed to `MusoPhone`.
- The Settings colophon, Replay share cards, notification/widget labels, FLAC
  vendor tag, gallery save folder (`Pictures/MusoPhone`), download folder
  (`Music/MusoPhone`) and the Last.fm/ListenBrainz/lyrics User-Agent all say
  `MusoPhone`.
- Project links now point at <https://musophone.vercel.app> and
  <https://github.com/Alshahriar-07/Musophone>: the README badges and download
  links, the in-app About links, the in-app update feed, Discord Rich Presence'
  project button, the web player's Android download link, the web extension's
  manifest name/description, and the Listen Together invite page.
- Withdrawn: no. The following intentionally still name the upstream project or
  service, because they refer to it rather than to this app:
  - `listen_together_official_server_dialog_message` — the party server really
    is the official BitChord server.
  - `tester_code_message` — the upstream addon attestation tester programme.
  - Discord Rich Presence's registered Discord application id, which is issued
    by Discord to the upstream application and cannot be re-registered without
    a new Discord account/app; the visible project URL and button text are
    MusoPhone's.
  - Log tags, preference keys, database names, deep-link scheme
    (`bitchord://`), provider authorities and package/class names, which are
    internal identifiers or live integration endpoints. The Kotlin namespace is
    deliberately still `com.music.bitchord`; renaming it would touch most of the
    1,491 tracked files and every JNI/reflection lookup for no user-visible gain.
  - External service endpoints hosted by the upstream project: the Listen
    Together server (`bitchord.kushagrasingh.in`,
    `bitchord-listen-together.onrender.com`), the presence/party API
    (`api.bitchord.kushagrasingh.in`), the addon attestation service, and the
    Automix model downloads. These are live servers/assets, not branding, and
    pointing them at a non-existent MusoPhone deployment would break features.
  - The browser extension's package names, storage keys, gecko id and the
    `bitchord.in` origin allow-list, which are deployment/integration
    identifiers.
- Downloads now go to **`Music/MusoPhone`** instead of `Music/BitChord`
  (`DownloadStore.FOLDER`, the settings subtitle and the corresponding string).
- The Last.fm / ListenBrainz client identification, the lyrics-provider
  User-Agent and the image-fetching User-Agent now say `MusoPhone` and point at
  the official repository; upstream authorship is recorded in `Credit.md` and
  the preserved `LICENSE`/`MAINTAINERS.md`.
- README, `MusoPhoneIcon.png` and `MusoPhoneBanner.png` present the MusoPhone
  branding. The original `Logo.png`, `Banner.png`, `README.md` history, credits,
  `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `MAINTAINERS.md`,
  `ADDITIONAL.md` and third-party notices were preserved.

## Deliberately unchanged

- UI, layouts, navigation, animations, colours, typography and components.
- Playback engine, Media3 session, background playback, notifications, media
  controls, widgets, Quick Settings tile, Cast, Android Auto, TV and Wear apps.
- Local scanning, playlists, favourites, search, history, lyrics, Replay,
  Automix, equaliser, USB/bit-perfect output, downloads, WebDAV, SMB, addons,
  YouTube/Spotify/Discord/Last.fm/ListenBrainz/Google Drive integrations.
- Dependencies, Gradle/AGP/Kotlin versions, min/target SDK, and project
  architecture.
- GPL-3.0 `LICENSE` and all original copyright/attribution notices.

## Known effects of the new application id (not silently ignored)

These are inherent to giving the app its own identity; they were not "fixed" by
removing features:

1. **In-app updates** read the MusoPhone release feed
   (`Alshahriar-07/Musophone`, `UPDATE_APK_PREFIX = "MusoPhone-"`). The feed is
   empty until a MusoPhone release is published, so the check is a no-op until
   then. Release assets must keep the `MusoPhone-` prefix and be signed with
   the same key as the installed build.
2. **Addon hardware attestation** (`ADDON_AUTH_URL`) is issued for the upstream
   package/signing certificate. Addons that require that attestation will not
   verify for this build. No client-side workaround was added.
3. **Google Drive backup / Google sign-in** authorization is registered per
   package name and signing certificate. A new OAuth client for
   `com.musophone.player` is required in the Google Cloud console before Drive
   backup works.
4. **Listen Together deep links** keep the upstream scheme/host
   (`bitchord://party`, `bitchord.kushagrasingh.in`) because the upstream server
   generates those links. Changing them would break party invitations.
5. **Alternative launcher icons** offered by the original icon picker (liquid
   glass, neon, Samsung/Pixel variants) still use the original BitChord mark.
   Only the default/round/themed launcher identity was replaced. Recolouring 22
   style variants was out of scope for a branding build.
6. **TV and Wear** remain separate applications with their own ids; both were
   rebranded and build from this repository, but were not part of the APK
   runtime validation run.
7. **The audio model downloader** (`AutomixModels`) still fetches the upstream
   `model_*` assets from BitChord's releases. Those files are model data, not
   application branding, and no MusoPhone mirror exists. Changing the URL would
   break Automix.

## Building

Requirements:

- JDK 17 or newer (JDK 21 used for validation).
- Android SDK with `platforms;android-37.0`, `build-tools;37.0.0`,
  `platform-tools`, CMake 3.22.1 and an NDK compatible with AGP 8.10.1
  (`27.0.12077973` used here).
- `local.properties` containing `sdk.dir=...`.

```bash
# from the repository root
./gradlew :app:assembleDevDebug
```

Outputs are under `app/build/outputs/apk/` and `app/build/outputs/bundle/`.
Release builds require `keystore.properties` (see `keystore.properties.example`);
without it the release APK and AAB are unsigned, exactly as upstream behaves.

ABI splits are disabled only when a Gradle invocation contains a `bundle`
task. AGP 8.9/8.10 otherwise fails `buildProdReleasePreBundle` with "Sequence
contains more than one matching element" (Google issue 402800800); the bundle
splits by ABI on its own, so APK split configuration is irrelevant to it. This
is a build-tool workaround, not an application change.

## Licence

MusoPhone is free software: you can redistribute it and/or modify it under the
terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version. It is distributed in the hope that it will be useful, but **WITHOUT ANY
WARRANTY**; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
A PARTICULAR PURPOSE. See `LICENSE` for the full text.
