import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TelnyxService } from './telnyx.service';
import { TelnyxWebhookController } from './telnyx.webhook.controller';
import { CallsController } from './calls.controller';
import { LeadsService } from './leads.service';

/**
 * Telnyx module for handling call management and webhook events
 * 
 * Provides integration with Telnyx API for:
 * - Webhook event processing
 * - Call record management
 * - Recording and transcript handling
 * - Lead capture and management
 * - Call analytics and reporting
 */
@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [TelnyxWebhookController, CallsController],
  providers: [TelnyxService, LeadsService],
  exports: [TelnyxService, LeadsService],
})
export class TelnyxModule {}
