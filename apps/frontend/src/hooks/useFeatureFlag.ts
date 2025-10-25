'use client';

import { useFeatureFlag as useConfigCatFeatureFlag } from 'configcat-react';
import { FeatureFlags } from '@prontoplus/feature-flags';

export function useFeatureFlag(flag: FeatureFlags, defaultValue = false) {
  return useConfigCatFeatureFlag(flag, defaultValue);
}
