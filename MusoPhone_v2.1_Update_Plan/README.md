# MusoPhone v2.1 — Complete Redesign & Stability Update Plan

**Project:** MusoPhone Android music player  
**Target version:** v2.1  
**Plan status:** Development specification / implementation checklist  
**Primary objective:** Redesign every app page and UI component while preserving all existing working functionality. Fix Android installation failures, especially the recurring **“Package Installer keeps stopping”** issue.

---

## Release goal

MusoPhone v2.1 must feel like a distinct, polished music player with its own visual identity—not a BitChord reskin—while retaining the current app's working playback, Google authentication, account/session handling, library data, and other existing capabilities.

### Non-negotiable rule

**Redesign the presentation layer; do not casually rewrite or remove working business logic.** Every existing feature must be inventoried before work begins, mapped to its redesigned UI, and regression-tested after implementation.

## Plan contents

- `01_Project_Overview/PROJECT_STATUS_AND_PROBLEMS.md` — current known state, issues, unknowns, and goals.
- `02_Redesign_Specs/COMPLETE_UI_REDESIGN.md` — page-by-page redesign requirements.
- `02_Redesign_Specs/THEMES_AND_NAVIGATION.md` — four-tab navigation and eight glass themes.
- `03_Bug_Fixes/PACKAGE_INSTALLER_CRASH.md` — diagnostic and fix plan for Android Package Installer crash.
- `03_Bug_Fixes/FUNCTIONALITY_PRESERVATION.md` — feature preservation and regression requirements.
- `04_Implementation/EXECUTION_ROADMAP.md` — staged development plan and acceptance criteria.
- `04_Implementation/DEVELOPER_AGENT_PROMPT.md` — copy-paste implementation prompt for the coding agent.
- `05_QA_Release/TEST_MATRIX.md` — device, feature, install, and regression test matrix.
- `05_QA_Release/RELEASE_CHECKLIST.md` — signing, versioning, APK/AAB, and release requirements.

## Important source-of-truth instruction

This plan records issues explicitly reported in the project conversation. It does **not** claim that the repository has already been inspected. Before editing, the developer/agent must inspect the actual repository, identify the Android framework/build system, read the current manifest and Gradle configuration, inspect existing screens and tests, and update the diagnosis with evidence. Do not assume a particular root cause for the Package Installer crash.
