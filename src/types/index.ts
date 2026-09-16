import type {
  FoldingFeatureHingeAngleInfo,
  FoldingFeatureLayoutInfo,
} from '../NativeFoldingFeature';

export const FoldingFeatureState = {
  FLAT: 'FLAT',
  HALF_OPENED: 'HALF_OPENED',
} as const;

export type FoldingFeatureState =
  (typeof FoldingFeatureState)[keyof typeof FoldingFeatureState];

export const FoldingFeatureOrientation = {
  VERTICAL: 'VERTICAL',
  HORIZONTAL: 'HORIZONTAL',
} as const;

export type FoldingFeatureOrientation =
  (typeof FoldingFeatureOrientation)[keyof typeof FoldingFeatureOrientation];

export const FoldingFeatureOcclusionType = {
  NONE: 'NONE',
  FULL: 'FULL',
} as const;

export type FoldingFeatureOcclusionType =
  (typeof FoldingFeatureOcclusionType)[keyof typeof FoldingFeatureOcclusionType];

export type LayoutInfo = FoldingFeatureLayoutInfo;

export type HingeAngleInfo = FoldingFeatureHingeAngleInfo;
