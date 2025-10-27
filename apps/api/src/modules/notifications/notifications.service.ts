import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IncomingWebhook } from '@slack/webhook';
import { Call, DemoLead } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

/**
 * Service for sending notifications via Slack
 * 
 * Provides integration with Slack webhooks for:
 * - Call notifications
 * - Lead alerts
 * - System status updates
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly slackWebhook: IncomingWebhook | null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const webhookUrl = this.configService.get<string>('slack.webhookUrl');
    
    if (webhookUrl) {
      this.slackWebhook = new IncomingWebhook(webhookUrl);
      this.logger.log('Slack webhook configured');
    } else {
      this.slackWebhook = null;
      this.logger.warn('Slack webhook URL not configured');
    }
  }

  /**
   * Send lead notification with scoring and rich formatting
   * 
   * @param call - Call record
   * @param lead - Lead record with scoring
   * @returns Promise<void>
   */
  async sendLeadNotification(
    call: Call, 
    lead: DemoLead
  ): Promise<void> {
    if (!this.slackWebhook) return;

    // Determine urgency
    const isHot = lead.leadScore >= 75;
    const emoji = isHot ? '🔥' : lead.leadScore >= 50 ? '⚡' : '❄️';
    const headerText = isHot 
      ? '🔥 HOT LEAD - Immediate Follow-Up Required!'
      : lead.leadScore >= 50
      ? '⚡ WARM LEAD - Follow Up Within 24 Hours'
      : '❄️ COLD LEAD - Add to Nurture Campaign';

    const message = {
      text: `${emoji} New Demo Lead - Score: ${lead.leadScore}/100`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: headerText,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Phone:*\n${lead.callerPhone || 'Unknown'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Lead Score:*\n${lead.leadScore}/100`,
            },
            {
              type: 'mrkdwn',
              text: `*Quality:*\n${lead.leadQuality}`,
            },
            {
              type: 'mrkdwn',
              text: `*Call Duration:*\n${Math.floor(call.callDuration / 60)}m ${call.callDuration % 60}s`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Engagement Indicators:*\n${
              lead.mentionedPricing ? '💰 Asked about pricing\n' : ''
            }${
              lead.mentionedInsurance ? '🏥 Asked about insurance\n' : ''
            }${
              lead.mentionedScheduling ? '📅 Interested in scheduling\n' : ''
            }${
              lead.sentimentScore && lead.sentimentScore > 0.7 
                ? '😊 Very positive sentiment\n' 
                : ''
            }`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Topics Discussed:*\n${
              lead.questionsAsked.length > 0
                ? lead.questionsAsked.map(t => `• ${t}`).join('\n')
                : '• No specific topics captured'
            }`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🎧 Listen to Recording',
              },
              url: call.recordingUrl || '#',
              style: 'primary',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📊 View Dashboard',
              },
              url: `${process.env.FRONTEND_URL}/admin/calls`,
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📞 Call Back',
              },
              url: `tel:${lead.callerPhone}`,
            },
          ],
        },
      ],
    };

    // Mention @channel for hot leads only
    if (isHot) {
      message.text = `<!channel> ${message.text}`;
    }

    await this.slackWebhook.send(message);

    // Log notification
    await this.prisma.notificationLog.create({
      data: {
        leadId: lead.id,
        type: 'slack',
        channel: 'pronto-demo-leads',
        recipient: isHot ? '@channel' : 'general',
        message: message.text,
        status: 'sent',
        deliveredAt: new Date(),
      },
    });
  }

  /**
   * Check if notification should be sent (throttling)
   * 
   * @param leadId - Lead ID
   * @returns Promise<boolean>
   */
  async shouldSendNotification(leadId: string): Promise<boolean> {
    // Check if notification was sent in last 24 hours
    const recentNotification = await this.prisma.notificationLog.findFirst({
      where: {
        leadId,
        sentAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        status: 'sent',
      },
    });

    // Check time of day (don't notify 10pm-8am)
    const hour = new Date().getHours();
    const isQuietHours = hour >= 22 || hour < 8;

    return !recentNotification && !isQuietHours;
  }

  /**
   * Send call completed notification
   * 
   * @param call - Call record
   * @param lead - Lead record (if available)
   * @returns Promise<void>
   */
  async sendCallCompletedNotification(call: Call, lead?: DemoLead): Promise<void> {
    if (!this.slackWebhook) {
      this.logger.debug('Slack webhook not configured, skipping notification');
      return;
    }

    try {
      const duration = Math.floor(call.callDuration / 60); // Convert to minutes
      const durationText = duration > 0 ? `${duration}m ${call.callDuration % 60}s` : `${call.callDuration}s`;

      const message = {
        text: '✅ Demo Call Completed',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '✅ Demo Call Completed',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                name: 'Caller',
                text: call.phoneNumber || 'Unknown',
              },
              {
                type: 'mrkdwn',
                name: 'Duration',
                text: `*${durationText}*`,
              },
              {
                type: 'mrkdwn',
                name: 'Status',
                text: `*${call.status}*`,
              },
              {
                type: 'mrkdwn',
                name: 'Ended At',
                text: call.endedAt ? `<!date^${Math.floor(call.endedAt.getTime() / 1000)}^{date} at {time}|${call.endedAt.toISOString()}>` : 'Unknown',
              },
            ],
          },
        ],
      };

      // Add recording link if available
      if (call.recordingUrl) {
        message.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Recording:* <${call.recordingUrl}|Listen to Call>`,
          },
        });
      }

      // Add transcript link if available
      if (call.transcriptUrl) {
        message.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Transcript:* <${call.transcriptUrl}|Read Transcript>`,
          },
        });
      }

      // Add lead summary if available
      if (lead && lead.captured) {
        const interestLevel = lead.interestLevel ? `*${lead.interestLevel}*` : 'Not set';
        message.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Lead Summary:*\n• Interest Level: ${interestLevel}\n• Name: ${lead.name || 'Not provided'}\n• Practice: ${lead.practiceName || 'Not provided'}\n• Email: ${lead.email || 'Not provided'}`,
          },
        });
      }

      await this.slackWebhook.send(message);
      this.logger.log(`Call completed notification sent for call ${call.id}`);
    } catch (error) {
      this.logger.error('Error sending call completed notification', error);
      throw error;
    }
  }

  /**
   * Send system alert notification
   * 
   * @param title - Alert title
   * @param message - Alert message
   * @param severity - Alert severity
   * @returns Promise<void>
   */
  async sendSystemAlert(title: string, message: string, severity: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    if (!this.slackWebhook) {
      this.logger.debug('Slack webhook not configured, skipping alert');
      return;
    }

    try {
      const emoji = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '🚨',
      }[severity];

      const color = {
        info: '#36a64f',
        warning: '#ff9500',
        error: '#ff0000',
      }[severity];

      const slackMessage = {
        text: `${emoji} ${title}`,
        attachments: [
          {
            color,
            fields: [
              {
                title: 'Message',
                value: message,
                short: false,
              },
              {
                title: 'Timestamp',
                value: new Date().toISOString(),
                short: true,
              },
            ],
          },
        ],
      };

      await this.slackWebhook.send(slackMessage);
      this.logger.log(`System alert sent: ${title}`);
    } catch (error) {
      this.logger.error('Error sending system alert', error);
      throw error;
    }
  }

  /**
   * Check Slack webhook connectivity
   * 
   * @returns Promise<boolean>
   */
  async checkConnectivity(): Promise<boolean> {
    if (!this.slackWebhook) {
      return false;
    }

    try {
      // Send a test message to verify connectivity
      await this.slackWebhook.send({
        text: '🔧 Slack webhook connectivity test',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'This is a connectivity test from ProntoPlus API.',
            },
          },
        ],
      });
      return true;
    } catch (error) {
      this.logger.error('Slack webhook connectivity check failed', error);
      return false;
    }
  }
}
