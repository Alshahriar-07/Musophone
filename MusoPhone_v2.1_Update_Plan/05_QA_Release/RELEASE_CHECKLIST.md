# 9. v2.1 Release Checklist

## Before building
- [ ] Repository audit complete.
- [ ] Feature inventory complete.
- [ ] All pages and components redesigned.
- [ ] Four-tab navigation verified.
- [ ] Radio removed from bottom navigation.
- [ ] Old menu button removed from every page.
- [ ] Profile → Settings opens App Settings.
- [ ] Eight themes implemented and persistent.
- [ ] Old BitChord icon options removed/replaced.
- [ ] Core functionality regression-tested.
- [ ] Package Installer crash root cause documented and fix verified.
- [ ] No P0/P1 crashes or regressions remain.

## Signing and build
- [ ] Confirm production applicationId/package ID.
- [ ] Confirm versionName = v2.1 (or repository's agreed equivalent).
- [ ] Increment versionCode according to project convention.
- [ ] Confirm stable production signing key.
- [ ] Confirm update signing compatibility.
- [ ] Build release APK.
- [ ] Build AAB if supported/required.
- [ ] Verify APK signature with apksigner.
- [ ] Inspect APK metadata and supported SDK/ABI.
- [ ] Generate SHA-256 checksum.
- [ ] Test exact final APK, not a different debug build.

## Suggested output structure

Keep the existing release history intact. Do not delete or overwrite old APKs.

```text
dist/
  release/
    v2.0/                 # existing release: preserve
      ...                 # existing files: preserve
    v2.1/
      MusoPhone-v2.1.apk
      MusoPhone-v2.1.aab  # if produced
      SHA256SUMS.txt
      BUILD-MANIFEST.json
      RELEASE_NOTES.md
      INSTALLATION-TESTS.md
```

Adapt paths/names to the repository's existing convention, but always create a new v2.1 folder.

## Build manifest fields
- Product name.
- Version name and version code.
- Build date/time.
- Git commit hash.
- Build variant.
- Application ID.
- minSdk / targetSdk.
- ABI packaging.
- Signing certificate SHA-256 fingerprint (never private key/password).
- APK/AAB filename and SHA-256.
- Test device matrix and result summary.

## Final release gate
Do not publish if:
- APK is unsigned or signature verification fails.
- Package Installer crash remains reproducible.
- Fresh install fails on a supported test device.
- Update install fails unexpectedly.
- Core playback/authentication is broken.
- Any page remains unaccounted for in the redesign inventory.
- A previous release artifact has been overwritten or deleted.
