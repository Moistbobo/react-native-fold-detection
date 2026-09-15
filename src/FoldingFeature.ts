import { Platform } from 'react-native';

import NativeFoldingFeature from './NativeFoldingFeature';
import type { Spec } from './NativeFoldingFeature';

const FoldingFeature: Spec = NativeFoldingFeature;

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
