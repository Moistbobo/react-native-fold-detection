import { TurboModuleRegistry } from 'react-native';
import type { CodegenTypes, TurboModule } from 'react-native';

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type DisplayFeatureType = 'FOLDING';

export type FoldingFeatureState = 'FLAT' | 'HALF_OPENED';

export type FoldingFeatureOrientation = 'VERTICAL' | 'HORIZONTAL';

export type FoldingFeatureOcclusionType = 'NONE' | 'FULL';

export type DisplayFeature = {
  type: DisplayFeatureType;
  bounds: Rect;
  state: FoldingFeatureState;
  orientation: FoldingFeatureOrientation;
  occlusionType: FoldingFeatureOcclusionType;
  isSeparating: boolean;
};

export type WindowLayoutInfo = {
  displayFeatures: DisplayFeature[];
};

export type WindowMetrics = {
  bounds: Rect;
  density: number;
  widthDp: number;
  heightDp: number;
};

export type WindowSizeClassValue = 'COMPACT' | 'MEDIUM' | 'EXPANDED';

export type WindowSizeClassBreakpoints = 'V1' | 'V2';

export type WindowSizeClass = {
  widthSizeClass: WindowSizeClassValue;
  heightSizeClass: WindowSizeClassValue;
  widthDp: number;
  heightDp: number;
};

export type SupportedPosture = 'TABLETOP';

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
  readonly onLayoutInfoChange: CodegenTypes.EventEmitter<WindowLayoutInfo>;
  readonly onError: CodegenTypes.EventEmitter<FoldingFeatureErrorInfo>;
  readonly onHingeAngleChange: CodegenTypes.EventEmitter<FoldingFeatureHingeAngleInfo>;

  computeCurrentWindowMetrics(): Promise<WindowMetrics>;
  computeMaximumWindowMetrics(): Promise<WindowMetrics>;
  getSupportedPostures(): Promise<SupportedPosture[]>;
  getWindowLayoutInfo(): Promise<WindowLayoutInfo>;
  getWindowSizeClass(
    breakpoints: WindowSizeClassBreakpoints
  ): Promise<WindowSizeClass>;
}

export default TurboModuleRegistry.get<Spec>('FoldingFeature');
