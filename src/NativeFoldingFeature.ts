import { TurboModuleRegistry } from 'react-native';
import type { CodegenTypes, TurboModule } from 'react-native';

export type FoldingFeatureState = 'FLAT' | 'HALF_OPENED';

export type FoldingFeatureOrientation = 'VERTICAL' | 'HORIZONTAL';

export type FoldingFeatureOcclusionType = 'NONE' | 'FULL';

export type FoldingFeatureBounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type FoldingFeatureLayoutInfo = {
  state: FoldingFeatureState;
  occlusionType: FoldingFeatureOcclusionType;
  orientation: FoldingFeatureOrientation;
  isSeparating: boolean;
  isFoldSupported: boolean;
  bounds?: FoldingFeatureBounds;
};

export type FoldingFeatureHingeAngleInfo = {
  supported: boolean;
  angle: number | null;
};

export type FoldingFeatureErrorInfo = {
  error: string;
};

export interface Spec extends TurboModule {
  startListening(): void;
  stopListening(): void;
  readonly onLayoutInfoChange: CodegenTypes.EventEmitter<FoldingFeatureLayoutInfo>;
  readonly onError: CodegenTypes.EventEmitter<FoldingFeatureErrorInfo>;
  readonly onHingeAngleChange: CodegenTypes.EventEmitter<FoldingFeatureHingeAngleInfo>;
}

export default TurboModuleRegistry.get<Spec>('FoldingFeature');
