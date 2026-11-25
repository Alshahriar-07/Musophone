# 7. Copy-Paste Developer / Coding-Agent Prompt

You are working on the existing MusoPhone Android music player repository. Implement the complete **MusoPhone v2.1 redesign and stability update** using the project plan in this ZIP.

## Main mission

Redesign **every page and every UI element** so the app has a distinct MusoPhone identity and no longer looks like a BitChord reskin. Preserve all existing functionality. Also investigate and fix the critical Android issue where **“Package Installer keeps stopping”** on many phones.

## First: inspect, do not guess

Before modifying files:
1. Inspect the whole repository and identify its actual framework, architecture, build system, modules, and UI toolkit.
2. Build/run the current version and record baseline behavior.
3. Inventory every screen, route, dialog, sheet, setting, menu action, and feature.
4. Inspect manifest, package IDs, namespace, version fields, Gradle/build configuration, SDK levels, signing, APK splits, ABI/native libraries, and release scripts.
5. Do not assume the package installer root cause. Gather APK inspection results, ADB install output, and logcat if available.
6. Write a concise audit report and implementation checklist before large changes.

## Absolute functionality-preservation requirement

Every page may be redesigned, but **no existing functionality may break**. Preserve Google authentication, login/session handling, music playback, queue, controls, background playback, notification/media controls, search, library, data loading, downloads, settings, and any other feature actually present in the repository.

Do not replace real data with mock data. Do not remove a feature just because it is not shown in the supplied screenshot. Keep business logic, services, repositories, APIs, playback engine, and data models stable wherever possible. Prefer presentation-layer changes. If a behavior must change, explain why and test it.

## Required navigation changes

- Remove Radio from the bottom navigation.
- New bottom navigation has exactly four tabs, in this order: Home, Explore, Library, Search.
- Completely redesign the bottom bar as a premium floating glassmorphism component.
- Remove the old menu button from every page.
- Audit all old menu actions and relocate them to appropriate new UI locations so functionality is not lost.
- Profile page Settings button must open **App Settings**, not Profile Settings.
- Preserve profile-specific settings as a separate feature only if they already exist and are genuinely needed.

## Required visual redesign

Redesign every screen, not just Home:
- Home
- Explore
- Library
- Search
- Full player / Now Playing
- Mini-player
- App Settings
- Profile refinements
- All track/album/artist/playlist detail pages
- All dialogs, sheets, popups, menus, loading states, empty states, and error states
- Icon selection UI

Do not merely recolor old BitChord components. Change layout/composition, hierarchy, component shapes, spacing, typography, iconography, interactions, and motion. Remove old BitChord icon options from the icon-changing UI and use MusoPhone-approved icon assets.

The current profile page's top area and overall page direction are considered acceptable by the owner. Do not unnecessarily redesign that area; correct its Settings action and maintain visual consistency.

## Theme system

Add eight selectable accent themes:
1. Monochrome
2. Aesthetic Orange
3. Ocean Blue
4. Midnight Purple
5. Sakura Pink
6. Emerald Green
7. Crimson Red
8. Sunset Amber

All themes share one premium glassmorphism foundation. Only the accent palette and coordinated tints/highlights change. Implement centralized theme tokens; do not scatter hard-coded colors. Theme changes must apply immediately across all screens and persist after restart. Verify contrast and readability.

## Package Installer crash — P0

Investigate the reported “Package Installer keeps stopping” issue. Do not claim it fixed without proof. Inspect:
- APK integrity and SHA-256.
- APK metadata and package ID.
- `apksigner` verification and signing certificates.
- versionCode/versionName.
- min/target/compile SDK.
- manifest merge and provider authorities.
- exported components and permissions.
- ABI/native library packaging and split APK behavior.
- fresh install versus update install.
- ADB install error output and logcat on affected devices.
- compatibility across Android versions/OEMs.

Find the actual root cause, implement the narrowest safe correction, then test the exact final signed artifact. Preserve update compatibility and never change production package ID or signing identity casually. Never commit keystore secrets.

## Release handling

- Target version: v2.1, following the repository's actual versioning convention.
- Keep all previous APKs; do not delete or overwrite old release artifacts.
- Create a new version-specific output folder for v2.1.
- Build properly signed release APK; build AAB if the project supports/requires it.
- Verify checksum, signature, metadata, fresh install, and update install.
- Include release notes and build manifest.

## Working method

- Work in small, logical stages and commits.
- Do not perform a risky all-at-once rewrite.
- Run the project's relevant tests/build after each major stage.
- Do not suppress errors or weaken security to make tests pass.
- If a feature cannot be verified due to missing credentials/device/API access, report it clearly instead of pretending it passed.
- Do not stop after writing a plan: implement the work in the repository once the audit is complete and the required inputs are available.

## Definition of done

v2.1 is complete only when:
1. Every existing page/component has a distinct new MusoPhone design.
2. No old global menu button remains.
3. Bottom navigation contains exactly Home, Explore, Library, Search.
4. Radio is absent from bottom navigation without accidental deletion of unrelated features.
5. Profile → Settings opens App Settings.
6. All eight themes work globally and persist.
7. All existing functionality passes regression tests.
8. Package Installer crash has an evidence-based fix and no longer reproduces in the agreed device matrix.
9. Final signed APK installs and launches on multiple physical devices.
10. Old release artifacts remain intact and v2.1 artifacts are stored in a new folder.
