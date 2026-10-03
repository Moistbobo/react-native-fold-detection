import { describe, expect, it } from '@jest/globals';

import {
  isFoldingFeature,
  projectLegacyLayoutInfo,
} from '../pure/displayFeature';
import type { DisplayFeature, WindowLayoutInfo } from '../types';

const foldingFeature = (
  overrides: Partial<DisplayFeature> = {}
): DisplayFeature => ({
  type: 'FOLDING',
  bounds: { left: 0, top: 10, right: 100, bottom: 20 },
  state: 'HALF_OPENED',
  orientation: 'HORIZONTAL',
  occlusionType: 'NONE',
  isSeparating: true,
  ...overrides,
});

describe('isFoldingFeature', () => {
  it('returns true for a FOLDING feature', () => {
    expect(isFoldingFeature(foldingFeature())).toBe(true);
  });

  it('returns false for a non-folding feature', () => {
    const notFolding = {
      ...foldingFeature(),
      type: 'OTHER',
    } as unknown as DisplayFeature;

    expect(isFoldingFeature(notFolding)).toBe(false);
  });
});

describe('projectLegacyLayoutInfo', () => {
  it('projects the first folding feature', () => {
    const info: WindowLayoutInfo = {
      displayFeatures: [foldingFeature()],
    };

    expect(projectLegacyLayoutInfo(info)).toEqual({
      state: 'HALF_OPENED',
      occlusionType: 'NONE',
      orientation: 'HORIZONTAL',
      isSeparating: true,
      isFoldSupported: true,
      bounds: { left: 0, top: 10, right: 100, bottom: 20 },
      displayFeatures: info.displayFeatures,
    });
  });

  it('skips non-folding features when picking the first one', () => {
    const notFolding = {
      ...foldingFeature(),
      type: 'OTHER',
      state: 'FLAT',
    } as unknown as DisplayFeature;

    const info: WindowLayoutInfo = {
      displayFeatures: [notFolding, foldingFeature()],
    };

    expect(projectLegacyLayoutInfo(info).state).toBe('HALF_OPENED');
  });

  it('defaults to a flat, unsupported posture for an empty list', () => {
    const info: WindowLayoutInfo = { displayFeatures: [] };

    expect(projectLegacyLayoutInfo(info)).toEqual({
      state: 'FLAT',
      occlusionType: 'NONE',
      orientation: 'VERTICAL',
      isSeparating: false,
      isFoldSupported: false,
      bounds: undefined,
      displayFeatures: [],
    });
  });
});
