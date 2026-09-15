import { NativeEventEmitter, Platform } from 'react-native';

import FoldingFeature from '../FoldingFeature';
import type { HingeAngleInfo, LayoutInfo } from '../types';

/**
 * Subscribes to fold layout and hinge angle updates and returns an unsubscribe
 * function.
 *
 * The unsubscribe removes the JS listeners and stops the native listener. Not
 * stopping the native listener leaks the Activity it was registered against.
 */
export function subscribeToFoldingFeature(
  onLayoutInfo: (layoutInfo: LayoutInfo) => void,
  onError: (error: string) => void,
  onHingeAngle: (hingeAngle: HingeAngleInfo) => void
): () => void {
  if (Platform.OS === 'ios') {
    return () => {};
  }

  FoldingFeature.startListening();

  const eventEmitter = new NativeEventEmitter();
  const layoutSubscription = eventEmitter.addListener(
    'onLayoutInfoChange',
    (event) => {
      if (event?.displayFeatures) {
        onLayoutInfo(event.displayFeatures);
      }
    }
  );

  const errorSubscription = eventEmitter.addListener('onError', (event) => {
    if (event?.error) {
      onError(event.error);
    }
  });

  const hingeAngleSubscription = eventEmitter.addListener(
    'onHingeAngleChange',
    (event: HingeAngleInfo) => {
      onHingeAngle(event);
    }
  );

  return () => {
    layoutSubscription.remove();
    errorSubscription.remove();
    hingeAngleSubscription.remove();
    FoldingFeature.stopListening();
  };
}
