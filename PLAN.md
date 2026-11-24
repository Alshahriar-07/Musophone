# MusoPhone — Complete Development Plan

## 1. Project Overview

MusoPhone is an Android music player application built directly from the original BitChord open-source repository.

The objective is to create a fully functional MusoPhone application by preserving the original BitChord source code, frontend, backend, architecture, functionality, and user experience.

This is a branding customization project, NOT a redesign or redevelopment project.

### Core Principle

**100% Original BitChord Functionality + MusoPhone Branding**

Only branding-related modifications are permitted unless a build-breaking issue requires a minimal fix.

---

## 2. Project Structure

Existing project:

- `BitChord/` — Original cloned Git repository.
- `assets/` — Custom MusoPhone branding assets.
- `PLAN.md` — This development plan.

All development must happen inside the existing BitChord project directory.

Do not create an unnecessary second application or duplicate the entire repository.

---

## 3. Branding Configuration

Replace the original application branding with:

- Application Name: MusoPhone
- Brand Name: MusoPhone
- Application Icon: Custom asset from assets folder.
- Splash Screen Branding: MusoPhone, where applicable.
- Application Display Name: MusoPhone.
- Launcher Branding: MusoPhone.

Search the entire project for original application branding.

Update branding in all relevant locations, including:

- Android application label.
- Launcher icons.
- Adaptive icons.
- Splash screen.
- Application metadata.
- UI branding references.
- Notification branding, where applicable.
- Build configuration.
- README and project descriptions, where appropriate.
- Installer and release metadata.

Do not blindly replace every occurrence of the original project name.

Preserve:
- Original copyright notices.
- Original developer attribution.
- Original license information.
- Historical Git information.
- Third-party attribution.

---

## 4. Frontend Preservation

IMPORTANT: Preserve the original BitChord frontend exactly.

Do not redesign the application.

Do not change:
- Existing layouts.
- Navigation structure.
- Screen hierarchy.
- Player interface.
- Music library interface.
- Album layouts.
- Playlist layouts.
- Search interface.
- Settings interface.
- Animations.
- Transitions.
- Existing colors and themes.
- Typography.
- Component structures.
- Interaction patterns.

Only replace branding-related visual assets and text.

The application should look and behave like the original BitChord application, with MusoPhone branding.

---

## 5. Backend Preservation

Preserve the complete original backend implementation.

Do not rewrite, replace, simplify, or remove existing backend functionality.

Preserve all existing systems, including:

- Music playback engine.
- Audio processing.
- Audio session management.
- Media controls.
- Background playback.
- Playback service.
- Notification service.
- Media session integration.
- Music metadata processing.
- Local music scanning.
- Storage access.
- Playlist management.
- Favorites.
- Search functionality.
- Queue management.
- Playback history.
- Lyrics functionality.
- Streaming integrations.
- API integrations.
- Authentication systems, if present.
- Network services.
- Caching systems.
- Database implementation.
- Preferences and settings storage.

All original functionality must remain operational.

---

## 6. Dependencies and Architecture

Keep the original technology stack.

Preserve:
- Programming languages.
- Frameworks.
- Libraries.
- Dependency versions.
- Build tools.
- Project architecture.
- Existing modules.
- Existing services.
- Existing database structure.

Do not upgrade dependencies without a technical requirement.

Do not introduce unnecessary new dependencies.

Do not migrate the application to another framework.

---

## 7. Application Identity

Configure MusoPhone as an independently identifiable Android application.

Inspect the original application ID and determine an appropriate unique application ID for MusoPhone.

Update related configuration carefully.

Check:
- Android application ID.
- Namespace.
- Manifest references.
- Deep links.
- OAuth redirect configurations.
- Firebase configuration, if applicable.
- Provider authorities.
- Notification channels.
- Database migration implications.

Do not break existing integrations when changing application identity.

---

## 8. Assets Integration

Inspect the existing `assets/` directory before modifying anything.

Identify all available:
- Application icons.
- Adaptive icons.
- Splash screen assets.
- Logos.
- Branding images.

Use the appropriate assets in the original Android resource locations.

