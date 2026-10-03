import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import FoldingFeature from '../FoldingFeature';
import type {
  WindowMetrics,
  WindowSizeClass,
  WindowSizeClassBreakpoints,
} from '../types';

const toError = (reason: unknown): Error =>
  reason instanceof Error ? reason : new Error(String(reason));

export function useWindowMetrics(mode: 'current' | 'maximum' = 'current'): {
  metrics: WindowMetrics | null;
  error: Error | null;
} {
  const { width, height } = useWindowDimensions();
  const [metrics, setMetrics] = useState<WindowMetrics | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    const request =
      mode === 'maximum'
        ? FoldingFeature.computeMaximumWindowMetrics()
        : FoldingFeature.computeCurrentWindowMetrics();

    request.then(
      (value) => {
        if (active) {
          setMetrics(value);
          setError(null);
        }
      },
      (reason: unknown) => {
        if (active) {
          setError(toError(reason));
        }
      }
    );

    return () => {
      active = false;
    };
  }, [mode, width, height]);

  return { metrics, error };
}

export function useWindowSizeClass(
  breakpoints: WindowSizeClassBreakpoints = 'V1'
): { sizeClass: WindowSizeClass | null; error: Error | null } {
  const { width, height } = useWindowDimensions();
  const [sizeClass, setSizeClass] = useState<WindowSizeClass | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    FoldingFeature.getWindowSizeClass(breakpoints).then(
      (value) => {
        if (active) {
          setSizeClass(value);
          setError(null);
        }
      },
      (reason: unknown) => {
        if (active) {
          setError(toError(reason));
        }
      }
    );

    return () => {
      active = false;
    };
  }, [breakpoints, width, height]);

  return { sizeClass, error };
}
