# MusoPhone — project and modification record

MusoPhone is an independent Android music player distributed under the
**GNU General Public License v3.0**. It is a modified derivative of the
open-source **BitChord** project. The original [`LICENSE`](LICENSE) is preserved
unchanged, and upstream copyright notices and license headers remain in the
source tree.

- **Developed by:** EAGOX STUDIO TEAM — <eagoxstudio@gmail.com>
- **Product owner:** Al Shahriar Sowan
- **Official repository and corresponding source:** <https://github.com/Alshahriar-07/Musophone>
- **Official website:** <https://musophone.vercel.app>
- **Upstream revision:** `21356206` (BitChord 1.10, version code 42)
- **Current MusoPhone version:** 1.11 (version code 43)
- **Complete attribution:** [`Credit.md`](Credit.md)

MusoPhone does not claim authorship of the upstream BitChord architecture,
playback engine, backend or other inherited components. The distinction between
upstream work and MusoPhone modifications is recorded in `Credit.md`.

## Repository layout

MusoPhone develops from the repository root. `app/`, `shared/`, `sharedUi/`,
`tv/`, `wearos/`, `backend/`, `web/`, `native/`, the Gradle files and the GPL
`LICENSE` live beside [`PLAN.md`](PLAN.md) and [`Credit.md`](Credit.md). Supplied
brand artwork remains in [`assets/`](assets), with release builds archived under
[`release/`](release).

## Application identity

| Item | Value |
|---|---|
| Display name (prod) | MusoPhone |
| Display name (dev) | MusoPhone Dev |
| Application id (prod) | `com.musophone.player` |
| Application id (dev) | `com.dev.musophone.player` |
| TV application id | `com.musophone.player.tv` |
| TV dev application id | `com.dev.musophone.player.tv` |
| Wear application id | `com.musophone.player` |
| Wear dev application id | `com.dev.musophone.player` |

The Kotlin/Java **namespace remains `com.music.bitchord`**. Android permits the
application id to differ from the namespace. Keeping the namespace preserves
JNI lookups, reflection-based integrations, provider authorities, deep links and
the existing database/preference keys without a risky source-wide package
rename. Those identifiers are technical compatibility contracts, not product
branding.

Gradle root project name is `MusoPhone`; phone artefacts use the `MusoPhone`
prefix. The watch application id is aligned with the phone so the Wearable Data
Layer pairing continues to work.

## 1.11 — Coral Glass redesign

Version 1.11 replaces the inherited interface with an original MusoPhone visual
identity while retaining the playback, authentication, database, API and
integration layers.

### Design system

- Coral, apricot, teal, warm-obsidian and porcelain colour schemes for dark and
  light themes.
- An 8/12/18/24/32 dp shape scale and editorial display typography.
- Reusable glass surfaces, pills, stat tiles, section headings, avatars and fact
  rows.
- Coral selection indicator in the floating navigation bar.

### Screens and surfaces

- **Home:** complete lockup in the upper-left, account portrait in the upper-right,
  coral light wash, oversized “Listen now” masthead and listener name.
- **Library / Explore:** shared editorial mastheads; inherited shelf and row
  behaviour preserved.
- **Profile:** a new destination with real on-device listening totals, rhythm,
  recent account history and top songs, artists, albums and playlists.
- **Settings:** every category page uses the new group surfaces, brand eyebrow
  and an About colophon with version and project links; all existing rows,
  values and controls remain.
- **Now Playing:** coral primary transport, original type and glass chrome over
  the existing artwork-driven backdrop.
- **Mini Player:** 24 dp glass slab, coral transport treatment and larger
  artwork corners instead of the inherited pill.
- **Search:** glass search field, editorial result card and coral primary action.
- **Release and artist pages:** coral primary Play action and glass secondary
  controls.
- **Onboarding:** retained animated artwork backdrop and rebuilt motion/CTA
  treatment.
- Dialogs, sheets and menus inherit the app-wide Material theme and shape scale.

### Profile data

`ListeningStats` records real playback on the device. Playlist context is now
recorded from the player's existing `playbackSource` metadata when a queue was
started from a playlist page. Profile does not use hard-coded or demo figures;
new installs show an honest empty state. The monthly bucket schema is backwards
compatible: months written before playlist tracking load with empty playlists.

### Performance

- Infinite/continuously drifting decoration is avoided on static screens.
- The Profile activity chart uses draw-time bar heights rather than per-frame
  layout.
- Player text remains a draw-only scale during collapse rather than animating
  font size, preserving the existing recomposition work.
- Glass surfaces use the lightweight implementation and respect the existing
  “reduce dynamic blur” preference.

### Icons

All nine legacy neon launcher variants were removed from `AppIcon`, strings,
manifest aliases and drawable/mipmap resources. Default, monochrome and the
MusoPhone glass family remain. Icon switching and adaptive/notification icons
continue to work through the existing alias mechanism.

### Release archive

The existing 1.10 APK/AAB remain untouched at their original paths in `release/`.
The 1.11 APK/AAB, checksums and build metadata are written to `release/v1.11/`.
Release signing remains outside the repository (`keystore.properties` and
`musophone-release.jks` are gitignored).

## Earlier branding work

The initial MusoPhone identity changed the application name, launcher and
notification artwork, application ids, download folders, project links and
service User-Agent strings. The supplied artwork was integrated without
modifying the originals. Project links point at the MusoPhone repository and
website.

Technical identifiers retained deliberately include:

- the `com.music.bitchord` namespace and JNI/reflection class names;
- database, preference and backup-rule keys;
- the `bitchord://` deep-link scheme and provider authorities;
- addon authentication headers and upstream live service endpoints;
- the registered Discord application id and browser-extension identifiers.

These are compatibility contracts, not user-facing branding. Pointing them at
non-existent MusoPhone deployments would break existing features. External
services hosted by the upstream project are used as-is.

## Preserved functionality

The redesign does not change:

- playback, Media3 media sessions, background playback, audio focus or
  notifications;
- authentication, account switching or WebView sign-in;
- local scanning, playlists, favourites, history, lyrics, Replay, Automix,
  equalizer, downloads, WebDAV/SMB, addons or cast;
- deep links, API contracts, database/preference formats or third-party
  integrations;
- GPL-3.0 `LICENSE`, copyright notices or third-party acknowledgements.

## Known effects of the independent identity

1. **In-app updates** use the MusoPhone release feed
   (`Alshahriar-07/Musophone`, `UPDATE_APK_PREFIX = "MusoPhone-"`). Release assets
   must keep that prefix and be signed with the same key.
2. **Addon hardware attestation** was issued for the upstream package/signing
   certificate. Addons that require that attestation will not verify for this
   build. No client-side workaround is included.
3. **Google Drive backup and Google sign-in** authorization are still associated
   with the existing OAuth client configuration; changing the Android package
   does not create a new Google Cloud project. Existing configuration remains in
   place.
4. **Discord Rich Presence** uses the upstream application registration, which
   cannot be replaced without a new Discord application. Visible project links
   point at MusoPhone.

## Licensing

MusoPhone is distributed under GPL-3.0. The complete source is this repository.
Anyone distributing a MusoPhone binary must also make the corresponding source
available under the same license. See [`LICENSE`](LICENSE) and
[`Credit.md`](Credit.md).
