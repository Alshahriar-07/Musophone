# MusoPhone 2.6 — Release Information

**Release date:** November 25, 2026  
**Version:** 2.6 (version code 50)  
**Package:** `com.musophone.player`  
**Minimum Android:** 8.0 (API 26)  
**Developed by:** EAGOX STUDIO TEAM — [eagoxstudio@gmail.com](mailto:eagoxstudio@gmail.com)

## What 2.6 is

v2.5 gave the app one icon family, one panel and one motion system, but every
page still opened the same way: a brand line over a 38 sp display title, with
26 dp between every section and a 22 dp corner on every surrounding box. Read as
a whole app, that is a lot of vertical air before any music, and a lot of round
panels around content that should be the loudest thing on screen.

v2.6 is a proportional redesign on the same foundation. The black base, the
typeface, the accent palettes and every feature are unchanged. What changed is
how much room the chrome takes, where artwork sits, and what a section heading
looks like.

## Highlights

- **Compact editorial headers.** Home, Library, Explore, Profile, Settings
  categories and the mood/genre page now open with one line: an optional quiet
  overline and the page name at 22 sp. The repeated `MUSOPHONE` brand line above
  every page is gone. On a short phone the first shelf is now visible without
  scrolling.
- **Sections announced by type, not by a bar.** The 3 dp accent bar in front of
  every section title (Home shelves, Recents, Search results, Search recents,
  Library groups) has been removed. Its job — "this is a heading" — is done by
  an overline and a 20 sp semibold title.
- **Artwork-first cards.** Shelf covers, video cards, Library tiles, search
  covers and fallback tiles are cut to a 10–12 dp corner instead of 12–16, and
  shelves sit 12 dp apart instead of 14, so a row of covers reads as one strip
  of music rather than a row of rounded panels.
- **Explore recomposed.** The mood and genre grid no longer splits each card
  into a solid colour stripe and a duotoned photograph. The cover fills the tile
  edge to edge, a bottom-weighted scrim carries the name, and the category's own
  colour survives only as the placeholder behind artwork that has not loaded.
  Cards are taller (1.42:1) and two abreast on every phone.
- **Library rail is a table of contents.** Category chips were filled accent
  capsules; they are now label rows with a 2 dp underline and an accent glyph on
  the selected category. The rail takes roughly half its old height and the
  first shelf moves up with it.
- **Profile: one heading, one stats panel.** The page printed "Your listening"
  twice (as an eyebrow and again as a display heading); it now prints it once.
  The four stat cards became one panel of four figures with a hairline between
  the rows, and the portrait is 64 dp inside a 64 dp row rather than 82 dp above
  an 26 dp gap.
- **Search opens on its field.** The page title is 26 sp with a single line of
  context, no brand line, and the field follows immediately. Result group
  headings and the recents heading lost their accent bars, and the best-match
  card is a 16 dp panel with a 12 dp sleeve.
- **Player rebalanced.** The content column is 24 dp from the edge (was 30) and
  caps at 520 dp (was 560); the sleeve corner is 12 dp (was 16) and the control
  deck's top corners are 22 dp (was 32). The primary transport is 64 dp drawn in
  an 84 dp target (was 74 in 92), so the buttons no longer outweigh the artwork
  and title above them. Playback, seeking, queue, lyrics, output routing and
  every gesture are untouched.
- **Mini player and navigation, quieter.** The mini player is a 16 dp slab
  (was 24) with a neutral hairline instead of a coral ring; its play control is
  a filled accent button, and its artist line is body size. Bottom navigation
  glyphs are 24 dp (was 28) and the accent halo behind the selected destination
  is gone — the inset capsule and the accent tint already say where you are.
- **Softer ambient light.** Home's masthead wash dropped from 0.20/0.075 alpha
  to 0.10/0.04, so the AMOLED background stays black under the heading instead
  of turning into a smoky gradient.

## Preserved functionality

Nothing was removed to achieve the new presentation. The following were checked
by reading the call sites and are wired to the same state and handlers as before:

