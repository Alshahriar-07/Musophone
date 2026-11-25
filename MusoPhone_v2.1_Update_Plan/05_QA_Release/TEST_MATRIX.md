# 8. v2.1 QA & Regression Test Matrix

Record result as PASS / FAIL / BLOCKED / NOT APPLICABLE, with device/build/evidence.

## 8.1 Installation and package tests

| Test | Expected result |
|---|---|
| APK integrity/checksum | Valid; checksum recorded |
| APK metadata inspection | Correct package/version/SDK metadata |
| APK signature verification | Valid production signature |
| Fresh install on older supported Android | Installs successfully |
| Fresh install on recent Android | Installs successfully |
| Update over previous MusoPhone version | Updates without signature/package error |
| Install via browser download | Installer completes |
| Install via file manager | Installer completes |
| ADB install | Succeeds; no unexplained error |
| App launch after install | Launches without crash |
| Uninstall/reinstall | Clean install works |
| OEM device coverage | No Package Installer crash in available matrix |

## 8.2 Authentication

- Google sign-in success.
- Cancel sign-in.
- Network failure during sign-in.
- Existing session restored after restart.
- Logout.
- Expired/invalid session behavior.
- Profile identity/avatar display.
- Settings access while logged in and logged out, where supported.

## 8.3 Playback

- Start playback from Home.
- Start playback from Explore.
- Start playback from Search.
- Start playback from Library.
- Pause/resume.
- Next/previous.
- Seek.
- Queue behavior.
- Shuffle/repeat.
- Favorite action.
- Open/close full player.
- Mini-player synchronization.
- Background playback after app minimized.
- Notification controls.
- Lock-screen controls.
- Headset/Bluetooth controls.
- Audio focus interruption and recovery.
- Network loss/recovery.
- Track unavailable/error state.

Only test features that exist; record N/A with reason for unsupported features.

## 8.4 Navigation and page coverage

- Home.
- Explore.
- Library.
- Search.
- Profile.
- App Settings.
- Full player.
- Every detail page discovered in repository audit.
- Dialogs/sheets/popups.
- Back navigation and deep links.
- Radio absent from bottom bar.
- Exactly four bottom destinations.
- Old menu button absent from every page.
- All actions previously in old menu remain reachable where appropriate.
- Profile → Settings opens App Settings.

## 8.5 Theme coverage

For each of the eight themes:
- Home.
- Explore.
- Library.
- Search.
- Profile.
- App Settings.
- Full player.
- Mini-player.
- Dialogs/sheets.
- Selected/pressed/disabled states.
- Text contrast.
- Persistence after app restart.

## 8.6 Responsive and performance

- Small phone.
- Standard phone.
- Large phone.
- Display cutout.
- Gesture navigation.
- Three-button navigation if available.
- Large system font.
- Screen reader/content descriptions.
- Dark/bright artwork.
- Long song/artist names.
- Empty and large library.
- Low memory / process recreation.
- Scroll performance.
- Blur/animation GPU cost.
- No clipped content or overlap with mini-player/navigation/system bars.

## 8.7 Evidence

Attach:
- Before/after screenshots.
- Build logs.
- Test device model + Android version.
- ADB install output.
- Sanitized logcat excerpts for failures.
- APK checksum and signature verification output.
- Regression test summary.
