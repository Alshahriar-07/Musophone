# Changelog

MusoPhone is an independent Android music player by EAGOX STUDIO TEAM.
Version numbers are the app's `versionName`; the version code in brackets is the
one Android compares for updates.

## 3.2 (53) — 26 November 2026

Animated Liquid Glass and a complete GitHub-based in-app update system.
Playback, queue, lyrics, library, sources, downloads, accounts and the player's
artwork-derived background are unchanged.

### Added — animated ambient backdrop

- One shared ambient layer behind the whole app: `#040406` / `#0B0B11` ground,
  the active MusoPhone accent, a muted violet counter-light and a low-opacity
  white highlight.
- A 46-second drift with no flashing and no sudden transitions. It is drawn into
  the same layer the glass samples, so the dock and mini player blur a moving
  picture.
- Animated at 8 fps (a step is under two pixels at this speed) because every
  update re-records the backdrop layer. It pauses when the app is backgrounded
  and freezes at a composed still frame under "Reduce animation".
- Shared glass panel body lowered from 55% to 44% opacity now that there is a
  backdrop worth seeing through it.

### Changed — navigation and mini player

- Bottom navigation is a full-width glass dock attached to the bottom edge, with
  26 dp top corners, a 12% body, its existing blur and a lit top rim. The v3.1
  floating capsule (12 dp sides, 8 dp lift) is removed.
- Navigation content is inset above the system navigation bar while the surface
  itself reaches the screen edge, so there is no gap and no black strip below.
- Mini player body 18% → 10%, frost `thin` → `ultraThin`; artwork, text and 40 dp
  transport targets unchanged.

### Added — in-app updates

- Checks the official GitHub `releases/latest` (stable only) with bounded
  timeouts; no third-party update server.
- Version comparison by release version code (from `update-manifest.json` when
  published) with numeric version-name fallback and prerelease ordering.
- Liquid Glass update popup with title, description, current/new version,
  download size, release notes, **Install** and **Skip for 1 Day**.
- Skip stores the version and a 24-hour deadline across restarts; the release
  returns after it and is never hidden by a skip for a newer one.
- Unique WorkManager download with progress, retry on transient failures, normal
  background continuation and process-recreation recovery.
- SHA-256 verification against release metadata (asset digest or
  `SHA256SUMS.txt`), package/version/signing-certificate checks, and a
  FileProvider hand-off to Android's package installer, with the unknown-sources
  guidance.
- ABI-aware asset selection: the device's split first, universal as fallback,
  incompatible splits never offered.
- Launch and foreground checks throttled to one every six hours, plus a daily
  network-constrained WorkManager check. A release is announced once.
- Settings › Updates: installed version, check now, automatic checks, last check.
- Release workflow now produces `MusoPhone-v…` asset names, `SHA256SUMS.txt` and
  `update-manifest.json` for the GitHub Release.

### Packaging

- versionCode 53, versionName 3.2. Application ID, signing certificate
  (`9edcb3…a4a847`) and ABIs unchanged.
- `release/v3.2/` contains universal, arm64-v8a, armeabi-v7a and x86_64 APKs,
  `SHA256SUMS.txt`, `update-manifest.json` and `build-info.txt`.
- Not visually verified on a device; see `IMPLEMENTATION_PROGRESS.md`.

## 3.1 (52) — 26 November 2026

A page-level UI pass plus one install-time manifest fix. Playback, the queue,
lyrics sources and synchronisation, sources, downloads, playlists, accounts and
every existing destination are unchanged.

### Corrected — Liquid Glass pass (same 3.1 build, 26 November 2026)

- The first 3.1 binary still rendered as opaque charcoal cards on a flat black
  page. `MusoGlass` / `Modifier.musoGlassSurface()` now give every card, pill,
  icon button, the mini player and the navigation bar one translucent body, a
  light-to-shade gradient and a 0.7 dp rim lit at the top.
- The dark ground is a shallow `#0B0B11 → #040406` wash instead of flat `#000`,
  with the surface steps at `#16161C`, `#202028` and `#3A3A45`.
- Home wordmark is 51 dp tall (1.5× the previous 34 dp), aspect ratio unchanged.
- Player: the favourite and more controls are bare 21 dp glyphs in 40 dp targets;
  their filled discs and the shared frost behind them are removed, and the accent
  appears only on a liked track.
