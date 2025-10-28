import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './cache/redis.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { PracticesModule } from './modules/practices/practices.module';
import { DemoModule } from './modules/demo/demo.module';
import { TelnyxModule } from './modules/telnyx/telnyx.module';
import { TestModule } from './modules/test/test.module';
import { ConfigCatModule } from './config-cat/config-cat.module';
import { loggerConfig } from './common/logger/logger.config';
import { validate } from './config/env.validation';
// Force deployment 3

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    WinstonModule.forRoot(loggerConfig),
    ConfigCatModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
    UsersModule,
    PracticesModule,
    DemoModule,
    TelnyxModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
