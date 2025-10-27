import { Controller, Get, Post, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UseFeatureFlag } from '../../config-cat/decorators/feature-flag.decorator';
import { FeatureFlagGuard } from '../../config-cat/decorators/feature-flag.guard';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const DEMO_ENABLED_FLAG = 'pronto_demo_enabledBoolean';

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  private readonly logger = new Logger(DemoController.name);
  @Get('feature-enabled')
  @UseGuards(FeatureFlagGuard)
  @UseFeatureFlag(DEMO_ENABLED_FLAG)
  @ApiOperation({ summary: 'Demo endpoint protected by feature flag' })
  @ApiResponse({ status: 200, description: 'Demo feature is enabled' })
  @ApiResponse({ status: 403, description: 'Demo feature is disabled' })
  getDemoContent() {
    return {
      message: 'Demo feature is enabled! This endpoint is protected by the pronto_demo_enabled feature flag.',
      timestamp: new Date().toISOString(),
      flag: DEMO_ENABLED_FLAG,
    };
  }

  @Post('test-run')
  @ApiOperation({ summary: 'Run automated tests for Pronto Demo AI receptionist' })
  @ApiResponse({ status: 200, description: 'Test run completed successfully' })
  @ApiResponse({ status: 500, description: 'Test run failed' })
  async runTests() {
    this.logger.log('Starting automated test run...');

    try {
      // Run the test script directly
      const { stdout, stderr } = await execAsync('cd /app/apps/api && pnpm test:pronto');

      this.logger.log('Test run completed');
      this.logger.log('Output:', stdout);

      if (stderr) {
        this.logger.warn('Test run warnings:', stderr);
      }

      return {
        success: true,
        message: 'Test run completed successfully',
        output: stdout,
        warnings: stderr
      };
    } catch (error) {
      this.logger.error('Test run failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