- Profile: identity is one glass sheet with an 88 dp ringed portrait, the action
  list has bare glyphs instead of icon plates, and statistics lead with the
  listening total over a quiet Songs / Artists / Albums three-up.
- Navigation is a floating glass capsule (12 dp inset, 8 dp lift); the mini
  player wears the same film and rim over its frost.
- Not visually verified on a device in this environment; see
  `IMPLEMENTATION_PROGRESS.md`.

### Changed

- Home: the masthead lockup is 34 dp tall (from 26 dp), at its original 3:1
  aspect ratio; the Recents pager's trailing 28 dp fades out so the intentional
  next-column peek no longer looks like a row cut off by the screen edge.
- Player: the volume slider and its two speaker glyphs are removed from both the
  portrait deck and the landscape half-player, the "Hide volume bar" setting is
  removed with them, and the height they occupied goes back to the artwork. The
  single lyric line above the scrubber is 21 sp (from 18 sp) and centred, and its
  slot height is derived from the strip's own line box.
- Search: recent searches are one 52 dp-thumbnail row each instead of a two-up
  grid of full-width square covers; the Addons tab's recents heading and Clear
  action match the other tabs'.
- Explore, Library: both take the same 56 dp header lift Home has used since 2.6
  (one shared `PAGE_HEADER_LIFT`), so their headings no longer sit a floating
  bar's height below the status bar.
- Profile: identity block rebuilt (page-name overline, account name as the
  heading, 72 dp portrait as the leading mark, facts beneath it); page gutters,
  section gaps and panel corners now use the shared tokens instead of local
  20 dp / 24 dp values.
- Theme: dark `surface` and `surfaceVariant` lifted to #111114 and #1B1B1F so
  raised panels read as charcoal rather than as holes in the AMOLED base.
- Manifest: `android.hardware.bluetooth` is explicitly `required="false"`; the
  merger's implied required feature was an install gate on devices without a
  radio.
- Version bumped to 3.1 (52).

### Fixed

- The stale 1.10 universal APK and AAB that sat in `release/` (version code 42,
  with an x86 slice the app has no native library for) moved to
  `release/legacy-v1.10/`, where they cannot be mistaken for the current build or
  offered as an update over it.

## 2.7 (51) — 25 November 2026

Two visual adjustments only. Playback, player state and every feature are
unchanged.

### Changed

- Home: the masthead lockup is 26 dp tall (from 22 dp) and sits 6 dp further
  left, at its original aspect ratio. Nothing else on the page moved.
- Player: the enclosing black deck is gone — its rounded panel, hairline border,
  accent seam and top inset were removed, and the lyric line, timeline,
  transport, volume, shuffle/repeat/autoplay strip, the lyrics/output/queue dock
  and the output label now sit directly on the player's own backdrop.

## 2.6 (50) — 25 November 2026

A proportional redesign of every page on the same AMOLED foundation. The app's
black base, typeface, accent palettes, player engine and every feature are
unchanged; headers, section headings, artwork corners, the Explore grid, the
Library rail, the Profile stats block, the mini player and the player's control
sizes were recomposed.

### Added

- `MusoV26` spacing/shape tokens, `MusoV26Header`, `MusoV26SectionHeader`,
  `MusoV26Stat`, `MusoV26RowDivider` and `MusoV26Facts` in the shared UI module.

### Changed

- Home: one-line masthead (22 dp lockup, 34 dp portrait control), 26 sp page
  name, quieter ambient wash, barless section headings, 10 dp shelf corners.
- Explore: mood/genre tiles are full-bleed artwork with a bottom scrim instead
  of a colour stripe plus duotone cover; 1.42:1 cards, two abreast.
- Library: compact header, category rail as underlined labels instead of filled
  capsules, 12 dp collection tiles, quieter counts.
- Search: 26 sp title with no brand line, field directly beneath it, barless
  section and recents headings, 16 dp best-match card.
- Profile: 64 dp portrait row, a single "Your listening" heading instead of a
  duplicated eyebrow and display heading, four stats in one panel, 16 dp gutter.
- Settings/About: 26 sp category title without a brand line, 18 dp group gaps.
- Player: 24 dp gutter, 520 dp max width, 12 dp sleeve corner, 22 dp deck
  corners, 64 dp play control in an 84 dp target.
