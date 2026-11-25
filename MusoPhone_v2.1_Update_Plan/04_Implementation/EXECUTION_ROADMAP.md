# 6. v2.1 Implementation Roadmap

## Stage 0 — Repository reconnaissance (do not skip)
1. Inspect repository structure, build system, app modules, current branch, and working tree.
2. Identify Android framework/toolkit and UI architecture.
3. Build and run the current app before changes.
4. Record current package IDs, versionName/versionCode, SDK levels, signing setup, manifest, ABI configuration, and release output paths.
5. Inventory every screen, component, route, setting, and user-visible action.
6. Record current baseline screenshots and functionality tests.
7. Reproduce Package Installer crash or collect the affected APK/logs/device details.
8. Create a risk list and agree on any changes that could affect package identity or data.

**Gate:** No redesign coding until baseline and feature inventory are documented.

## Stage 1 — Installer crash investigation (parallel priority)
1. Inspect current debug/release artifacts.
2. Validate APK structure, metadata, signatures, and checksums.
3. Collect ADB install output and logcat from an affected device.
4. Audit manifest, SDK compatibility, package IDs, providers, native libraries, and splits.
5. Identify and fix the evidenced root cause.
6. Produce a signed diagnostic candidate and test fresh/update installation.

**Gate:** Installation issue has a documented diagnosis and repeatable test case. Continue final release validation later.

## Stage 2 — Design system foundation
1. Define typography, spacing, shape, elevation, glass surfaces, icon style, and motion rules.
2. Implement centralized semantic color tokens.
3. Implement the eight theme palettes.
4. Implement shared buttons, cards, rows, chips, dialogs, sheets, sliders, toggles, and empty/loading/error states.
5. Confirm accessibility and performance.

**Gate:** All themes render correctly in a small component showcase.

## Stage 3 — Navigation and app shell
1. Remove Radio from the bottom navigation.
2. Implement four destinations: Home, Explore, Library, Search.
3. Build new floating glass navigation.
4. Remove old menu button from every screen.
5. Audit and relocate old menu actions without losing functionality.
6. Wire Profile → Settings to App Settings.
7. Verify back stack, nested routes, deep links, and mini-player layout.

**Gate:** No old menu button; no Radio bottom tab; all destinations/actions work.

## Stage 4 — Page-by-page redesign
Suggested order:
1. Home.
2. Mini-player.
3. Full-screen player.
4. Explore.
5. Library.
6. Search.
7. App Settings.
8. Profile refinements.
9. All secondary/detail pages found during repository audit.
10. Dialogs, sheets, menus, loading/empty/error states.

After each page:
- Compare behavior with baseline.
- Run relevant regression tests.
- Test all eight themes.
- Capture screenshot.
- Do not proceed with unresolved critical regressions.

**Gate:** Every existing page and shared component is accounted for and redesigned.

## Stage 5 — Theme integration
1. Wire theme picker to persistent local preference.
2. Apply selected palette globally.
3. Verify app cold start and process recreation.
4. Verify all screens, player, navigation, dialogs, and settings.
5. Fix contrast and stale hard-coded colors.

**Gate:** All eight themes pass screen-by-screen verification.

## Stage 6 — Stabilization
1. Run unit, UI, and integration tests available in the project.
2. Test playback during navigation and theme switching.
3. Test login/session behavior.
4. Test offline, error, loading, and empty states.
5. Profile memory/GPU performance on lower-end phones.
6. Fix crashes, layout overflow, and accessibility issues.
7. Verify no unintended behavior changes.

**Gate:** No P0/P1 regression remains.

## Stage 7 — Release
1. Increment version to v2.1 using the repository's existing versioning convention.
2. Confirm stable release signing.
3. Build release APK and AAB if supported/required.
4. Verify signatures, metadata, checksum, and install/update.
5. Test final exact artifact on multiple devices.
6. Keep old APKs; create a new version-specific release folder.
7. Generate release notes and build manifest.
8. Publish only after all release gates pass.
