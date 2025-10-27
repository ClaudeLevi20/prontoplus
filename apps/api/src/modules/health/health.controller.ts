import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../cache/redis.service';
import { ConfigCatService } from '../../config-cat/config-cat.service';
import { HealthService } from '../../health/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
    private redis: RedisService,
    private configCatService: ConfigCatService,
    private healthService: HealthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @HealthCheck()
  async check() {
    const healthResult = await this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
    
    // Add feature flags to health check response
    const featureFlags = await this.configCatService.getAllFeatureFlags();
    
    return {
      ...healthResult,
      featureFlags,
    };
  }

  @Get('database')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unhealthy' })
  @HealthCheck()
  checkDatabase() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma as any),
    ]);
  }

  @Get('redis')
  @ApiOperation({ summary: 'Redis health check' })
  @ApiResponse({ status: 200, description: 'Redis is healthy' })
  @ApiResponse({ status: 503, description: 'Redis is unhealthy' })
  @HealthCheck()
  async checkRedis() {
    const isHealthy = await this.redis.ping();
    return {
      status: isHealthy ? 'ok' : 'error',
      redis: {
        status: isHealthy ? 'up' : 'down',
      },
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({ status: 200, description: 'All services are healthy' })
  @ApiResponse({ status: 503, description: 'One or more services are unhealthy' })
  @HealthCheck()
  async checkAll() {
    return this.healthService.check();
  }

  @Get('telnyx')
  @ApiOperation({ summary: 'Telnyx service health check' })
  @ApiResponse({ status: 200, description: 'Telnyx service is healthy' })
  @ApiResponse({ status: 503, description: 'Telnyx service is unhealthy' })
  async checkTelnyx() {
    const result = await this.healthService.check();
    return {
      telnyx: result.services.telnyx,
    };
  }

  @Get('slack')
  @ApiOperation({ summary: 'Slack service health check' })
  @ApiResponse({ status: 200, description: 'Slack service is healthy' })
  @ApiResponse({ status: 503, description: 'Slack service is unhealthy' })
  async checkSlack() {
    const result = await this.healthService.check();
    return {
      slack: result.services.slack,
    };
  }
}
