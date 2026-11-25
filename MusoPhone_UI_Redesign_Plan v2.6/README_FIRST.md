# MusoPhone — Complete UI Redesign Plan Pack

**Current baseline:** MusoPhone v2.5  
**Planned target:** v2.6 (unless the project owner changes the release number)  
**Scope:** Full visual redesign and UX/layout optimization of the Android application.  
**Build expectation:** APK build is part of the implementation/release task, not this planning pack.

## Start here

1. Copy the screenshots you shared in ChatGPT into `03-Screenshot-References/`.
2. Keep the filenames descriptive, for example:
   - `01-home-current.png`
   - `02-player-current.png`
   - `03-library-current.png`
   - `04-profile-current.png`
   - `05-search-current.png`
   - `06-settings-current.png`
   - `07-explore-current.png`
   - `08-player-playing-state.png`
   - `09-player-paused-state.png`
3. Give the whole folder to the coding agent together with the project repository.
4. Tell the agent to read `01-Project-Plan/MASTER_PLAN.md` first, then all other Markdown files.
5. The screenshots are **problem evidence**, not a design to copy. The new design must be original.

## What this pack contains

- `01-Project-Plan/MASTER_PLAN.md` — full vision, problems, target, scope and implementation sequence.
- `01-Project-Plan/PAGE_BY_PAGE_SPEC.md` — detailed requirements for every screen.
- `01-Project-Plan/DESIGN_SYSTEM_SPEC.md` — design tokens, spacing, type, color, shape, icon and motion rules.
- `01-Project-Plan/FUNCTIONAL_PRESERVATION.md` — features and state that must not break.
- `02-Design-References/DESIGN_RESEARCH.md` — researched visual references and official Android guidance.
- `03-Screenshot-References/README.md` — how to add and interpret screenshots.
- `04-Implementation-Checklists/QA_ACCEPTANCE_CHECKLIST.md` — release gates and test checklist.
- `04-Implementation-Checklists/AGENT_EXECUTION_PROMPT.md` — ready-to-use implementation instruction.

## Important

Do not assume the current v2.5 implementation is correct just because it compiles. The target is a genuinely redesigned, visually coherent application with working features. Do not delete historical release artifacts. Do not claim emulator/device verification unless it was actually performed.