- Mini player: 16 dp neutral slab, filled accent play button, smaller artist
  line. Bottom navigation: 24 dp glyphs, no accent halo.
- Version bumped to 2.6 (50).

## 2.5 (49) — 25 November 2026

A full visual pass across the app: one icon language, one panel, one motion
system, and a dedicated way into Profile. Playback and every existing feature
are unchanged.

### Added

- `MusoIcons`: a single stroked icon family (24 dp grid, 1.9 stroke, round
  caps) used by the bottom bar, the top bar, Profile and Settings.
- A dedicated Profile glyph in the top bar on every tab and in the Home
  masthead, opening the Profile page.
- `MusoActionRow`, `MusoEmptyState`, `MusoLoadingState`, `MusoIconButton`,
  `MusoPageHeader` and `MusoTokens` in the shared design system.
- `CHANGELOG.md` (this file).

### Changed

- Profile page: larger portrait under a soft accent wash, headline name pair,
  account actions as one grouped card of rows, shared loading and empty states.
- `MusoGlassCard`, Settings groups and About cards now share one neutral surface,
  one hairline rim and one radius ladder (14 / 22 / 26 dp).
- Bottom navigation: clean light inactive glyphs, an accent halo under the
  selected glyph, and the new icon set. Tab swaps still do not cross-fade.
- Page transitions: 340 ms enter with a subtle scale and a twelfth-of-the-edge
  slide; 240 ms exit. Reduced motion collapses both to a 120 ms cross-fade.
- Settings eyebrow is letter-spaced and the chevron comes from `MusoIcons`.
- Version bumped to 2.5 (49).

### Web (MusoPhone Web v2.5)

- The site carries MusoPhone's own identity: a new waveform-M logo, favicon,
  PWA/touch icons, extension toolbar icons and a 1200 × 630 social card, all
  rendered from one mark. The inherited BitChord crescent artwork is gone.
- AMOLED-black dark theme, neutral charcoal panels, porcelain light theme and
  the app's crimson accent; the lyric typeface is renamed MusoPhone SF Pro
  Display.
- Sidebar and settings navigation use one stroked 1.9 icon family; the
  extension glyph is a stroked puzzle rather than a Material filled icon.
- Full document head: title, description, canonical URL, Open Graph and Twitter
  cards, JSON-LD, `theme-color`, `site.webmanifest`, `robots.txt` and
  `sitemap.xml`. Per-page document titles follow the route.
- Pages settle in with a 320 ms fade-and-rise; reduced motion removes it.
  Keyboard focus gets a quiet accent ring.
- Settings gained an About group showing MusoPhone Web v2.5 and the Android
  download. Workspace packages are now `@musophone/*`; extension archive names
  are `musophone-extension-*`.

### Removed

- The account photograph as the top-bar profile control and as Home's profile
  control. The photograph remains on the Profile page itself.

## 2.4 (48) — 25 November 2026

- Romanized lyrics by default for non-Latin scripts, with the original sheet
  kept when romanization is unavailable.
- Player page recomposed: cinematic sleeve, tighter track block, one solid
  AMOLED control deck, Shuffle/Repeat/AutoPlay capsule.
- Home upper section refined; Library rebuilt as a browsable collection with a
  sticky category rail; Search rebuilt with cover cards and honest states.
- Bottom navigation selection became an inset capsule; profile routing fixed.
- About page rewritten; AMOLED surface rules; eight accent themes.
- Removed the in-app launcher icon picker.

## 2.3 (47) — 25 November 2026

- Refinement pass over settings, playback controls and the library rail.
- Release packaging for the v2.3 APKs; previous artifacts preserved.

## 2.2 (46) — 25 November 2026

- UI/UX reformation and settings simplification.
- AMOLED black foundation, charcoal surfaces, accent confined to interactive
  roles.

## 2.1 (45) — 25 November 2026

- Redesigned navigation: Radio left the bottom bar (its mixes remain under
  Library), four destinations, one back stack for every page.
- Release packaging for v2.1 with per-ABI APKs and an AAB.

## 1.11 (43) — 24 November 2026

- "Coral Glass" redesign; MusoPhone branding and package identity.
- First signed production artifacts under `release/v1.11`.

---

Earlier history belongs to the upstream BitChord project this player is derived
from; see `MODIFICATIONS.md` and the repository history for that lineage.
