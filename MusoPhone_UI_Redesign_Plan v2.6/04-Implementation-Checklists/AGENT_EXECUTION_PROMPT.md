# Implementation Prompt — MusoPhone Complete Redesign

You are working on the existing MusoPhone Android project.

The current baseline is v2.5. Read every file in this plan pack and inspect every screenshot in `03-Screenshot-References/` before editing.

## Mission

Completely redesign and optimize the visual UI of the entire MusoPhone app. The old page designs must be fully replaced, not merely recolored or polished. Create an original, premium, coherent MusoPhone identity across Home, Player, Library, Explore, Search, Profile and Settings.

The player is the highest priority, followed by Home and Library.

## Required workflow

1. Audit the source architecture and current v2.5 implementation.
2. Map screenshot defects to actual composables and shared components.
3. Identify all state sources, event handlers, routes and dependencies.
4. Report the audit findings and implementation plan.
5. Establish shared design tokens for spacing, typography, color roles, shapes, icons and motion.
6. Rebuild page compositions according to `PAGE_BY_PAGE_SPEC.md`.
7. Preserve existing functionality according to `FUNCTIONAL_PRESERVATION.md`.
8. Use `DESIGN_RESEARCH.md` as inspiration and technical guidance. Do not copy reference designs.
9. Run tests/build and complete `QA_ACCEPTANCE_CHECKLIST.md`.
10. Capture and inspect emulator/device screenshots if a device is available.
11. Update documentation and release metadata.
12. Build the requested production APK in a new v2.6 release folder, preserving all old releases.

## Strict rules

- Old visual designs must be fully replaced.
- Do not copy BitChord layouts, icons, compositions or visual assets.
- Keep legally required license and attribution notices.
- Do not introduce mock data or static fake controls.
- Do not rewrite playback/backend/database/API systems for cosmetic work.
- Do not remove working features.
- Do not add dependencies unless necessary and justified.
- Do not duplicate Shuffle/Repeat actions.
- Preserve existing accent customization; never hardcode a replacement accent.
- Fix excessive empty space, incorrect insets, clipped carousels, oversized headers and mini-player/navigation collisions.
- Keep artwork aspect ratios correct.
- Keep lyrics immediately above the player timeline.
- Design short-height and tall-screen layouts.
- Respect accessibility and reduced-motion settings.
- Do not claim visual/device verification unless it was actually performed.

## Release target

Use v2.6 as the planned target unless repository metadata or the project owner specifies otherwise. Inspect all version sources before editing. Update README.md, RELEASEINFO.md and release notes. Build a new APK in a dedicated versioned directory. Never overwrite or delete historical APKs.

## Final report must include

- Screens redesigned.
- Shared components redesigned.
- Functional checks performed.
- Tests/build commands and results.
- Device/emulator and screenshot verification status.
- Known remaining issues.
- Documentation/version files changed.
- Exact APK path and file size.
