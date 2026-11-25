# Screenshot References — Add the Current v2.5 Screenshots Here

Copy the screenshots you shared in the conversation into this folder. The coding agent must inspect them before implementation.

Recommended filenames:
- `01-home-current.png`
- `02-player-current.png`
- `03-library-current.png`
- `04-profile-current.png`
- `05-search-current.png`
- `06-settings-current.png`
- `07-explore-current.png`
- `08-player-playing-state.png`
- `09-player-paused-state.png`

If you have more screenshots, include them too. Do not overwrite one screenshot with another.

## How the agent must use these screenshots

- Treat them as evidence of the current v2.5 defects.
- Identify the specific layout/component causing each issue.
- Record which issues are shared across pages.
- Do not treat the screenshots as the target design.
- Do not reproduce the old BitChord appearance.
- Build a new MusoPhone composition informed by the design research and the actual feature set.

## Screenshot capture recommendations for final QA

Capture at least:
- Home at initial scroll position.
- Player while playing.
- Player while paused.
- Player with lyrics expanded.
- Player with lyrics unavailable.
- Library with category rail and carousel.
- Explore.
- Search with keyboard hidden.
- Search with keyboard visible.
- Profile.
- Settings.
- One short-height device layout and one tall-device layout if available.

Use the same device/resolution for before/after comparisons where possible.
