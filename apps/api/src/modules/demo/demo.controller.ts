import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeatureFlags } from '@prontoplus/feature-flags';
import { UseFeatureFlag } from '../../config-cat/decorators/feature-flag.decorator';
import { FeatureFlagGuard } from '../../config-cat/decorators/feature-flag.guard';

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  @Get('feature-enabled')
  @UseGuards(FeatureFlagGuard)
  @UseFeatureFlag(FeatureFlags.DEMO_ENABLED)
  @ApiOperation({ summary: 'Demo endpoint protected by feature flag' })
  @ApiResponse({ status: 200, description: 'Demo feature is enabled' })
  @ApiResponse({ status: 403, description: 'Demo feature is disabled' })
  getDemoContent() {
    return {
      message: 'Demo feature is enabled! This endpoint is protected by the pronto_demo_enabled feature flag.',
      timestamp: new Date().toISOString(),
      flag: FeatureFlags.DEMO_ENABLED,
    };
  }
}
