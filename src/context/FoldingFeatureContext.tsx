import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { subscribeToFoldingFeature } from './subscribeToFoldingFeature';
import FoldingFeature from '../FoldingFeature';
import { projectLegacyLayoutInfo } from '../pure/displayFeature';
import type {
  HingeAngleInfo,
  LayoutInfo,
  SupportedPosture,
  WindowLayoutInfo,
} from '../types';
import { FoldingFeatureOrientation, FoldingFeatureState } from '../types';

const initialLayoutInfo = (): LayoutInfo =>
  projectLegacyLayoutInfo({ displayFeatures: [] });

type FoldingFeatureContextProps = {
  layoutInfo: LayoutInfo;
  isTableTop: boolean;
  isBook: boolean;
  isFlat: boolean;
  hingeAngle: HingeAngleInfo;
  supportedPostures: SupportedPosture[];
};

export const FoldingFeatureContext = createContext<FoldingFeatureContextProps>({
  layoutInfo: initialLayoutInfo(),
  // helper state
  isTableTop: false,
  isBook: false,
  isFlat: true,
  hingeAngle: { supported: false, angle: null },
  supportedPostures: [],
});

export const useFoldingFeature = () => {
  const context = useContext(FoldingFeatureContext);

  if (context === undefined) {
    throw new Error('useFoldingFeature was used outside of its provider');
  }

  if (Platform.OS === 'ios') {
    return {
      layoutInfo: initialLayoutInfo(),
      isTableTop: false,
      isBook: false,
      isFlat: true,
      hingeAngle: { supported: false, angle: null },
      supportedPostures: [],
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
  const [layoutInfo, setLayoutInfo] = useState<LayoutInfo>(initialLayoutInfo);

  const [hingeAngle, setHingeAngle] = useState<HingeAngleInfo>({
    supported: false,
    angle: null,
  });

  const [supportedPostures, setSupportedPostures] = useState<
    SupportedPosture[]
  >([]);

  const updateLayoutInfo = (info: WindowLayoutInfo) => {
    setLayoutInfo(projectLegacyLayoutInfo(info));
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
    let active = true;

    const unsubscribe = subscribeToFoldingFeature(
      updateLayoutInfo,
      (error) => {
        console.log('FoldingFeature', error);
      },
      setHingeAngle
    );

    FoldingFeature.getSupportedPostures().then(
      (postures) => {
        if (active) {
          setSupportedPostures(postures);
        }
      },
      () => {}
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return {
    layoutInfo,
    isTableTop,
    isBook,
    isFlat,
    hingeAngle,
    supportedPostures,
  };
};
