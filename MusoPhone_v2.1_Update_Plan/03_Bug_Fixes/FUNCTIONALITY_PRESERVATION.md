# 5. Functionality Preservation & Regression Protection

## 5.1 Core rule

Every page can be redesigned, but no existing functionality may break. Before editing, create a feature inventory from the current repository and running app. Map each feature to its new screen/component and test it after the redesign.

## 5.2 Protected feature groups

Verify the actual repository implementation for each item; mark N/A only with evidence.

### Account and authentication
- Google sign-in.
- Login/logout.
- Session persistence.
- Token refresh / expired-session behavior.
- Profile/avatar/name display.
- Guest or logged-out behavior if supported.

### Music playback
- Play/pause.
- Next/previous.
- Seek/progress.
- Queue.
- Shuffle/repeat.
- Favorite/like.
- Background playback.
- Audio focus and interruptions.
- Notification/media controls.
- Lock-screen controls.
- Headset/Bluetooth controls.
- Audio output selection if supported.
- Lyrics/equalizer/sleep timer only if currently implemented.

### Music content and library
- Search.
- Recommendations.
- Recent tracks.
- Albums/artists/playlists.
- Saved songs.
- Library categories.
- History.
- Downloads/offline playback if supported.
- Sort/filter.
- Add/remove from library.
- Track/album/artist detail destinations.

### App/system behavior
- Navigation/back stack.
- Deep links.
- App lifecycle and process recreation.
- Permissions.
- Cache/storage actions.
- Theme persistence.
- App icon switching if supported.
- Network/offline/loading/error states.

## 5.3 Safe architecture approach

- Identify the current architecture and state-management approach.
- Keep repositories, services, playback engine, authentication layer, data models, and API clients stable unless a verified bug requires changes.
- Prefer presentation-layer refactoring and reusable design-system components.
- Keep navigation destinations and action handlers connected to their existing implementations.
- Do not replace real data with demo/mock data.
- Do not hard-code user profile or listening statistics.
- Avoid broad refactors mixed with visual redesign; separate commits by scope.
- Add or preserve automated tests around critical behavior before changing screens.

## 5.4 Regression evidence

For every redesigned screen, record:
- Existing behavior.
- New UI destination.
- Actions and callbacks preserved.
- Data/state source.
- Tests performed.
- Screenshot before/after.
- Any known limitation.

A visual redesign is incomplete if its controls look correct but no longer perform their original action.
