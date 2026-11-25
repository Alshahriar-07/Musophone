# MusoPhone — Brand Assets

The official visual assets and branding resources for **MusoPhone**. This
folder is the source of truth for the app icon, the wordmark and the
promotional banners.

## Files

| File | Format | Size | Purpose |
|---|---|---|---|
| `icon.png` | PNG | 1024 × 1024 | Primary application icon |
| `icon.ico` | ICO | multi-size | Windows executable and installer icon |
| `logo.png` | PNG | 2172 × 724 | Horizontal lockup: icon and wordmark |
| `MusoPhoneBanner.png` | PNG | 1672 × 941 | Promotional banner, light wordmark on black |
| `Musophone Dark Audio Wave Banner.png` | PNG | 1672 × 941 | Promotional banner with the audio-wave treatment |

The web app's derived, optimised copies live with the site so they ship with
it: `web/app/public/favicon.svg` (the waveform-M tile), `icon-192.png`,
`icon-512.png`, `apple-touch-icon.png`, and the 1200 × 630 social card
`og-image.png`. Regenerate the raster icons with
`corepack pnpm --dir web/extension icons` and the social card from
`web/scripts/brand/og-image.html`.

## Brand identity

MusoPhone is minimal, premium and AMOLED-first.

- **Background:** true black (`#000000`) and neutral charcoal surfaces
- **Foreground:** near-white (`#f7f7f9`)
- **Accent:** crimson (`#ff4d67` dark, `#c2173a` light)
- **Type:** DM Sans
- **Symbol:** an M drawn as one continuous waveform stroke
- **Style:** flat, quiet and high-contrast; no gradients on the mark, no
  decorative effects beyond the accent light

## Usage

### Application icon

Use `icon.png` for application interfaces, previews and store listings, and
`icon.ico` for Windows executables, installers and shortcuts.

### Logo

Use `logo.png` for the about section, website header, splash screens and
documentation. Keep clear space around the lockup equal to the height of the
icon, and never place the wordmark on a busy image without a dark scrim.

### Banner

Use either banner for landing-page heroes, promotional material, project
presentations and repository previews. The 1200 × 630 social card is
`web/app/public/og-image.png`; the banners here are high-resolution originals
for other placements.

## Guidelines

1. Do not redesign or modify the brand symbol.
2. Preserve the original aspect ratio when resizing.
3. Avoid stretching or distorting any asset.
4. Maintain sufficient contrast against the background.
5. Prefer transparent backgrounds where the asset supports them.
6. Keep the original filenames unchanged.

---

**MusoPhone** · *Play · Listen · Enjoy*
