# MusoPhone 2.5 — Release Information

**Release date:** November 25, 2026  
**Version:** 2.5 (version code 49)  
**Package:** `com.musophone.player`  
**Minimum Android:** 8.0 (API 26)  
**Developed by:** EAGOX STUDIO TEAM — [eagoxstudio@gmail.com](mailto:eagoxstudio@gmail.com)

## Highlights

- **A new icon family, everywhere.** `MusoIcons` replaces the mixed set the app
  had accumulated: one 24 dp grid, one 1.9 stroke, round caps and joins, open
  counters, and filled shapes only where a state has to survive without colour.
  The bottom bar's four destinations, the profile control on every tab, Settings'
  chevrons and Profile's account actions are all drawn from it. The old
  Cupertino-derived tab glyphs (a solid Home next to three font outlines) are no
  longer used for navigation.
- **Profile is a glyph, not a photograph.** The account avatar that sat at the
  right end of the top bar — a menu in one version, a settings shortcut in the
  next — is now the app's own profile icon on the same quiet surface as every
  other control, and it opens the Profile **page**. The Home masthead uses the
  same control. Account switching and account settings are rows on that page, so
  nothing was lost; the account's actual picture stays on the Profile page, at
  full size, where it belongs.
- **Profile page recomposed.** A larger portrait under one soft wash of the
  theme's own light, the name and address set as a headline pair, the local/private
  facts beneath them, and the gear as a round icon button. Every destination off
  the page — Replay, History, Switch account, Account settings — is now one
  grouped card of action rows with a glyph, a title and a chevron, replacing the
  scrolling row of chips that used to close the page.
- **One panel across the app.** The raised surface is a single neutral charcoal
  step with a hairline rim and one whisper of light along its top edge — no
  captured glass, no long gradient, no translucency stacking. `MusoGlassCard`,
  Settings groups and About's cards now use exactly that surface, at the same
  radius ladder (14 / 22 / 26 dp). The type scale gained one eyebrow style, so
  section labels on Profile, Settings and About agree.
- **Shared states.** `MusoEmptyState` and `MusoLoadingState` give every page the
  same deliberate blank and the same breathing three-dot load: a glyph in a
  quiet circle, a title, a sentence and at most one action. Profile uses both;
  the components are available to every screen. The loading breath stops under
  *Reduce animation*.
- **Motion, tuned and honest.** A pushed page now settles in from a twelfth of
  the edge, 1.5 % under full size, on the app's easing curve, with a shorter
  fade out beneath it; the tab swap stays instantaneous, because the bar already
  carries that movement and a cross-fade between two unpainted pages dips
  through a dim frame. With *Reduce animation* on, the same change becomes a
  120 ms cross-fade with no slide and no scale. The selected bottom-bar glyph
  gained a soft accent halo and sits on clean light inactive glyphs at rest.
- **Playback untouched.** No engine, session, queue, lyrics, scrobble, cast,
  download or equalizer code was modified. Every feature listed for 2.4 remains,
  including romanized and translated lyrics, accent colour customization and the
  AMOLED true-black foundation.
- Version is **2.5 (49)**.

## What changed, by page

| Page | Change |
| --- | --- |
| Home | Profile control is the profile glyph; existing v2.4 masthead and light washes kept |
| Explore | New bar glyphs; unchanged content design from v2.4 |
| Library | New bar glyphs; panel/row treatment inherited from the shared tokens |
| Search | New bar glyphs; existing v2.4 cover cards, blank and no-results states kept |
| Player | Untouched transport, controls and lyrics; transitions now respect reduced motion |
| Playlist / Album / Artist | Header, sleeve and track list kept from v2.4; shared chrome above them updated |
| Profile | Recomposed header, account action card, shared loading and empty states |
| Settings | Standard panel group, new chevron, letter-spaced eyebrow; all rows and switches unchanged |
| Account & Scrobbling, Equalizer, Sources, History, Drive, Discord, Listen Together | Inherit the Settings group, row and chevron language |
| About | About's cards are the standard panel at the standard radius |
| Mini player | Untouched transport and dock; shares the bar's new icon language |
| Dialogs, sheets, menus | Unchanged behaviour; all sit on the shared panel and type scale |
| Loading / empty states | One shared pair, used on Profile and available app-wide |

