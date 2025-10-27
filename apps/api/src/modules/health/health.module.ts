import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from '../../health/health.service';
import { DatabaseModule } from '../../database/database.module';
import { RedisModule } from '../../cache/redis.module';
import { ConfigCatModule } from '../../config-cat/config-cat.module';
import { TelnyxModule } from '../telnyx/telnyx.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TerminusModule,
    DatabaseModule,
    RedisModule,
    ConfigCatModule,
    TelnyxModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