- Play/pause, previous/next, seek and drag, live progress and timestamps.
- Lyrics: load, unavailable, expand/collapse, synchronized highlighting,
  romanization modes and restore-original.
- Favorite/unfavorite, track overflow, queue display and edits, shuffle, repeat
  modes, AutoPlay, audio output/device selection, artwork fallback.
- Home content sources, Top Picks, Find Your Mood, Recents, pull-to-refresh,
  profile navigation, song menus.
- Library categories, playlists, albums, artists, folders, sources, downloads,
  listening statistics (ListeningStats), and create/import playlist actions.
- Explore mood/genre navigation with real artwork and metadata.
- Search query editing, source tabs (YouTube / Library / Addons), filters,
  recent searches, typeahead, results navigation and empty states.
- Profile identity, Replay and History, account switching, account settings,
  listening stats and period filters.
- Settings: every preference and destination, including accent colour
  customization, playback, downloads, audio pipeline, sources, Listen Together,
  Wear OS and About.

## What changed, by page

| Page | Change |
| --- | --- |
| Home | Compact masthead, 26 sp page name, barless section headings, 10 dp covers, quieter wash |
| Explore | Editorial artwork tiles (no stripe/duotone), 1.42:1 cards, compact header |
| Library | Compact header, underline category rail, barless group headings, 12 dp tiles |
| Search | Compact title, field directly under it, barless group headings, 16 dp best-match card |
| Profile | 64 dp portrait row, single "Your listening" heading, one stats panel |
| Settings / About | 26 sp category title, 18 dp group spacing, no brand line |
| Player | Narrower column, smaller sleeve corner, lighter deck corners, 64 dp play control |
| Mini player | 16 dp neutral slab, filled accent play, smaller artist line |
| Bottom navigation | 24 dp glyphs, no halo, quieter indicator |
| Shared | `MusoV26Header`, `MusoV26SectionHeader`, `MusoV26Stat`, `MusoV26` tokens |

## Build and verification

- Version: **2.6 (50)**, minSdk 26, targetSdk 36, compileSdk 37.
- Toolchain: Gradle 8.11.1, AGP 8.10.1, Kotlin 2.3.20, R8 8.13.23, JDK 21.0.13.
- `:app:assembleProdRelease` — **BUILD SUCCESSFUL** (7m 54s), R8 minified,
  resource-shrunk and signed.
- Unit tests: `:app:testProdDebugUnitTest` 1,347 tests, 1 skipped, 0 failed;
  `:shared:jvmTest` 159 tests, 0 failed; `:sharedUi:jvmTest` 114 tests, 0 failed.
- `apksigner verify` — Verifies (v2 and v3, same certificate SHA-256
  `9edcb3cb…a4a847` as v2.5). `unzip -t` — no errors. `aapt2 badging` — versionCode
  50, versionName 2.6, minSdk 26, targetSdk 36.
- **No device or emulator was attached to the build machine**, so installation,
  launch and on-screen visual inspection were **not** performed. The layout
  changes were reviewed in source only; treat the visual result as unverified
  until it has been seen on a screen.

## Artifacts

`release/v2.6/`, alongside the untouched `v1.11`, `v2.1`, `v2.2`, `v2.3` and
`v2.5` folders. Historical APKs and their checksums were not modified.

| File | Size |
| --- | --- |
| `MusoPhone-v2.6.apk` (universal) | 84,330,761 bytes |
| `MusoPhone-v2.6-arm64-v8a.apk` | 46,900,722 bytes |
| `MusoPhone-v2.6-armeabi-v7a.apk` | 40,200,388 bytes |
| `MusoPhone-v2.6-x86_64.apk` | 49,381,603 bytes |

SHA-256 of the universal APK:
`d07d73462f9f3f9326c806fef7c2b905708eec60b696e0e5f3d988e3fef174c0`
(see `release/v2.6/SHA256SUMS.txt` for the per-ABI sums).
