#!/usr/bin/env bash
#
# Smoke-tests the FoldingFeature TurboModule on a foldable Android emulator.
# Builds the example release APK (which bundles the JS and runs codegen),
# installs it, launches it, and folds and unfolds the device. Fails if the
# app process dies or a turbo module linking error appears in the log.
#
# Usage: scripts/verify-android-runtime.sh [device-serial]
# The emulator must support posture changes (for example Pixel_Fold_API_36).
set -euo pipefail

SERIAL="${1:-emulator-5554}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ADB="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"
PKG=com.folddetectionexample
APK="$ROOT/example/android/app/build/outputs/apk/release/app-release.apk"

cd "$ROOT/example/android"
./gradlew :app:assembleRelease --console=plain

"$ADB" -s "$SERIAL" install -r "$APK"
"$ADB" -s "$SERIAL" logcat -c
"$ADB" -s "$SERIAL" shell am start -n "$PKG/.MainActivity"
sleep 8

"$ADB" -s "$SERIAL" logcat -d | grep "Running \"FoldDetectionExample\"" \
  || { echo "FAIL: the JS bundle did not start"; exit 1; }

"$ADB" -s "$SERIAL" emu fold
sleep 4
"$ADB" -s "$SERIAL" emu unfold
sleep 4

PID="$("$ADB" -s "$SERIAL" shell pidof "$PKG" | tr -d '\r')"
[ -n "$PID" ] || { echo "FAIL: app process died"; exit 1; }

if "$ADB" -s "$SERIAL" logcat -d | grep -E "FATAL EXCEPTION|TurboModuleRegistry.*could not be found"; then
  echo "FAIL: crash or turbo module linking error"
  exit 1
fi

echo "PASS: app alive on $SERIAL after fold and unfold"
