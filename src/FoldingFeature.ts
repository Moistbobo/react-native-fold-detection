import { Platform } from 'react-native';

import NativeFoldingFeature from './NativeFoldingFeature';
import type { Spec } from './NativeFoldingFeature';
import type {
  SupportedPosture,
  WindowLayoutInfo,
  WindowMetrics,
  WindowSizeClass,
  WindowSizeClassBreakpoints,
} from './types';

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

const zeroMetrics = (): WindowMetrics => ({
  bounds: { left: 0, top: 0, right: 0, bottom: 0 },
  density: 1,
  widthDp: 0,
  heightDp: 0,
});

const defaultSizeClass = (): WindowSizeClass => ({
  widthSizeClass: 'COMPACT',
  heightSizeClass: 'COMPACT',
  widthDp: 0,
  heightDp: 0,
});

const FoldingFeature: Spec = {
  startListening: () => getFoldingFeature().startListening(),
  stopListening: () => getFoldingFeature().stopListening(),
  onLayoutInfoChange: (listener) =>
    getFoldingFeature().onLayoutInfoChange(listener),
  onError: (listener) => getFoldingFeature().onError(listener),
  onHingeAngleChange: (listener) =>
    getFoldingFeature().onHingeAngleChange(listener),
  computeCurrentWindowMetrics: () =>
    Platform.OS === 'ios'
      ? Promise.resolve(zeroMetrics())
      : getFoldingFeature().computeCurrentWindowMetrics(),
  computeMaximumWindowMetrics: () =>
    Platform.OS === 'ios'
      ? Promise.resolve(zeroMetrics())
      : getFoldingFeature().computeMaximumWindowMetrics(),
  getSupportedPostures: (): Promise<SupportedPosture[]> =>
    Platform.OS === 'ios'
      ? Promise.resolve([])
      : getFoldingFeature().getSupportedPostures(),
  getWindowLayoutInfo: (): Promise<WindowLayoutInfo> =>
    Platform.OS === 'ios'
      ? Promise.resolve({ displayFeatures: [] })
      : getFoldingFeature().getWindowLayoutInfo(),
  getWindowSizeClass: (breakpoints: WindowSizeClassBreakpoints) =>
    Platform.OS === 'ios'
      ? Promise.resolve(defaultSizeClass())
      : getFoldingFeature().getWindowSizeClass(breakpoints),
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

export function computeCurrentWindowMetrics(): Promise<WindowMetrics> {
  return FoldingFeature.computeCurrentWindowMetrics();
}

export function computeMaximumWindowMetrics(): Promise<WindowMetrics> {
  return FoldingFeature.computeMaximumWindowMetrics();
}

export function getSupportedPostures(): Promise<SupportedPosture[]> {
  return FoldingFeature.getSupportedPostures();
}

export function getWindowLayoutInfo(): Promise<WindowLayoutInfo> {
  return FoldingFeature.getWindowLayoutInfo();
}

export function getWindowSizeClass(
  breakpoints: WindowSizeClassBreakpoints = 'V1'
): Promise<WindowSizeClass> {
  return FoldingFeature.getWindowSizeClass(breakpoints);
}

export default FoldingFeature;
