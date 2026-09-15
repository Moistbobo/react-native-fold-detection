#!/usr/bin/env bash
set -euo pipefail

REF=/var/folders/k_/xcv9gtdd2cgbrf99kt48h94h0000gn/T/opencode/folding-vanilla
DEST=/Users/mrbobo/WebstormProjects/react-native-fold-detection
PRESERVE=/var/folders/k_/xcv9gtdd2cgbrf99kt48h94h0000gn/T/opencode/preserve

cd "$DEST"

echo "== preserve surfaces we will port =="
rm -rf "$PRESERVE"; mkdir -p "$PRESERVE"
cp example/src/App.tsx "$PRESERVE/App.tsx"
cp example/src/SampleScreen.tsx "$PRESERVE/SampleScreen.tsx"
cp example/README.md "$PRESERVE/example-README.md"

echo "== drop old scaffold, generated output, deps, locks =="
rm -rf node_modules example/node_modules android ios example lib scripts
rm -f package-lock.json react-native-fold-detection.podspec yarn.lock
rm -rf .yarn/cache .yarn/install-state.gz .yarn/plugins .yarn/releases

echo "== copy canonical config =="
for f in .editorconfig .gitattributes .gitignore .watchmanconfig .nvmrc .yarnrc.yml \
         package.json tsconfig.json tsconfig.build.json babel.config.js eslint.config.mjs turbo.json; do
  cp "$REF/$f" "$DEST/$f"
done
mkdir -p .yarn/releases
cp "$REF/.yarn/releases/yarn-4.11.0.cjs" .yarn/releases/

echo "== copy native dirs =="
mkdir -p android ios example
rsync -a "$REF/android/" android/
rsync -a "$REF/ios/" ios/
cp "$REF/FoldingVanilla.podspec" react-native-fold-detection.podspec
rsync -a --exclude '.gradle/' --exclude 'build/' --exclude 'node_modules/' --exclude 'Pods/' "$REF/example/" example/

echo "== copy CI =="
mkdir -p .github/workflows .github/actions/setup
cp "$REF/.github/workflows/ci.yml" .github/workflows/ci.yml
cp "$REF/.github/actions/setup/action.yml" .github/actions/setup/action.yml

echo "== restore preserved surfaces =="
cp "$PRESERVE/App.tsx" example/src/App.tsx
cp "$PRESERVE/SampleScreen.tsx" example/src/SampleScreen.tsx
cp "$PRESERVE/example-README.md" example/README.md

echo "== directory renames =="
mkdir -p example/android/app/src/main/java/com
mv example/android/app/src/main/java/foldingvanilla/example example/android/app/src/main/java/com/folddetectionexample
rmdir example/android/app/src/main/java/foldingvanilla
mv example/ios/FoldingVanillaExample.xcodeproj example/ios/FoldDetectionExample.xcodeproj
mv example/ios/FoldingVanillaExample example/ios/FoldDetectionExample
mv android/src/main/java/com/foldingvanilla android/src/main/java/com/folddetection
mv ios/FoldingVanilla.h ios/FoldDetection.h
mv ios/FoldingVanilla.mm ios/FoldDetection.mm

echo "== token renames =="
mapfile -t FILES < <(grep -rlI \
  -e 'FoldingVanillaExample' -e 'foldingvanilla' -e 'FoldingVanilla' -e 'folding-vanilla' \
  "$DEST" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.yarn 2>/dev/null || true)

perl -pi -e 's/FoldingVanillaExample/FoldDetectionExample/g' "${FILES[@]}"
perl -pi -e 's/foldingvanilla\.example/com.folddetectionexample/g' "${FILES[@]}"
perl -pi -e 's/com\.foldingvanilla/com.folddetection/g' "${FILES[@]}"
perl -pi -e 's/foldingvanilla/folddetection/g' "${FILES[@]}"
perl -pi -e 's/FoldingVanillaSpec/FoldDetectionSpec/g' "${FILES[@]}"
perl -pi -e 's/FoldingVanilla/FoldDetection/g' "${FILES[@]}"
perl -pi -e 's/folding-vanilla-source/react-native-fold-detection-source/g' "${FILES[@]}"
perl -pi -e 's/folding-vanilla-example/react-native-fold-detection-example/g' "${FILES[@]}"
perl -pi -e 's/folding-vanilla/react-native-fold-detection/g' "${FILES[@]}"
perl -pi -e 's#https://github.com/example/react-native-fold-detection\.git#https://github.com/logicwind/react-native-fold-detection.git#g' "${FILES[@]}"

echo "== done =="
