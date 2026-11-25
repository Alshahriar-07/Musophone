# MusoPhone v2.5 → Complete Product UI Overhaul Plan

## 1. Project intent

MusoPhone v2.5 is the current baseline being audited. The screenshots show that the recent visual changes have not produced a coherent premium experience. Several screens have oversized or inconsistent spacing, poor content balance, clipping, weak hierarchy, inconsistent component styling, and player composition problems.

This project is **not a small polish pass**. It is a full visual and interaction-design overhaul of the existing MusoPhone product.

The next planned target is **v2.6**, subject to the repository's actual versioning conventions. The agent must inspect version metadata before changing it.

### Product objective

Create an original, premium, modern music player with:
- A strong and recognizable MusoPhone visual identity.
- A cohesive design system shared by all screens.
- Correct proportions and responsive layouts.
- Clear hierarchy and excellent content density.
- Beautiful artwork presentation without compromising readability.
- Fast, smooth, purposeful interactions.
- Existing functionality preserved.

The redesign must be visually distinct from BitChord. Do not reuse BitChord screen compositions, iconography, old visual assets, or recognizable styling. Preserve legally required license notices and source attribution.

## 2. Current problems evidenced by screenshots

### Global
- Vertical spacing is inconsistent between screens.
- Some headers and top regions consume too much screen height.
- The visual language changes from page to page.
- Too many elements rely on generic rounded dark cards.
- Several components look oversized or poorly aligned.
- The bottom mini-player and navigation need consistent safe-area handling.
- Icons do not feel like one coherent family.
- Some screens have large unused areas while important content is cramped.
- Ambient blur can become muddy, low-contrast or visually noisy.
- The app feels like a collection of redesigned components rather than one designed product.

### Home
- Excessive empty area at the top.
- Masthead/header height and typography feel too large.
- Top Picks, Recents and other sections lack balanced rhythm.
- Cards and list rows need consistent sizing.
- Mini-player and bottom navigation consume/overlap content if insets are not handled correctly.
- The screen needs a clearer editorial hierarchy and more intentional content density.

### Player — highest priority
- Artwork, track metadata and controls are not balanced as one composition.
- Artwork sizing/positioning does not adapt reliably to different screen heights.
- Track title and artist row can be clipped or squeezed.
- Lyrics section feels disconnected from the playback timeline.
- Playback controls are visually oversized relative to the rest of the player.
- Timeline, timestamps, volume and secondary controls lack a clear hierarchy.
- Dynamic artwork background is sometimes too muddy or dominant.
- The page can feel crowded vertically while still wasting space in other areas.
- Playing and paused states must both look intentional.

### Library
- Listening Experience/statistics carousel is visibly clipped and horizontally mispositioned.
- Sections have inconsistent spacing.
- Source tiles and playlist tiles have weak proportions.
- Category rail, shelves and grids need a consistent layout system.
- Artwork and metadata need better hierarchy.

### Explore
- Playlist/mood tiles feel generic and repetitive.
- Grid spacing and image treatment need refinement.
- Text placement/contrast needs to be consistent.
- The screen needs more editorial composition and less template-like presentation.

### Profile
- The page direction is usable but needs more disciplined spacing and alignment.
- Profile identity, account actions and listening statistics need clearer grouping.
- Avoid redundant profile/avatar entry points that lead to inconsistent destinations.

### Search
- Search header and recent-search region use space inefficiently.
- Recent-search cards need improved dimensions and alignment.
- Search mode/category controls need stronger hierarchy.
- Keyboard-visible and keyboard-hidden states both need review.

### Settings
- Header and section spacing are too large.
- Category rows, icons, separators and About/version area need a unified component system.
- Preserve the existing accent customization and all settings behavior.

## 3. New visual direction

Create an **original AMOLED editorial music experience**.

Suggested design qualities:
- Near-black/black foundation with carefully layered neutral surfaces.
- Warm or cool neutral typography, selected according to contrast tests.
- Accent color used selectively for active states, progress, selection and focus.
- Large, high-quality album artwork used as the emotional focal point.
- Restrained artwork-derived ambient lighting, fading into black.
- Minimal chrome; content should lead.
- Intentional typography scale and line-height.
- Consistent icon stroke, size and optical alignment.
- Rounded shapes used with purpose, not applied to every element.
- Subtle separators and tonal surfaces instead of excessive borders.
- No random gradients, neon, decorative blobs or excessive glass effects.

This is a direction, not a mandate to copy a reference app. Build a distinct MusoPhone design language.

## 4. Non-negotiable redesign rule

**Old designs must be fully replaced.**

Do not preserve old page layouts and merely change:
- Colors
- Corner radii
- Font sizes
- Shadows
- Card backgrounds
- Icon tint

Reconsider each screen's composition, hierarchy, layout, spacing, component structure and interaction feedback. Reuse business logic and stable functional components where appropriate, but do not keep a visually broken composition simply because it already exists.

## 5. Design goals and measurable outcomes

