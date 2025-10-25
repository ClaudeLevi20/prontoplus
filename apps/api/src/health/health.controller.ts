import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

/**
 * Controller for health check endpoints
 * 
 * Provides comprehensive health monitoring for all critical services
 * including database, Redis, feature flags, and system metrics.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Comprehensive health check endpoint
   * 
   * @returns Promise<HealthCheckResponse>
   */
  @Get()
  @ApiOperation({ 
    summary: 'Check API health status',
    description: 'Performs comprehensive health checks on all critical services including database, Redis, feature flags, and system metrics. Returns detailed status information for monitoring and debugging.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Health check completed successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['healthy', 'degraded', 'unhealthy', 'error'],
          description: 'Overall system health status',
          example: 'healthy'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'ISO timestamp of the health check',
          example: '2024-01-15T10:30:00.000Z'
        },
        service: {
          type: 'string',
          description: 'Service name',
          example: 'ProntoPlus API'
        },
        version: {
          type: 'string',
          description: 'API version',
          example: '1.0.0'
        },
        environment: {
          type: 'string',
          description: 'Environment (development, production, etc.)',
          example: 'development'
        },
        uptime: {
          type: 'number',
          description: 'Service uptime in seconds',
          example: 3600
        },
        responseTime: {
          type: 'string',
          description: 'Health check response time',
          example: '45ms'
        },
        services: {
          type: 'object',
          description: 'Individual service health statuses',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
                message: { type: 'string' },
                responseTime: { type: 'string' },
                details: { type: 'object' }
              }
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
                message: { type: 'string' },
                responseTime: { type: 'string' },
                details: { type: 'object' }
              }
            },
            featureFlags: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
                message: { type: 'string' },
                responseTime: { type: 'string' },
                details: { type: 'object' }
              }
            }
          }
        },
        memory: {
          type: 'object',
          description: 'Memory usage statistics in MB',
          properties: {
            used: { type: 'number', example: 45 },
            total: { type: 'number', example: 128 },
            external: { type: 'number', example: 12 }
          }
        },
        node: {
          type: 'object',
          description: 'Node.js runtime information',
          properties: {
            version: { type: 'string', example: 'v20.10.0' },
            platform: { type: 'string', example: 'darwin' },
            arch: { type: 'string', example: 'x64' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Health check failed or service unavailable',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        timestamp: { type: 'string', format: 'date-time' },
        service: { type: 'string', example: 'ProntoPlus API' },
        error: { type: 'string', example: 'Health check failed' },
        services: { type: 'object' }
      }
    }
  })
  async check() {
    return this.healthService.check();
  }
}
