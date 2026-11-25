# MusoPhone UI Overhaul — QA and Acceptance Checklist

## A. Before implementation
- [ ] Read all plan files.
- [ ] Inspect all screenshots in `03-Screenshot-References/`.
- [ ] Inspect current v2.5 repository and identify actual screen implementations.
- [ ] Map each visible defect to a composable/component.
- [ ] Record existing build/test baseline.
- [ ] Inventory player state, callbacks and navigation.
- [ ] Identify shared insets, mini-player and bottom navigation ownership.
- [ ] Identify old assets and verify references before removal.

## B. Design system
- [ ] Shared spacing scale created/cleaned.
- [ ] Typography hierarchy defined.
- [ ] Semantic color roles defined.
- [ ] Existing accent color customization preserved.
- [ ] Shape system defined.
- [ ] Icon family unified.
- [ ] Motion rules consistent.
- [ ] Reduced-motion behavior respected.
- [ ] Contrast checked for every accent theme.

## C. Layout and visual QA
- [ ] Home top whitespace fixed.
- [ ] Home content hierarchy and section rhythm improved.
- [ ] Player redesigned as a cohesive composition.
- [ ] Player artwork scales without distortion.
- [ ] Lyrics immediately above timeline.
- [ ] Player controls do not duplicate actions.
- [ ] Player short-height layout verified.
- [ ] Library carousel has no accidental clipping.
- [ ] Library categories and grids adapt.
- [ ] Explore cards have consistent proportions.
- [ ] Search keyboard-visible state works.
- [ ] Profile actions and account switching remain reachable.
- [ ] Settings sections are compact and consistent.
- [ ] Mini-player never overlaps scroll content.
- [ ] Bottom navigation safe-area behavior is correct.
- [ ] No text clipping, overlap or off-screen controls.
- [ ] Loading, error and empty states are designed.

## D. Functional regression
- [ ] Play/pause.
- [ ] Previous/next.
- [ ] Seek/drag.
- [ ] Live progress/time.
- [ ] Lyrics expand/collapse.
- [ ] Synchronized lyrics.
- [ ] Romanization and restore-original behavior.
- [ ] Favorite/unfavorite.
- [ ] Track overflow.
- [ ] Queue management.
- [ ] Shuffle.
- [ ] Repeat modes.
- [ ] AutoPlay.
- [ ] Audio output/device selector.
- [ ] Artwork fallback.
- [ ] Mini-player synchronization.
- [ ] Background playback/media session.
- [ ] Home actions and refresh.
- [ ] Library categories and source actions.
- [ ] Explore navigation.
- [ ] Search query/history/filters.
- [ ] Profile navigation/account actions.
- [ ] Settings and accent customization.

## E. Build and release
- [ ] Production compile successful.
- [ ] Relevant unit tests pass.
- [ ] No new warnings/errors left unexplained.
- [ ] Emulator/device visual inspection completed, or limitation documented.
- [ ] README.md updated.
- [ ] RELEASEINFO.md updated.
- [ ] Changelog/release notes updated.
- [ ] Version metadata consistent.
- [ ] New APK built in dedicated version folder.
- [ ] Historical release artifacts preserved.
- [ ] APK path and file size reported.
- [ ] Final report lists verified items and unverified limitations.

## Acceptance rule

Do not mark a section complete based only on compilation. Visual and functional verification are separate requirements.
