# MusoPhone Original Design System Specification

## 1. Brand principle

Build a distinct MusoPhone visual language. Use external references to learn hierarchy, pacing and interaction patterns—not to reproduce another product screen.

The visual result should be premium, restrained, editorial and music-focused. Avoid generic template styling.

## 2. Color roles

Use semantic roles, not hardcoded colors scattered through composables.

Suggested role groups:
- `background`: deepest page background.
- `surface`: raised neutral surface.
- `surfaceElevated`: dialog/sheet/raised control surface.
- `surfaceSubtle`: low-contrast grouping surface.
- `textPrimary`: high-contrast text.
- `textSecondary`: supporting metadata.
- `textTertiary`: timestamps and low-priority labels.
- `outlineSubtle`: subtle dividers only.
- `accent`: existing user-configured accent.
- `accentContent`: content displayed on accent.
- `error`, `success`, `warning`: semantic status roles.

Rules:
- Preserve existing accent customization.
- Never replace the user's selected accent with a hardcoded brand accent.
- Keep page backgrounds consistently near-black/black.
- Use accent primarily for active, selected, focused and progress states.
- Validate contrast for every supported accent.
- Avoid using blur or transparency as a substitute for a readable surface.

## 3. Typography

Define a deliberate scale:
- Display/hero title: limited to major page headings.
- Page title: strong but compact.
- Section title: clear and moderately weighted.
- Track title: prominent but constrained.
- Artist/metadata: secondary and readable.
- Label/caption: small, letter-spaced only when appropriate.
- Numeric/time: stable width where useful.

Rules:
- Avoid oversized headings that push content below the fold.
- Support long song titles and long artist lists.
- Use ellipsis only when the full value remains accessible through a sensible detail surface.
- Test system font scaling and accessibility.
- Do not use letter spacing excessively.

## 4. Spacing and geometry

Create a shared spacing scale and use it consistently. Suggested base rhythm: 4 dp increments, with named tokens rather than random values.

Define:
- Screen horizontal inset.
- Compact header vertical inset.
- Section gap.
- Row internal padding.
- Grid gutter.
- Artwork-to-metadata gap.
- Mini-player-to-navigation gap.
- Safe-area content padding.

Do not force every page into identical spacing. Use the same scale with page-specific composition.

## 5. Shape language

Use a small, intentional shape family:
- Artwork: consistent rounded square.
- Small controls: circular or compact rounded shape.
- Chips: pill where selection behavior calls for it.
- Large surfaces: moderate corner radius.
- Sheets/dialogs: consistent top corners and elevation.

Do not round every card by default. Shape should communicate grouping and interaction.

## 6. Icon system

- Use one coherent vector icon family or custom MusoPhone vector set.
- Normalize optical size and stroke weight.
- Define standard sizes for navigation, row actions, player controls and small metadata icons.
- Use filled/outlined variants consistently for selected/unselected states.
- Preserve accessibility descriptions and semantics.
- Remove old visual assets only after checking that they are not used by launcher aliases, notifications, widgets or legacy install paths.

## 7. Artwork and ambient depth

- Artwork must preserve aspect ratio and avoid distortion.
- Use a consistent crop strategy for non-square artwork.
- Dynamic ambient color must remain subtle and subordinate to content.
- Fade ambient color into black.
- Avoid high-opacity blur that turns the page muddy.
- Do not render expensive blur continuously during playback if it harms performance.
- Respect Reduce dynamic blur / reduced motion settings if available.

## 8. Motion

Motion should explain state changes and reinforce interaction, not decorate every surface.

Suggested starting ranges (tune after device testing):
- Press feedback: 80–120 ms.
- Small state transition: 120–180 ms.
- Content fade/replace: 160–240 ms.
- Sheet/dialog entrance: 200–280 ms.
- Shared artwork/page transition: 220–320 ms where technically appropriate.

Rules:
- Prefer consistent easing/spring behavior.
- Avoid excessive bounce.
- Avoid animating large blurred layers unnecessarily.
- Do not animate playback progress by maintaining a second independent timer; render the real playback state.
- Respect Android animator/reduced-motion settings.
- Use Compose animation APIs already available in the project before adding dependencies.

## 9. Responsive behavior

Design against available window size, not only a single screenshot dimension.

Support:
- Compact phones.
- Short-height phones.
- Tall phones.
- Different display densities.
- Keyboard-visible search.
- Landscape if app behavior supports it.
- Foldables/tablets/expanded windows where supported.

Use flexible constraints and window-size-aware composition. Avoid fixed heights that cause clipping.

## 10. Performance and accessibility

- Avoid nested scrolling patterns that create gesture conflicts.
- Use stable keys for lists and grids.
- Avoid unnecessary recomposition of artwork/blur surfaces.
- Keep touch targets comfortably usable.
- Provide content descriptions for icon-only actions.
- Preserve screen-reader semantics.
- Maintain readable contrast.
- Ensure focus order makes sense.
- Test large font settings.