## Web (MusoPhone Web v2.5)

The site at `web/` got the same identity pass:

- **New brand artwork.** A single waveform-M mark now draws the sidebar and
  mobile header; the favicon, the 192/512 PWA icons, the 180 px Apple touch
  icon, the five extension toolbar icons and the 1200 × 630 social card are all
  rendered from it. The inherited BitChord crescent mark, its red-gradient
  favicon and the toolbar PNGs made from it are gone.
- **The app's palette.** AMOLED-black dark theme, neutral charcoal panels,
  porcelain light theme, one crimson accent; the lyric font is now MusoPhone SF
  Pro Display. Settings groups are the same panel with a hairline rim.
- **One icon language.** Sidebar, library and settings navigation use open
  1.9-stroke glyphs; the extension entry is a stroked puzzle.
- **Metadata and sharing.** Title, description, canonical URL, Open Graph and
  Twitter cards with the new image, JSON-LD, `theme-color`, web manifest,
  `robots.txt`, `sitemap.xml`, and a document title per route.
- **Motion.** Pages settle in with a 320 ms fade-and-rise (removed under
  `prefers-reduced-motion`), and keyboard focus has a quiet accent ring.
- **Version 2.5** is shown in the sidebar and in Settings › About; workspace
  packages are `@musophone/*` and extension archives are
  `musophone-extension-*`. Legacy protocol and storage identifiers (the
  `bitchord://party/` invite scheme, extension origin trust, `bitchord:*`
  localStorage keys) are kept so existing installs and parties keep working.

Verification: `pnpm -r typecheck` passed; `pnpm -r test` 169 tests passed;
`pnpm --filter @musophone/app build` passed (Vite production build). The built
site was served with `vite preview` and inspected at desktop and phone widths.

## Build and verification

- `:app:compileProdDebugKotlin` — passed.
- Unit tests: `:app:testProdDebugUnitTest` 1,347 tests, 1 skipped, 0 failed;
  `:shared:jvmTest` 159 tests, 0 failed.
- `:app:assembleProdRelease` — passed (R8 minified, resource-shrunk, signed).
- Metadata: `com.musophone.player`, versionCode **49**, versionName **2.5**,
  minSdk 26, targetSdk 36, compileSdk 37.
- Signature: APK Signature Scheme v2 and v3, one signer, RSA 4096,
  `CN=MusoPhone, OU=Mobile, O=Al Shahriar Sowan, L=Dhaka, ST=Dhaka, C=BD`
  (SHA-256 `9edcb3cbbad2b7f8c72677daf5d8f6e6a75a19bf7e9e96080746495130a4a847`).
- `apksigner verify` — **Verifies**. `unzip -t` — no errors.
- **No device or emulator was attached**, so installation and launch on hardware
  remain unverified, and the visual result was not inspected on a screen.

## Artifacts

`release/v2.5/`, alongside the untouched `v1.11`, `v2.1`, `v2.2` and `v2.3`
entries. (v2.4 was a source-only update and never produced an APK, so there is
no v2.4 artifact to preserve.)

| File | Size |
| --- | --- |
| `MusoPhone-v2.5.apk` (universal) | 84,330,757 bytes |
| `MusoPhone-v2.5-arm64-v8a.apk` | 46,900,718 bytes |
| `MusoPhone-v2.5-armeabi-v7a.apk` | 40,200,384 bytes |
| `MusoPhone-v2.5-x86_64.apk` | 49,381,599 bytes |

SHA-256 of the universal APK:
`f99cf72d2f8e459fea61b5509e25e56a154144f839378b0ddd863d15242d409b`
(see `SHA256SUMS.txt` for the per-ABI sums).
