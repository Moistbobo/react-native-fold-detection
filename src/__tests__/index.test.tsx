jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: (options: { ios?: string; default?: string }) =>
      options.ios ?? options.default,
  },
  NativeEventEmitter: jest.fn(),
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return { ...actual, useContext: jest.fn() };
});

import { useContext } from 'react';

import {
  FoldingFeatureContext,
  useFoldingFeature,
} from '../context/FoldingFeatureContext';
import type { HingeAngleInfo } from '../types';

const mockedUseContext = (useContext as unknown) as jest.Mock;

describe('useFoldingFeature', () => {
  it('returns the default hinge angle on iOS', () => {
    mockedUseContext.mockReturnValue({});

    expect(useFoldingFeature().hingeAngle).toEqual({
      supported: false,
      angle: null,
    });
  });

  it('exposes the default hinge angle in the context', () => {
    const context = (FoldingFeatureContext as unknown) as {
      _currentValue: { hingeAngle: HingeAngleInfo };
    };

    expect(context._currentValue.hingeAngle).toEqual({
      supported: false,
      angle: null,
    });
  });
});
