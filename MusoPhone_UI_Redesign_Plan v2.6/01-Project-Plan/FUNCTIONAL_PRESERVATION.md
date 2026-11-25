# Functional Preservation and Regression Map

## Core rule

Redesign presentation, not the underlying product behavior. Before editing a screen, trace its state source, callbacks, navigation route and dependencies. Reuse the real state and event handlers.

## Playback/player
- Play/pause.
- Previous/next.
- Seek and drag timeline.
- Live playback progress and timestamps.
- Lyrics load, unavailable, expand/collapse and synchronization.
- Romanization modes and original-script restoration.
- Favorite/unfavorite.
- Track overflow actions.
- Queue display and queue edits.
- Shuffle state.
- Repeat modes.
- AutoPlay state.
- Audio output/device selector.
- Artwork loading/fallback.
- Track title and artists.
- Mini-player synchronization.
- Background playback synchronization.
- Media session and headset/keyboard controls if implemented.
- Loading/buffering/error states.

## Home
- All real content sources.
- Top Picks actions.
- Recents.
- Pull-to-refresh.
- Profile navigation.
- Song overflow actions.
- Mini-player and bottom navigation.

## Library
- Categories and filters.
- Playlists, albums, artists, folders and sources.
- Downloads.
- Local music.
- Create/import playlist actions.
- Listening statistics.
- Collection navigation.

## Explore
- Playlist/category navigation.
- Existing discovery actions.
- Real artwork and metadata.

## Search
- Query editing/submission.
- Search source tabs.
- Filters.
- Recent search add/remove/clear.
- Results navigation.
- Keyboard behavior.
- Empty/no-results/loading/error states.

## Profile
- Profile identity and account status.
- Open Replay/history.
- Switch account.
- Account settings.
- Listening statistics and time filters.

## Settings/About
- All existing preferences.
- Accent color selection.
- Playback/download/account settings.
- About links and version.
- Wear OS state/actions if implemented.

## Regression rules
- Never replace a live component with a static mock.
- Never add placeholder data to make a screenshot look full.
- Do not duplicate shuffle/repeat controls unless both are intentionally part of the existing product and share the same state.
- Do not create a second profile route.
- Do not modify APIs, database schemas or playback services for cosmetic reasons.
- If a visual change requires a behavior change, document the reason and isolate it.
