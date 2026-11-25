# Changelog

MusoPhone is an independent Android music player by EAGOX STUDIO TEAM.
Version numbers are the app's `versionName`; the version code in brackets is the
one Android compares for updates.

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
