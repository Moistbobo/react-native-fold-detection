import type {
  DisplayFeature as NativeDisplayFeature,
  DisplayFeatureType as NativeDisplayFeatureType,
  FoldingFeatureHingeAngleInfo,
  FoldingFeatureOcclusionType as NativeFoldingFeatureOcclusionType,
  FoldingFeatureOrientation as NativeFoldingFeatureOrientation,
  FoldingFeatureState as NativeFoldingFeatureState,
  Rect,
  SupportedPosture as NativeSupportedPosture,
  WindowLayoutInfo,
  WindowMetrics,
  WindowSizeClass,
  WindowSizeClassBreakpoints as NativeWindowSizeClassBreakpoints,
  WindowSizeClassValue as NativeWindowSizeClassValue,
} from '../NativeFoldingFeature';

export const DisplayFeatureType = {
  FOLDING: 'FOLDING',
} as const;

export type DisplayFeatureType = NativeDisplayFeatureType;

export const FoldingFeatureState = {
  FLAT: 'FLAT',
  HALF_OPENED: 'HALF_OPENED',
} as const;

export type FoldingFeatureState = NativeFoldingFeatureState;

export const FoldingFeatureOrientation = {
  VERTICAL: 'VERTICAL',
  HORIZONTAL: 'HORIZONTAL',
} as const;

export type FoldingFeatureOrientation = NativeFoldingFeatureOrientation;

export const FoldingFeatureOcclusionType = {
  NONE: 'NONE',
  FULL: 'FULL',
} as const;

export type FoldingFeatureOcclusionType = NativeFoldingFeatureOcclusionType;

export const WindowSizeClassValue = {
  COMPACT: 'COMPACT',
  MEDIUM: 'MEDIUM',
  EXPANDED: 'EXPANDED',
} as const;

export type WindowSizeClassValue = NativeWindowSizeClassValue;

export const WindowSizeClassBreakpoints = {
  V1: 'V1',
  V2: 'V2',
} as const;

export type WindowSizeClassBreakpoints = NativeWindowSizeClassBreakpoints;

export const SupportedPosture = {
  TABLETOP: 'TABLETOP',
} as const;

export type SupportedPosture = NativeSupportedPosture;

export type DisplayFeature = NativeDisplayFeature;

export type FoldingFeature = NativeDisplayFeature;

export type { Rect, WindowLayoutInfo, WindowMetrics, WindowSizeClass };

export type FoldingFeatureBounds = Rect;

export type FoldingFeatureLayoutInfo = {
  state: FoldingFeatureState;
  occlusionType: FoldingFeatureOcclusionType;
  orientation: FoldingFeatureOrientation;
  isSeparating: boolean;
  isFoldSupported: boolean;
  bounds?: Rect;
  displayFeatures: DisplayFeature[];
};

export type LayoutInfo = FoldingFeatureLayoutInfo;

export type HingeAngleInfo = FoldingFeatureHingeAngleInfo;
