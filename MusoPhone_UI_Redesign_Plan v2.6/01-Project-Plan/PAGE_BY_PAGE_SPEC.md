# Page-by-Page Redesign Specification

## 1. Global app shell

### Problems to solve
- Excessive top blank space.
- Inconsistent system-bar handling.
- Mini-player and bottom navigation collisions.
- Different page headers appear to follow different spacing rules.

### Target
- One deliberate edge-to-edge strategy.
- System status/navigation bars remain native and correctly inset.
- Content starts at a consistent, intentional position below the status bar.
- Compact top-level headers; no oversized empty header blocks.
- Bottom navigation has a stable height and selected state.
- Mini-player sits above navigation with consistent separation and never covers scroll content.
- Scroll containers reserve correct bottom content padding.
- Profile entry point routes to one canonical Profile page.

### Verify
- No double-applied status bar padding.
- No missing bottom safe-area padding.
- No overlapping mini-player/navigation.
- Back behavior and tab state are unchanged.

## 2. Home

### New composition
- Compact brand/header row.
- Compact profile entry point with a clear action.
- Strong but controlled hero title.
- Editorial feature/Top Picks region.
- Recents and other real-data sections in a clean vertical rhythm.
- List rows should prioritize title/artist readability and compact artwork.
- Avoid giant top padding and oversized masthead.
- Ambient depth may be used behind the upper hero only; it must fade into the page and never reduce text contrast.

### Rules
- Use only real application data.
- No fake recommendations, placeholder artwork or invented counts.
- Horizontal carousels must show a deliberate peek of the next card only when that is the chosen interaction pattern.
- No accidental clipping at the right edge.
- Pull-to-refresh and existing navigation remain intact.

## 3. Full-screen Player — highest priority

### Composition target
Design one cohesive player canvas, not a pile of unrelated panels.

Suggested hierarchy:
1. Compact top bar: collapse/back, playing-from context, overflow.
2. Artwork hero: responsive square artwork with controlled maximum size.
3. Track metadata: title, artist, favorite and more actions.
4. Lyrics preview/expand region directly above timeline.
5. Timeline with current/remaining time and seek affordance.
6. Primary controls: shuffle, previous, play/pause, next, repeat.
7. Secondary controls: shuffle/repeat/AutoPlay only if the current product intentionally exposes these separately; avoid duplicating the same action without a clear reason.
8. Volume and audio output/device controls arranged according to available height and existing feature set.

### Important design decision
The previous specification contained both Shuffle/Repeat in the main transport row and another secondary Shuffle/Repeat/AutoPlay row. That can duplicate actions and waste vertical space. During audit, determine which controls already exist and keep one clear, non-duplicated interaction for each feature. If both representations are required by current product behavior, make their relationship obvious and synchronize their state.

### Artwork
- Preserve source aspect ratio; square artwork should remain square.
- Use a bounded responsive size based on available width and height, not a single fixed dp size.
- Never stretch artwork.
- Use clipping only for the intended corner treatment.
- Ambient background should be extracted from artwork only if the current implementation supports it; keep it low opacity and fade toward black.
- If artwork is missing, use the app's existing fallback state.

### Lyrics
- Lyrics must remain directly above the playback timeline.
- Preserve expand/collapse.
- Preserve synchronized timestamps and line highlighting.
- Preserve romanized lyrics behavior and original-script restore behavior.
- Do not invent lyrics.
- Empty/unavailable/loading/error states must be legible and compact.
- Long lyrics and long lines must scroll/clip correctly without covering seek controls.

### Timeline and transport
- Seeking and dragging must remain responsive.
- Current and remaining/duration labels must remain readable.
- Play/pause state must reflect the playback engine, not local mock state.
- Previous/next, shuffle and repeat modes must preserve real state.
- Do not add duplicate controls.

### Height adaptation
- On short screens, reduce artwork size before hiding essential controls.
- Keep play/pause reachable.
- Use scroll only where necessary and preserve the primary listening controls.
- On tall screens, distribute content intentionally; do not stretch gaps.
- Test landscape/foldable/expanded window behavior where supported.

## 4. Library

### New composition
- Compact page title/header.
- Scrollable category selector with clear selected state.
- Listening Experience section redesigned as a properly measured carousel or compact stats module.
- Sources presented as concise source rows/tiles.
- Playlists and collections presented in a consistent grid/list based on content type.
- Avoid clipped carousel cards and oversized empty shelves.

### Verify
- Categories and counts come from live state.
- Downloads, local music, folders, artists, albums, playlists and sources remain reachable.
- Empty/loading/error states are distinct.
- Grid column count adapts to available width.

## 5. Explore

- Create an editorial discovery layout rather than a generic grid of identical colored rectangles.
- Use real artwork and actual playlist metadata.
- Establish a consistent card aspect ratio and image crop.
- Use overlays only when text contrast requires them.
- Avoid arbitrary colored side strips.
- Maintain readable text and accessible touch targets.
- Preserve all existing playlist/category actions.

## 6. Search

- Search field should be prominent but compact.
- Category/source tabs should be visually subordinate to the query.
- Recent searches should use a compact, consistent visual pattern.
- Results should use content-aware layouts: songs as rows, albums/playlists as artwork cards, artists as artist items.
- No-results state must preserve the query and offer a useful path forward.
- Empty state and loading state must not look like a broken blank page.
- Keyboard-visible state must not obscure results or controls.
- Preserve query, history, filters, source selection and search actions.

## 7. Profile

- One canonical profile destination.
- Profile avatar, name and account status should have clear hierarchy.
- Account actions grouped in a compact list or menu.
- Listening stats must be legible and not dominate the identity section.
- Time-range selector should have a clear selected state.
- Remove redundant profile entry points only if routing remains available elsewhere.
- Account switching and account settings must remain reachable.

## 8. Settings and About

- Compact header and search/settings field if already supported.
- Group settings by category using consistent rows and icons.
- Use dividers sparingly.
- Preserve all setting destinations and values.
- Accent color picker must continue controlling interactive highlights.
- About page must accurately describe MusoPhone's own product work and third-party technology used. Do not make misleading ownership or endorsement claims.
- Version label must match release metadata.

## 9. Shared components

Redesign shared:
- Top bars
- Bottom navigation
- Mini-player
- Search field
- Category chips
- Song rows
- Artwork tiles
- Section headers
- Dialogs and bottom sheets
- Empty/loading/error states
- Profile/avatar buttons
- Icon buttons
- Sliders and toggles

Each shared component must have defined dimensions, typography, state colors, accessibility semantics and touch target behavior.
