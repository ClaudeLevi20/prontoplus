import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigCatService } from '../config-cat.service';
import { FEATURE_FLAG_KEY } from './feature-flag.decorator';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configCatService: ConfigCatService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const flag = this.reflector.get<string>(FEATURE_FLAG_KEY, context.getHandler());
    
    if (!flag) {
      return true; // No feature flag required
    }

    const isEnabled = await this.configCatService.isFeatureEnabled(flag, false);

    if (!isEnabled) {
      throw new ForbiddenException(`Feature flag '${flag}' is disabled`);
    }

    return true;
  }
}
