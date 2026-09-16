## 1.0.0

### Breaking

- Require React Native 0.86+ and the New Architecture. The legacy architecture is no longer supported.
- The Android native module is now a TurboModule (codegen spec `NativeFoldingFeature`).
- Build output is ESM only; the CommonJS bundle is dropped.

### Added

- Typed events `onLayoutInfoChange`, `onError`, and `onHingeAngleChange` declared in the codegen spec.
- An iOS TurboModule implementation that is a no-op, so the package autolinks cleanly on iOS.

### Changed

- `FoldingFeatureState`, `FoldingFeatureOrientation`, and `FoldingFeatureOcclusionType` are const objects rather than TypeScript enums, so codegen string unions satisfy them without casts. The runtime values are unchanged.
- The example app is regenerated on React Native 0.86 (Gradle 9.3.1, AGP 8.7.2, Yarn 4, flat ESLint config). The library compiles with Kotlin 2.0.21 by default and the example uses Kotlin 2.1.20.
- Build tooling moves to CI. The lefthook and commitlint git hooks and their dependencies are removed; `ci.yml` runs lint, typecheck, test, and the Android and iOS builds.

### Migration

- Delete the `react-native.config.js` entry that disabled iOS autolinking. The package autolinks on iOS and `useFoldingFeature` returns the default values.

## 0.3.2

- Fix: Invalid hook call ([#14](https://github.com/logicwind/react-native-fold-detection/issues/14))

## 0.3.1

- Fix: Ios build issue on react-native version 0.76.0

## 0.3.0

- Fixed null pointer exception error on startListener.
- Added detection for only fold devices will register for the listener.

## 0.2.0

- Read me updated
- Example updated

## 0.1.0

- Initial Release
