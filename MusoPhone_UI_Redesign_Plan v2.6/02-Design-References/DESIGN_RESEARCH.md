# Design Research and External References

These references were researched to inform the redesign. They are inspiration and implementation guidance—not permission to copy another product's UI. The final visual identity must be original to MusoPhone.

## A. Music-app visual inspiration

### 1. SONE — Premium Music Streaming App UI/UX
https://dribbble.com/shots/27716433-SONE-Premium-Music-Streaming-App-UI-UX-Experience

Why it is useful:
- Cohesive multi-screen dark visual system.
- Artwork-led presentation.
- Typography and atmospheric treatment.
- Consider how Home, Now Playing and Artist Profile belong to one product.

What to learn:
- Consistent hierarchy across screens.
- Artwork is the focal point, while controls remain quiet.
- Color and gradient use should be restrained and intentional.

Do not copy:
- Exact layout, colors, card arrangement or component styling.

### 2. SONORA — Music & Audio Streaming Mobile App
https://dribbble.com/shots/27743435-SONORA-Music-Audio-Streaming-Mobile-App-UI-UX-Design

Why it is useful:
- Music-focused dark interface.
- Dynamic lyrics and player context.
- Discovery, artist and player experience presented as one system.

What to learn:
- Lyrics can be integrated into a player without competing with transport controls.
- Artwork and metadata should be balanced.
- Discovery cards need clear content hierarchy.

### 3. Music App UI Design — Param Vekariya
https://dribbble.com/shots/27313503-Music-App-UI-Design

Why it is useful:
- Home, Now Playing and Artist Profile are shown together.
- Clear player control grouping.
- Artwork-derived ambient color as a visual technique.

What to learn:
- Maintain one hierarchy from artwork to metadata to playback controls.
- Use ambient color to add depth without sacrificing contrast.

### 4. Dribbble music mobile UI collection
https://dribbble.com/search/music-mobile-app-ui

Use it to explore:
- Different Now Playing compositions.
- Compact library and collection patterns.
- Editorial discovery layouts.
- Minimal player control arrangements.

### 5. Dribbble music streaming UI collection
https://dribbble.com/search/music-streaming-app-ui

Use it to compare:
- Card-heavy vs editorial layouts.
- Artwork sizes.
- Player controls.
- Navigation density.

**Important:** Dribbble concepts are visual inspiration, not tested UX specifications. Validate all decisions against MusoPhone's actual features, Android behavior and device testing.

## B. Official Android design and implementation guidance

### 6. Adaptive layouts — Android Developers
https://developer.android.com/design/ui/mobile/guides/layout-and-content/adapt-layout

Key guidance:
- Design for window size classes, not only one phone screenshot.
- Use reflow, reveal and presentation changes as space changes.
- Media player controls should reflow and content can be revealed/adjusted on smaller surfaces.
- Avoid fixed layouts that break on resized windows.

Apply to MusoPhone:
- Player artwork size must respond to available height.
- Grids must adapt to width.
- Header and content spacing must not assume one device size.

### 7. Adaptive Material guidance codelab
https://developer.android.com/codelabs/adaptive-material-guidance

Key guidance:
- Use compact, medium and expanded window classes.
- Avoid rigid fixed dimensions.
- Use spacing, columns and panes to organize content.
- Preserve readable line lengths.

Apply to MusoPhone:
- Build responsive layout rules for Library, Explore and Search.
- Avoid clipped carousels and oversized content on larger windows.

### 8. Adaptive optimized app quality
https://developer.android.com/docs/quality-guidelines/adaptive-app-quality/tier-2

Key guidance:
- Adapt to display sizes and device states.
- Use responsive layouts and appropriate navigation patterns.
- Support layout changes as device/window state changes.

Apply to MusoPhone:
- Include short/tall screen checks.
- Verify expanded window behavior where supported.

### 9. Material 3 in Jetpack Compose
https://developer.android.com/develop/ui/compose/designsystems/material3

Key guidance:
- Theme is built from color scheme, typography and shapes.
- Material 3 Expressive expands the system with motion and component guidance.
- A custom design system can be built on Compose.

Apply to MusoPhone:
- Centralize semantic color, typography and shape tokens.
- Preserve existing accent customization.
- Use Material 3 concepts without making MusoPhone look like a default Material template.

### 10. Compose animation modifiers and composables
https://developer.android.com/develop/ui/compose/animation/composables-modifiers

Key guidance:
- Use AnimatedVisibility, AnimatedContent, Crossfade and animateContentSize for appropriate state changes.
- Animate appearance/disappearance and layout changes intentionally.

Apply to MusoPhone:
- Animate page/state transitions consistently.
- Avoid custom animation code when a stable built-in API already solves the problem.

### 11. Android animation overview
https://developer.android.com/develop/ui/views/animations/overview

Key guidance:
- Motion communicates state and gives feedback.
- Physics-based movement can feel more natural when appropriate.
- Avoid abrupt or arbitrary movement.

Apply to MusoPhone:
- Play/pause icon transformation, sheet movement and content changes should feel coherent.
- Motion must never delay core interactions.

## C. Research synthesis — what MusoPhone should take from these sources

1. Build a cohesive multi-screen design system rather than copying one screenshot.
2. Treat the player as a responsive composition whose artwork scales to available space.
3. Keep lyrics, timeline and transport controls in a clear hierarchy.
4. Use editorial content hierarchy on Home and Explore.
5. Make Library data dense enough to be useful without creating a wall of cards.
6. Make search compact and query-first.
7. Use semantic tokens for color, typography and shapes.
8. Use purposeful transitions and reduced-motion support.
9. Test on real Android screen sizes; visual concepts alone do not prove usability.
10. Preserve MusoPhone's own identity and all existing functional behavior.
