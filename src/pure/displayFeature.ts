import type {
  DisplayFeature,
  FoldingFeature,
  FoldingFeatureLayoutInfo,
  WindowLayoutInfo,
} from '../types';
import {
  FoldingFeatureOcclusionType,
  FoldingFeatureOrientation,
  FoldingFeatureState,
} from '../types';

export function isFoldingFeature(f: DisplayFeature): f is FoldingFeature {
  return f.type === 'FOLDING';
}

export function projectLegacyLayoutInfo(
  info: WindowLayoutInfo
): FoldingFeatureLayoutInfo {
  const feature = info.displayFeatures.find(isFoldingFeature);

  return {
    state: feature?.state ?? FoldingFeatureState.FLAT,
    occlusionType: feature?.occlusionType ?? FoldingFeatureOcclusionType.NONE,
    orientation: feature?.orientation ?? FoldingFeatureOrientation.VERTICAL,
    isSeparating: feature?.isSeparating ?? false,
    isFoldSupported: info.displayFeatures.length > 0,
    bounds: feature?.bounds,
    displayFeatures: info.displayFeatures,
  };
}
