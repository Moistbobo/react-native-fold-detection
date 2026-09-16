jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: (options: { ios?: string; default?: string }) =>
      options.ios ?? options.default,
  },
}));

jest.mock('../FoldingFeature', () => ({
  __esModule: true,
  default: {
    startListening: jest.fn(),
    stopListening: jest.fn(),
    onLayoutInfoChange: jest.fn(),
    onError: jest.fn(),
    onHingeAngleChange: jest.fn(),
  },
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react') as Record<string, unknown>;
  return { ...actual, useContext: jest.fn() };
});

import { describe, expect, it, jest } from '@jest/globals';
import { useContext } from 'react';

import {
  FoldingFeatureContext,
  useFoldingFeature,
} from '../context/FoldingFeatureContext';
import type { HingeAngleInfo } from '../types';

const mockedUseContext = useContext as unknown as ReturnType<typeof jest.fn>;

describe('useFoldingFeature', () => {
  it('returns the default hinge angle on iOS', () => {
    mockedUseContext.mockReturnValue({});

    expect(useFoldingFeature().hingeAngle).toEqual({
      supported: false,
      angle: null,
    });
  });

  it('exposes the default hinge angle in the context', () => {
    const context = FoldingFeatureContext as unknown as {
      _currentValue: { hingeAngle: HingeAngleInfo };
    };

    expect(context._currentValue.hingeAngle).toEqual({
      supported: false,
      angle: null,
    });
  });
});
