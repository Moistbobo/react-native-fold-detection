import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

const mockStartListening = jest.fn();
const mockStopListening = jest.fn();
const mockLayoutSubscription = { remove: jest.fn() };
const mockErrorSubscription = { remove: jest.fn() };
const mockHingeAngleSubscription = { remove: jest.fn() };

let mockLayoutListener: ((event: unknown) => void) | undefined;
let mockErrorListener: ((event: { error: string }) => void) | undefined;
let mockHingeAngleListener:
  ((event: { supported: boolean; angle: number | null }) => void) | undefined;

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (options: { android?: string; default?: string }) =>
      options.android ?? options.default,
  },
}));

jest.mock('../FoldingFeature', () => ({
  __esModule: true,
  default: {
    startListening: () => mockStartListening(),
    stopListening: () => mockStopListening(),
    onLayoutInfoChange: (listener: (event: unknown) => void) => {
      mockLayoutListener = listener;
      return mockLayoutSubscription;
    },
    onError: (listener: (event: { error: string }) => void) => {
      mockErrorListener = listener;
      return mockErrorSubscription;
    },
    onHingeAngleChange: (
      listener: (event: { supported: boolean; angle: number | null }) => void
    ) => {
      mockHingeAngleListener = listener;
      return mockHingeAngleSubscription;
    },
  },
}));

import { subscribeToFoldingFeature } from '../context/subscribeToFoldingFeature';

beforeEach(() => {
  jest.clearAllMocks();
  mockLayoutListener = undefined;
  mockErrorListener = undefined;
  mockHingeAngleListener = undefined;
});

describe('subscribeToFoldingFeature', () => {
  it('starts the native listener on subscribe', () => {
    subscribeToFoldingFeature(jest.fn(), jest.fn(), jest.fn());

    expect(mockStartListening).toHaveBeenCalledTimes(1);
    expect(mockStopListening).not.toHaveBeenCalled();
  });

  it('stops the native listener and removes every subscription on unsubscribe', () => {
    const unsubscribe = subscribeToFoldingFeature(
      jest.fn(),
      jest.fn(),
      jest.fn()
    );

    unsubscribe();

    expect(mockLayoutSubscription.remove).toHaveBeenCalledTimes(1);
    expect(mockErrorSubscription.remove).toHaveBeenCalledTimes(1);
    expect(mockHingeAngleSubscription.remove).toHaveBeenCalledTimes(1);
    expect(mockStopListening).toHaveBeenCalledTimes(1);
  });

  it('forwards layout info, errors, and hinge angle to the callbacks', () => {
    const onLayoutInfo = jest.fn();
    const onError = jest.fn();
    const onHingeAngle = jest.fn();

    subscribeToFoldingFeature(onLayoutInfo, onError, onHingeAngle);

    mockLayoutListener?.({ state: 'FLAT' });
    expect(onLayoutInfo).toHaveBeenCalledWith({ state: 'FLAT' });

    mockErrorListener?.({ error: 'boom' });
    expect(onError).toHaveBeenCalledWith('boom');

    mockHingeAngleListener?.({ supported: true, angle: 90 });
    expect(onHingeAngle).toHaveBeenCalledWith({ supported: true, angle: 90 });
  });

  it('does nothing on iOS', () => {
    (Platform as unknown as { OS: string }).OS = 'ios';

    const unsubscribe = subscribeToFoldingFeature(
      jest.fn(),
      jest.fn(),
      jest.fn()
    );

    expect(mockStartListening).not.toHaveBeenCalled();
    unsubscribe();
    expect(mockStopListening).not.toHaveBeenCalled();

    (Platform as unknown as { OS: string }).OS = 'android';
  });
});
