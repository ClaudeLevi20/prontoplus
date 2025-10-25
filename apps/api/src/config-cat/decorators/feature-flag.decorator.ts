import { SetMetadata } from '@nestjs/common';

export const FEATURE_FLAG_KEY = 'featureFlag';

export const UseFeatureFlag = (flag: string) => SetMetadata(FEATURE_FLAG_KEY, flag);