| Area | Current issue | Target outcome |
|---|---|---|
| Global spacing | Uneven and oversized | Shared spacing scale; no arbitrary gaps |
| Top headers | Excessive vertical space | Compact, purposeful headers |
| Artwork | Inconsistent scale/cropping | Correct ratio, stable bounds, no distortion |
| Typography | Weak hierarchy/clipping | Clear type scale, readable metadata |
| Cards | Generic and overused | Purposeful surfaces and editorial layouts |
| Navigation | Heavy/oversized | Compact, clear selected state |
| Mini-player | Competes with content | Stable overlay/inset behavior |
| Player | Unbalanced/crowded | One coherent listening composition |
| Blur | Muddy/low contrast | Subtle, bounded, optional ambient depth |
| Motion | Inconsistent | Meaningful, smooth, restrained transitions |
| Responsive | Fixed-size assumptions | Adapt to window size and available height |
| Functionality | Existing regressions reported | All original behavior retained and tested |

## 6. Scope

### Included
- Home
- Full-screen Music Player
- Library and its category/shelf/source views
- Explore
- Search and search states
- Profile
- Settings and About presentation
- Shared app bars, cards, rows, chips, dialogs, sheets, mini-player, bottom navigation and icon system
- Typography, spacing, shapes, color roles, artwork presentation, blur and motion
- Responsive behavior and visual QA
- Bug fixes directly caused by UI/layout interactions

### Excluded unless a real UI defect requires a minimal fix
- Playback service architecture
- Audio pipeline/backend
- APIs and network contracts
- Database schema/migrations
- Authentication architecture
- Download engine
- Media-session/background playback architecture
- Lyrics provider/translation backend
- Business logic unrelated to presentation

Do not change these excluded systems to achieve a visual result.

## 7. Priority order

1. **P0 — Player:** composition, artwork, metadata, lyrics, timeline, controls, output selector, all states.
2. **P0 — Global shell:** system insets, compact top areas, mini-player, bottom navigation, shared spacing.
3. **P1 — Home:** masthead, hero/editorial sections, Top Picks, Recents and content rhythm.
4. **P1 — Library:** carousel geometry, source tiles, playlist shelves and categories.
5. **P1 — Search:** search header, filters, recent searches, results and keyboard states.
6. **P2 — Explore:** artwork grid, editorial layout and category presentation.
7. **P2 — Profile:** identity, actions, stats and account flows.
8. **P2 — Settings/About:** compact sections, icons, version and links.
9. **P2 — Global polish:** icons, motion, accessibility, loading/empty/error states.

## 8. Implementation process

### Phase A — Audit before coding
- Inspect the actual repository and current v2.5 source.
- Identify Compose/navigation architecture, shared components and design tokens.
- Map each screenshot to the actual screen/composable.
- Identify every top/bottom inset owner.
- Trace mini-player and bottom-navigation layout ownership.
- Inventory all player states and handlers.
- Identify old BitChord-derived visual resources and references.
- Record current build/test baseline.
- Produce a short audit report before changing code.

### Phase B — Design system foundation
- Define typography, spacing, shape, color-role and elevation tokens.
- Establish shared icon dimensions and stroke rules.
- Define surface hierarchy and artwork ambient-light rules.
- Define motion durations/easing and reduced-motion behavior.
- Define compact/medium/expanded layout behavior.
- Replace inconsistent shared components with reusable MusoPhone components.

### Phase C — Rebuild page compositions
Implement the page priorities above. Do not make all pages look identical: consistency comes from shared design rules, while each page retains its own information architecture.

### Phase D — Functional regression pass
Verify all interactions and state synchronization. Fix any regression before visual sign-off.

### Phase E — Visual QA
Capture screenshots on actual emulator/device dimensions. Compare against the supplied current screenshots and the target criteria in this pack. Inspect small, average and tall phone layouts. Test system font scaling and keyboard-visible states.

### Phase F — Release
- Update version metadata consistently.
- Update README.md, RELEASEINFO.md, changelog/release notes and other relevant documentation.
- Build the requested production APK.
- Keep historical APKs and release directories unchanged.
- Put the new artifact in a dedicated versioned release folder.
- Record build variant, path, size, checksums if the project already uses them, and test results.

## 9. Definition of done

The task is not complete merely because Gradle succeeds.

It is complete only when:
- Every included screen has a genuinely new, coherent composition.
- The old visual design is no longer recognizable in the redesigned screens.
- No content is clipped, overlapped or hidden behind system/navigation/mini-player regions.
- Player controls, lyrics, timeline and output selection work.
- Home, Library, Explore, Search, Profile and Settings remain functional.
- Accent color customization still works.
- Loading, error, empty, playing, paused and keyboard-visible states are designed.
- Layout adapts to different screen dimensions.
- Tests/build pass.
- Device/emulator screenshots have been reviewed, or the lack of a device is explicitly reported.
- Documentation and release metadata match the delivered build.
