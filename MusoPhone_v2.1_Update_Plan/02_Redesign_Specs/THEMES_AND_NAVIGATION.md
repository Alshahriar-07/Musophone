# 3. Navigation & Theme Specification

## 3.1 New bottom navigation

Remove **Radio** from the bottom navigation.

Required tabs and order:
1. Home
2. Explore
3. Library
4. Search

The Radio tab must no longer appear in the bottom bar. Before removing its entry, inspect whether Radio has other routes, playback services, or features. Do not delete underlying radio functionality or code merely because the bottom navigation entry is removed. If the app owner intends the entire Radio feature to be removed later, that requires a separate explicit decision.

### New navigation appearance
- Distinct floating glass panel.
- Four evenly spaced destinations.
- Custom vector icons with consistent stroke/weight.
- Clearly visible active destination.
- Theme-aware accent indicator.
- Smooth, short selection transition.
- Proper bottom inset handling.
- No visual overlap with mini-player or system gesture area.
- Correct selected tab restoration after process recreation/deep link/back navigation.

### Navigation behavior tests
- Tap each tab repeatedly.
- Navigate into nested screens and press Back.
- Open a track from each applicable page.
- Confirm mini-player remains available and synchronized.
- Rotate/recreate process if supported.
- Open app through notification/deep link and verify selected destination.
- Confirm Radio is absent from the bar and other routes still behave as intended.

## 3.2 Old menu button removal and settings route

- Remove old menu button from every screen/header.
- Search the full repository for the old menu component, route, icon, and callbacks.
- Preserve any useful actions that menu exposed.
- Profile → Settings must open **App Settings**.
- Avoid confusing Profile Settings with App Settings.
- Confirm App Settings can be reached from the Profile page on every supported account state.
- Ensure guest/logged-out users can still access app-level settings if that was previously possible.

## 3.3 Eight accent themes

All themes share the same glassmorphism component system. Only the accent palette and carefully coordinated tint/highlight values vary.

1. **Monochrome** — neutral white/gray/black.
2. **Aesthetic Orange** — warm orange/coral.
3. **Ocean Blue** — light/sky blue.
4. **Midnight Purple** — violet/purple.
5. **Sakura Pink** — soft pink.
6. **Emerald Green** — emerald/teal green.
7. **Crimson Red** — deep red/rose.
8. **Sunset Amber** — amber/gold.

## 3.4 Theme implementation requirements

Use a centralized theme/token system, not scattered hard-coded colors.

Tokens should cover:
- Accent primary / accent secondary.
- Accent foreground/on-accent.
- Background.
- Glass surface levels.
- Glass border/stroke.
- Primary and secondary text.
- Muted text.
- Divider.
- Selected/pressed/disabled states.
- Error/success/warning states (these should remain semantically clear and not be overwritten by the accent).

### Theme behavior
- Theme selection updates the entire app immediately.
- Theme persists across app restarts.
- Theme applies consistently to every page, player, mini-player, navigation, dialog, sheet, slider, toggle, and settings screen.
- Theme preview must represent the actual palette.
- No screen should remain stuck in the old accent.
- Text contrast and readability must be checked for every theme.
- Use system dark/light mode only if the existing app supports it; do not invent a new appearance mode without confirming requirements.

### Theme acceptance
- Switch through all eight themes while on Home, Player, Search, Library, and Settings.
- Restart app after selecting each theme.
- Confirm no crash, flash of wrong theme, or lost preference.
- Capture screenshots for all themes on at least one reference device.
