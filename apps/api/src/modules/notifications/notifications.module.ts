import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

/**
 * Notifications module for handling external notifications
 * 
 * Provides integration with external services for:
 * - Slack notifications
 * - Email alerts (future)
 * - SMS notifications (future)
 */
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
