# 2. Complete Page-by-Page UI Redesign Specification

## 2.1 Design objective

Build a completely new MusoPhone visual system. Do not keep BitChord layouts and merely recolor them. Redesign hierarchy, component structure, spacing, shapes, typography, icons, interaction states, and motion.

**Preserve behavior:** existing actions, data sources, playback state, authentication state, navigation destinations, and backend calls must remain connected to their current working logic unless a documented bug fix requires a change.

## 2.2 Global design system

- Premium, restrained glassmorphism.
- Deep/dark foundation as the initial default, with theme-aware surfaces.
- Frosted translucent cards and panels where legibility allows.
- Subtle blur, layered depth, controlled transparency.
- Consistent corner-radius scale; avoid random rounding.
- Modern readable typography with clear hierarchy.
- Custom coherent icon set; prefer vector/SVG or native vector assets.
- Theme-aware accent color for selected states and key actions.
- Consistent paddings, margins, card heights, and touch targets.
- Smooth but lightweight transitions; avoid excessive blur and GPU-heavy effects.
- Support small and large phones, display cutouts, gesture navigation, and system bars.
- Accessibility: sufficient contrast, scalable text, content descriptions, keyboard/screen-reader support where applicable, and reduced-motion handling.

## 2.3 Every page must be redesigned

### A. Home
- Retain all existing home content and data behavior.
- Redesign the header, logo placement, greeting/title, profile entry, recommendation sections, cards, and recent tracks.
- Create a new recommendation-card layout with consistent image treatment and text hierarchy.
- Redesign recent-track rows, artwork thumbnails, overflow actions, loading, empty, and error states.
- Preserve actual recommendation data and click destinations.
- Do not add fake recommendations or hard-coded user statistics.

### B. Explore
- Completely new page layout and section hierarchy.
- Redesign genre/category discovery, featured content, playlists, albums, artists, and search/discovery entry points that currently exist.
- Preserve all existing data queries and navigation actions.
- Design loading, no-results, offline, and error states.

### C. Library
- Redesign saved songs, playlists, albums, artists, downloads, history, and other existing library categories.
- Preserve sorting, filtering, add/remove, download, and playback actions where currently supported.
- Do not remove a library category simply because it is not visible in a screenshot.
- Include empty states and large-library performance considerations.

### D. Search
- New search field, search suggestions, recent searches, result tabs/filters, result rows, and empty states.
- Preserve current search provider/API behavior and debounce/cancellation logic.
- Ensure keyboard opening, back navigation, and result selection work correctly.
- Search must remain functional under every theme.

### E. Full-screen Player / Now Playing
- New album-art presentation and player layout.
- Redesign title/artist metadata, progress slider, elapsed/remaining time, playback controls, queue access, shuffle, repeat, favorite, lyrics, device/output options, and overflow actions—only where those features already exist.
- Preserve playback engine, audio session, queue, repeat/shuffle state, media session, notification controls, headset/Bluetooth actions, and background playback.
- Ensure mini-player and full player stay synchronized.

### F. Mini Player
- New floating/glass mini-player visual treatment.
- Preserve play/pause, next, track title, artwork, progress if supported, and tap-to-open-player.
- Ensure it does not overlap bottom navigation, gesture area, or content.
- Correctly respond to loading, buffering, paused, playing, and no-track states.

### G. Profile
- Keep the current profile page's overall direction because the owner says its page design and top profile area are now correct.
- Refine only where needed for visual consistency.
- Profile identity, avatar, name, account state, and sign-out behavior must remain correct.
- Profile's **Settings** entry must open **App Settings**.
- If there is a separate Profile Settings feature, preserve it as a distinct destination only if the existing app genuinely uses it; do not route the App Settings button to it.

### H. App Settings
- Rebuild the settings page with a clear grouping system and new glass cards.
- Add Theme section with eight accent themes.
- Preserve every existing setting, permission explanation, account action, cache/download control, playback preference, and other existing setting.
- Do not fabricate settings that have no implementation.
- Every control must persist and restore its actual value.
- Destructive actions require clear confirmation.

### I. Dialogs, sheets, menus, and contextual actions
- Audit and redesign every dialog, bottom sheet, popup menu, overflow menu, confirmation, permission rationale, and toast/snackbar.
- Remove the old global menu button from all pages.
- Do not remove the underlying actions that were accessible through it; move relevant app-level settings access to Profile → Settings and relocate other actions to appropriate redesigned locations.
- Preserve back-dismiss, outside-tap, accessibility, and state restoration behavior.

### J. Icon selection / app icon settings
- Remove obsolete BitChord icon options from the icon-changing UI.
- Show only approved MusoPhone icon choices.
- Preserve icon-changing behavior if supported by the app/launcher.
- Validate adaptive icon foreground/background and legacy launcher icon assets.
- Do not remove the phone's required icon background/mask behavior accidentally.

## 2.4 Shared component inventory

Create a component inventory before coding. At minimum include:
- App header / profile entry
- Bottom navigation
- Mini-player
- Track row
- Album card
- Artist card
- Playlist card
- Recommendation/featured card
- Section heading
- Search field
- Filter/chip
- Buttons and icon buttons
- Sliders and toggles
- Dialogs and bottom sheets
- Loading skeletons
- Empty states
- Error states
- Toast/snackbar
- Theme preview card

Each component must have defined default, pressed, focused, selected, disabled, loading, and error states where relevant.

## 2.5 Visual originality acceptance test

A screen is not considered redesigned if it only changes colors, icon tint, corner radius, or background. It must have a visibly new layout/composition and coherent MusoPhone styling. Compare screenshots side-by-side with the existing build and upstream BitChord; document major layout/component differences.
