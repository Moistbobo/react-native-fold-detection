import { Platform } from 'react-native';

import NativeFoldingFeature from './NativeFoldingFeature';
import type { Spec } from './NativeFoldingFeature';

const LINKING_ERROR =
  `The package '@logicwind/react-native-fold-detection' doesn't seem to be linked. Make sure:\n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

function getFoldingFeature(): Spec {
  if (NativeFoldingFeature == null) {
    throw new Error(LINKING_ERROR);
  }

  return NativeFoldingFeature;
}

const FoldingFeature: Spec = {
  startListening: () => getFoldingFeature().startListening(),
  stopListening: () => getFoldingFeature().stopListening(),
  onLayoutInfoChange: (listener) =>
    getFoldingFeature().onLayoutInfoChange(listener),
  onError: (listener) => getFoldingFeature().onError(listener),
  onHingeAngleChange: (listener) =>
    getFoldingFeature().onHingeAngleChange(listener),
};

export function startFoldEventListener(): void {
  if (Platform.OS === 'android') {
    FoldingFeature.startListening();
  }
}

export function stopFoldEventListener(): void {
  if (Platform.OS === 'android') {
    FoldingFeature.stopListening();
  }
}

export default FoldingFeature;
