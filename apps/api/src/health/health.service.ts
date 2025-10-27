import { Injectable, Logger } from '@nestjs/common';
import { ConfigCatService } from '../config-cat/config-cat.service';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../cache/redis.service';
import { TelnyxService } from '../modules/telnyx/telnyx.service';
import { NotificationsService } from '../modules/notifications/notifications.service';

/**
 * Service for comprehensive health checks
 * 
 * Provides health status for all critical services including:
 * - Database connectivity
 * - Redis connectivity  
 * - Feature flags service
 * - API uptime and version
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private configCatService: ConfigCatService,
    private prismaService: PrismaService,
    private redisService: RedisService,
    private telnyxService: TelnyxService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Perform comprehensive health check of all services
   * 
   * @returns Promise<HealthCheckResponse>
   */
  async check() {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();

    try {
      // Check all services in parallel
      const [databaseHealth, redisHealth, featureFlagsHealth, telnyxHealth, slackHealth] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkFeatureFlags(),
        this.checkTelnyx(),
        this.checkSlack(),
      ]);

      const responseTime = Date.now() - startTime;

      // Determine overall health status
      const services = {
        database: this.getServiceStatus(databaseHealth),
        redis: this.getServiceStatus(redisHealth),
        featureFlags: this.getServiceStatus(featureFlagsHealth),
        telnyx: this.getServiceStatus(telnyxHealth),
        slack: this.getServiceStatus(slackHealth),
      };

      const overallStatus = this.determineOverallStatus(services);

      return {
        status: overallStatus,
        timestamp,
        service: 'ProntoPlus API',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        services,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      
      return {
        status: 'error',
        timestamp,
        service: 'ProntoPlus API',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        error: error instanceof Error ? error.message : String(error),
        services: {
          database: { status: 'unknown', message: 'Health check failed' },
          redis: { status: 'unknown', message: 'Health check failed' },
          featureFlags: { status: 'unknown', message: 'Health check failed' },
          telnyx: { status: 'unknown', message: 'Health check failed' },
          slack: { status: 'unknown', message: 'Health check failed' },
        },
      };
    }
  }

  /**
   * Check database connectivity and performance
   * 
   * @returns Promise<ServiceHealth>
   */
  private async checkDatabase(): Promise<ServiceHealth> {
    try {
      const startTime = Date.now();
      
      // Simple query to test connectivity
      await this.prismaService.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'Database connection successful',
        responseTime: `${responseTime}ms`,
        details: {
          provider: 'postgresql',
          connected: true,
        },
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      
      return {
        status: 'unhealthy',
        message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          provider: 'postgresql',
          connected: false,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Check Redis connectivity and performance
   * 
   * @returns Promise<ServiceHealth>
   */
  private async checkRedis(): Promise<ServiceHealth> {
    try {
      const startTime = Date.now();
      
      // Test Redis connectivity with ping
      const isConnected = await this.redisService.ping();
      
      const responseTime = Date.now() - startTime;
      
      if (isConnected) {
        return {
          status: 'healthy',
          message: 'Redis connection successful',
          responseTime: `${responseTime}ms`,
          details: {
            connected: true,
            ping: 'PONG',
          },
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Redis ping failed',
          details: {
            connected: false,
            ping: 'FAILED',
          },
        };
      }
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      
      return {
        status: 'unhealthy',
        message: `Redis connection failed: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          connected: false,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Check feature flags service connectivity
   * 
   * @returns Promise<ServiceHealth>
   */
  private async checkFeatureFlags(): Promise<ServiceHealth> {
    try {
      const startTime = Date.now();
      
      // Test feature flags service
      const featureFlags = await this.configCatService.getAllFeatureFlags();
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'Feature flags service accessible',
        responseTime: `${responseTime}ms`,
        details: {
          connected: true,
          flagsCount: Object.keys(featureFlags).length,
          flags: featureFlags,
        },
      };
    } catch (error) {
      this.logger.error('Feature flags health check failed', error);
      
      return {
        status: 'unhealthy',
        message: `Feature flags service failed: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          connected: false,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Extract service status from Promise.allSettled result
   * 
   * @param result - Promise.allSettled result
   * @returns ServiceHealth
   */
  private getServiceStatus(result: PromiseSettledResult<ServiceHealth>): ServiceHealth {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        status: 'unhealthy',
        message: `Service check failed: ${result.reason?.message || 'Unknown error'}`,
        details: {
          error: result.reason?.message || 'Unknown error',
        },
      };
    }
  }

  /**
   * Check Telnyx API connectivity
   * 
   * @returns Promise<ServiceHealth>
   */
  private async checkTelnyx(): Promise<ServiceHealth> {
    try {
      const startTime = Date.now();
      
      const isConnected = await this.telnyxService.checkConnectivity();
      
      const responseTime = Date.now() - startTime;
      
      if (isConnected) {
        return {
          status: 'healthy',
          message: 'Telnyx API connection successful',
          responseTime: `${responseTime}ms`,
          details: {
            connected: true,
            apiKey: 'configured',
          },
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Telnyx API connection failed',
          details: {
            connected: false,
            apiKey: 'not configured or invalid',
          },
        };
      }
    } catch (error) {
      this.logger.error('Telnyx health check failed', error);
      
      return {
        status: 'unhealthy',
        message: `Telnyx API check failed: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          connected: false,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Check Slack webhook connectivity
   * 
   * @returns Promise<ServiceHealth>
   */
  private async checkSlack(): Promise<ServiceHealth> {
    try {
      const startTime = Date.now();
      
      const isConnected = await this.notificationsService.checkConnectivity();
      
      const responseTime = Date.now() - startTime;
      
      if (isConnected) {
        return {
          status: 'healthy',
          message: 'Slack webhook connection successful',
          responseTime: `${responseTime}ms`,
          details: {
            connected: true,
            webhookUrl: 'configured',
          },
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Slack webhook connection failed',
          details: {
            connected: false,
            webhookUrl: 'not configured or invalid',
          },
        };
      }
    } catch (error) {
      this.logger.error('Slack health check failed', error);
      
      return {
        status: 'unhealthy',
        message: `Slack webhook check failed: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          connected: false,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Determine overall health status based on individual services
   * 
   * @param services - Individual service health statuses
   * @returns 'healthy' | 'degraded' | 'unhealthy'
   */
  private determineOverallStatus(services: Record<string, ServiceHealth>): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(services).map(service => service.status);
    
    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    } else if (statuses.some(status => status === 'unhealthy')) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }
}

/**
 * Interface for individual service health status
 */
export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  responseTime?: string;
  details?: Record<string, any>;
}
