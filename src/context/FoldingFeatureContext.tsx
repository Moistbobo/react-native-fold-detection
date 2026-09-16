import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { subscribeToFoldingFeature } from './subscribeToFoldingFeature';
import type { HingeAngleInfo, LayoutInfo } from '../types';
import {
  FoldingFeatureOcclusionType,
  FoldingFeatureOrientation,
  FoldingFeatureState,
} from '../types';

type FoldingFeatureContextProps = {
  layoutInfo: LayoutInfo;
  isTableTop: boolean;
  isBook: boolean;
  isFlat: boolean;
  hingeAngle: HingeAngleInfo;
};

export const FoldingFeatureContext = createContext<FoldingFeatureContextProps>({
  layoutInfo: {
    state: FoldingFeatureState.FLAT,
    occlusionType: FoldingFeatureOcclusionType.NONE,
    orientation: FoldingFeatureOrientation.VERTICAL,
    isSeparating: false,
    isFoldSupported: false,
  },
  // helper state
  isTableTop: false,
  isBook: false,
  isFlat: true,
  hingeAngle: { supported: false, angle: null },
});

export const useFoldingFeature = () => {
  const context = useContext(FoldingFeatureContext);

  if (context === undefined) {
    throw new Error('useFoldingFeature was used outside of its provider');
  }

  if (Platform.OS === 'ios') {
    return {
      layoutInfo: {
        state: FoldingFeatureState.FLAT,
        occlusionType: FoldingFeatureOcclusionType.NONE,
        orientation: FoldingFeatureOrientation.VERTICAL,
        isSeparating: false,
        isFoldSupported: false,
      },
      isTableTop: false,
      isBook: false,
      isFlat: true,
      hingeAngle: { supported: false, angle: null },
    };
  }

  return context;
};

export const FoldingFeatureProvider = ({ children }: PropsWithChildren<{}>) => {
  const value = useProvideFunc();

  if (Platform.OS === 'ios') {
    return <>{children}</>;
  }

  return (
    <FoldingFeatureContext.Provider value={value}>
      {children}
    </FoldingFeatureContext.Provider>
  );
};

const useProvideFunc = (): FoldingFeatureContextProps => {
  const [layoutInfo, setLayoutInfo] = useState<LayoutInfo>({
    state: FoldingFeatureState.FLAT,
    occlusionType: FoldingFeatureOcclusionType.NONE,
    orientation: FoldingFeatureOrientation.VERTICAL,
    isSeparating: false,
    isFoldSupported: false,
  });

  const [hingeAngle, setHingeAngle] = useState<HingeAngleInfo>({
    supported: false,
    angle: null,
  });

  const updateLayoutInfo = (event: LayoutInfo) => {
    setLayoutInfo(event);
  };

  const isTableTop = useMemo(() => {
    return (
      layoutInfo.state === FoldingFeatureState.HALF_OPENED &&
      layoutInfo.orientation === FoldingFeatureOrientation.HORIZONTAL
    );
  }, [layoutInfo]);

  const isBook = useMemo(() => {
    return (
      layoutInfo.state === FoldingFeatureState.HALF_OPENED &&
      layoutInfo.orientation === FoldingFeatureOrientation.VERTICAL
    );
  }, [layoutInfo]);

  const isFlat = useMemo(() => {
    return !(isTableTop || isBook);
  }, [isTableTop, isBook]);

  useEffect(() => {
    return subscribeToFoldingFeature(
      updateLayoutInfo,
      (error) => {
        console.log('FoldingFeature', error);
      },
      setHingeAngle
    );
  }, []);

  return {
    layoutInfo,
    isTableTop,
    isBook,
    isFlat,
    hingeAngle,
  };
};
