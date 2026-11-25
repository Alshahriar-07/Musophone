# 1. Current Project Status & Known Problems

## 1.1 Known working areas (reported by the project owner)

The owner previously reported that the app's core experience was working well, including:
- Music player and playback controls.
- Google authentication / login flow.
- Login/session experience.
- Main app functionality after the BitChord-to-MusoPhone migration.
- App branding and initial MusoPhone identity work.
- A new app icon was prepared and integrated.
- A profile area is now visible in the current UI screenshot.

These are owner-reported observations, not a substitute for repository inspection or device test evidence. Record the exact implementation and test coverage before changing anything.

## 1.2 Current UI problems

1. **The app still looks too much like BitChord.** Many UI elements are visually identical or strongly similar to the upstream app.
2. The redesign so far is not comprehensive. The owner wants every page and component redesigned, not only the home page or colors.
3. The bottom navigation still follows the old visual design.
4. The current bottom navigation contains **Radio**, which must be removed from the bottom bar.
5. The old menu button is still present and looks inconsistent with the new profile/header design.
6. The old menu button's app-settings functionality must not be lost when the button is removed.
7. The Profile page's Settings button currently opens **Profile Settings**, but the required behavior is to open **App Settings**. Preserve profile-specific settings elsewhere if they are real features; do not silently discard them.
8. Existing BitChord icon choices remain in the icon-changing option and must be audited/replaced with MusoPhone-appropriate choices.
9. The current UI needs a consistent visual language across every screen, sheet, dialog, popup, and player state.

## 1.3 Critical installation problem

The owner reports that on many phones, Android displays:

**“Package Installer keeps stopping”**

This is a release-blocking issue for v2.1. The cause is currently unknown. It must be investigated from actual APKs, Android logs, package metadata, signing configuration, manifest, SDK levels, and affected devices. Do not assume that signing alone is the cause.

Possible diagnostic areas—not confirmed causes:
- Invalid, corrupted, truncated, or incorrectly packaged APK.
- APK signing or signature-scheme compatibility problem.
- Inconsistent signing certificates between installed and update APKs.
- Incorrect ABI/native library packaging or split APK delivery.
- Manifest, provider, permission, exported-component, or intent-filter issues.
- Unsupported `minSdkVersion`, target SDK behavior, or Android-version-specific installer behavior.
- Duplicate/conflicting package IDs or malformed version metadata.
- Storage/download corruption or an APK generated/copied incorrectly.
- Device-specific Android installer/OEM behavior.

## 1.4 Previously reported release/build state

Earlier project discussion reported:
- Debug APK builds were possible.
- A release APK was unsigned at that time.
- Installation problems occurred on physical Android devices.
- Package IDs discussed:
  - Production: `com.musophone.player`
  - Development: `com.dev.musophone.player`
- An internal/legacy namespace was reported as `com.music.bitchord`.

These details must be verified against the current repository before use. Do not change `applicationId`, namespace, signing identity, or package migration strategy without checking existing users and update compatibility.

## 1.5 v2.1 goals

- Redesign every page and every shared UI component.
- Create a distinctive MusoPhone identity.
- Preserve all existing functionality and data.
- Replace the old bottom navigation with a new glassmorphism navigation.
- Remove Radio from the bottom navigation.
- Remove the old menu button from every page.
- Make Profile → Settings open App Settings.
- Add eight selectable accent themes.
- Keep glassmorphism as the common visual foundation across all themes.
- Fix Package Installer crashes across a meaningful range of Android devices.
- Produce properly signed, validated, installable release artifacts.
- Keep older release APKs; save new builds in a new version-specific folder.

## 1.6 Unknowns that must be investigated

- Exact Android framework and UI toolkit (native Android, Compose, Flutter, React Native, Capacitor, etc.).
- Current app version and versionCode.
- Exact affected phone brands/models and Android versions.
- Whether the crash occurs on fresh install, update install, or both.
- Whether all release APKs fail or only certain build variants.
- Whether APK is universal or split by ABI/density.
- Whether APK is signed, and which signature schemes are enabled.
- Whether the user is installing from a downloaded file, file manager, browser, or app store.
- Whether the app includes native `.so` libraries or content providers.
- Whether the app is being updated over an older BitChord/MusoPhone package.
