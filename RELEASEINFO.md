# MusoPhone 2.2 — Release Information

**Release date:** November 25, 2026  
**Version:** 2.2 (version code 45)  
**Package:** `com.musophone.player`  
**Minimum Android:** 8.0 (API 26)  
**Developed by:** EAGOX STUDIO TEAM — [eagoxstudio@gmail.com](mailto:eagoxstudio@gmail.com)

## Highlights

- **Liquid Glass removed.** Live backdrop blur is replaced by solid, theme-aware
  surfaces at a single choke point; menus, bars, sheets and dialogs keep their
  call sites but no longer sample what is behind them.
- **GPU-heavy effects removed** — the drifting blurred mesh background, lyric
  glow blur, mix-tile blur, party backdrop blur and detail soft-foot blur.
- **Full-screen cover art removed** from the player and detail pages, along with
  both related settings and their sub-options.
- **Player deck rebalanced** — always-visible shuffle/repeat/autoplay strip,
  symmetric lyrics/queue/output dock, tighter spacing, no redundant handle row.
- **Home first screen** — reduced masthead spacing and a larger feed lift.
- **Library** — folders listed before Replay cards.
- **Settings** — only options whose features still exist; Appearance keeps all
  theme/look controls together.
- **About MusoPhone** — solid cards, runtime version, accurate credits.
- **Eight accent themes** preserved and theme-aware.
- Version bumped to **2.2 (45)**.

## Downloads (`release/v2.2/`)

- `MusoPhone-v2.2-arm64-v8a.apk` — recommended, 45 MB
- `MusoPhone-v2.2-armeabi-v7a.apk` — older 32-bit phones, 39 MB
- `MusoPhone-v2.2.apk` — universal fallback, 81 MB
- `MusoPhone-v2.2-x86_64.apk` — emulators, 48 MB
- `SHA256SUMS.txt`

Previous releases in `release/v1.11/` and `release/v2.1/` are untouched.

## Verification

- Unit tests: 1,345 passed, 1 skipped, 0 failed.
- Release build: `:app:assembleProdRelease` successful; `lintVitalProdRelease`
  passed.
- Metadata: `com.musophone.player`, versionCode 45, versionName 2.2, minSdk 26.
- Signature: APK Signature Scheme v3, certificate SHA-256
  `9edcb3cbbad2b7f8c72677daf5d8f6e6a75a19bf7e9e96080746495130a4a847`.
- 16 KB ELF page alignment verified with `zipalign -c -P 16`.
- No device was attached (`adb devices` empty): install and runtime behaviour
  remain untested. See `release/v2.2/RELEASE_NOTES.md`.
