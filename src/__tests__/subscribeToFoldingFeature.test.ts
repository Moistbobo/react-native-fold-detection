import { NativeEventEmitter, Platform } from 'react-native';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (options: { android?: string; default?: string }) =>
      options.android ?? options.default,
  },
  NativeEventEmitter: jest.fn(),
}));

jest.mock('../FoldingFeature', () => ({
  __esModule: true,
  default: { startListening: jest.fn(), stopListening: jest.fn() },
}));

import FoldingFeature from '../FoldingFeature';
import { subscribeToFoldingFeature } from '../context/subscribeToFoldingFeature';

const mockedEmitter = (NativeEventEmitter as unknown) as jest.Mock;
const mockedFeature = (FoldingFeature as unknown) as {
  startListening: jest.Mock;
  stopListening: jest.Mock;
};

let listeners: Record<string, (event: any) => void>;
let remove: jest.Mock;

const emit = (name: string, event: unknown) => {
  const callback = listeners[name];
  if (!callback) {
    throw new Error(`No listener registered for ${name}`);
  }
  callback(event);
};

beforeEach(() => {
  jest.clearAllMocks();
  listeners = {};
  remove = jest.fn();
  mockedEmitter.mockImplementation(() => ({
    addListener: (name: string, callback: (event: any) => void) => {
      listeners[name] = callback;
      return { remove };
    },
  }));
});

describe('subscribeToFoldingFeature', () => {
  it('starts the native listener on subscribe', () => {
    subscribeToFoldingFeature(jest.fn(), jest.fn());

    expect(mockedFeature.startListening).toHaveBeenCalledTimes(1);
    expect(mockedFeature.stopListening).not.toHaveBeenCalled();
  });

  it('stops the native listener and removes both subscriptions on unsubscribe', () => {
    const unsubscribe = subscribeToFoldingFeature(jest.fn(), jest.fn());

    unsubscribe();

    expect(remove).toHaveBeenCalledTimes(2);
    expect(mockedFeature.stopListening).toHaveBeenCalledTimes(1);
  });

  it('forwards layout info and errors to the callbacks', () => {
    const onLayoutInfo = jest.fn();
    const onError = jest.fn();

    subscribeToFoldingFeature(onLayoutInfo, onError);

    emit('onLayoutInfoChange', { displayFeatures: { state: 'FLAT' } });
    expect(onLayoutInfo).toHaveBeenCalledWith({ state: 'FLAT' });

    emit('onError', { error: 'boom' });
    expect(onError).toHaveBeenCalledWith('boom');
  });

  it('does nothing on iOS', () => {
    (Platform as { OS: string }).OS = 'ios';

    const unsubscribe = subscribeToFoldingFeature(jest.fn(), jest.fn());

    expect(mockedFeature.startListening).not.toHaveBeenCalled();
    unsubscribe();
    expect(mockedFeature.stopListening).not.toHaveBeenCalled();

    (Platform as { OS: string }).OS = 'android';
  });
});
