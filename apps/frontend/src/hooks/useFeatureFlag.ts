'use client';

import { useFeatureFlag as useConfigCatFeatureFlag } from 'configcat-react';

export function useFeatureFlag(flag: string, defaultValue = false) {
  return useConfigCatFeatureFlag(flag, defaultValue);
}