Requirements:
- Correct Android icon dimensions.
- Correct adaptive icon configuration.
- Transparent backgrounds where intended.
- No unnecessary backgrounds.
- No distorted images.
- No stretched logos.

Do not invent replacement assets if the required asset already exists.

---

## 9. GPL-3.0 Compliance

The original project is distributed under GPL-3.0.

Maintain GPL-3.0 compliance.

Requirements:

1. Preserve the original LICENSE file.
2. Preserve original copyright notices.
3. Preserve required attribution.
4. Clearly identify MusoPhone as a modified version.
5. Document branding modifications.
6. Include corresponding source code when distributing binaries under GPL-3.0.
7. Preserve applicable third-party licenses and notices.

Do not claim ownership of the original BitChord source code.

MusoPhone branding must remain distinct from the original project's trademarks.

---

## 10. Development Workflow

Follow these stages in order.

### Phase 1 — Repository Inspection

- Inspect the complete repository.
- Identify the Android application module.
- Identify the frontend architecture.
- Identify backend architecture.
- Locate all branding references.
- Inspect build configuration.
- Inspect existing assets.
- Verify the license.
- Identify external integrations.

Do not modify files during initial inspection.

### Phase 2 — Branding Replacement

- Replace application display name.
- Replace launcher icons.
- Configure adaptive icons.
- Update splash branding.
- Update relevant metadata.
- Update branding references.
- Preserve original UI and functionality.

### Phase 3 — Application Identity

- Configure unique application ID.
- Update namespace where necessary.
- Check integrations.
- Verify manifest configuration.
- Verify application installation identity.

### Phase 4 — Build Configuration

- Inspect Gradle configuration.
- Verify SDK requirements.
- Verify dependency resolution.
- Configure MusoPhone release naming.
- Prepare debug and release builds.

### Phase 5 — Testing

Verify the following:

- Application launches successfully.
- Application icon displays correctly.
- Application name displays correctly.
- Music scanning works.
- Music playback works.
- Background playback works.
- Notifications work.
- Media controls work.
- Playlists work.
- Search works.
- Favorites work.
- Settings work.
- Streaming integrations work, where configured.
- No original functionality is accidentally broken.

Compare the modified application against the original BitChord application.

The only intended differences should be branding and unavoidable application identity configuration.

### Phase 6 — Release Build

Generate:

- MusoPhone Debug APK.
- MusoPhone Release APK.
- MusoPhone Release AAB.

Verify:
- APK installation.
- Package identity.
- Application name.
- Application icon.
- Release build stability.

---

## 11. Strict Development Rules

These rules are mandatory.

1. Do not redesign the original application.
2. Do not remove existing features.
3. Do not rewrite the backend.
4. Do not replace the original frontend.
5. Do not change the original architecture.
6. Do not upgrade dependencies unnecessarily.
7. Do not introduce unnecessary features.
8. Do not modify unrelated business logic.
9. Do not remove existing integrations.
10. Do not remove original copyright notices.
11. Do not replace the GPL-3.0 license.
12. Do not create fake implementations for existing functionality.
13. Do not claim a feature works without testing it.
14. Do not perform unnecessary code refactoring.
15. Preserve original functionality as closely as possible.

If an issue is discovered, investigate its root cause before making any modifications.

---

## 12. Final Deliverables

The completed project must provide:

- Fully functional MusoPhone Android application.
- Original BitChord functionality preserved.
- MusoPhone application name.
- MusoPhone application icon.
- MusoPhone splash branding.
- Unique application identity.
- GPL-3.0 compliant source code.
- Debug APK.
- Release APK.
- Release AAB.
- Build instructions.
- Updated project documentation.

---

## Final Objective

MusoPhone must remain functionally identical to the original BitChord application.

The application should retain its original frontend, backend, architecture, features, integrations, and user experience.

Only the application branding and the minimum configuration required for an independent application identity should change.

**MusoPhone = BitChord Source Code + MusoPhone Branding.**

No unnecessary redesign. No unnecessary redevelopment. No unnecessary feature changes.