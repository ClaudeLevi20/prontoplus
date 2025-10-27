import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { Telnyx } from 'telnyx';
import { LeadsService } from './leads.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';

/**
 * Service for handling Telnyx webhook events and call management
 * 
 * Provides integration with Telnyx API for:
 * - Webhook event processing
 * - Call record management
 * - Recording and transcript handling
 * - Security validation
 */
@Injectable()
export class TelnyxService {
  private readonly logger = new Logger(TelnyxService.name);
  private readonly telnyxClient: Telnyx;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private leadsService: LeadsService,
    private notificationsService: NotificationsService,
  ) {
    const apiKey = this.configService.get<string>('telnyx.apiKey');
    if (!apiKey) {
      this.logger.warn('Telnyx API key not configured');
    }
    
    this.telnyxClient = new Telnyx(apiKey);
  }

  /**
   * Handle incoming webhook events from Telnyx
   * 
   * @param payload - Raw webhook payload
   * @param signature - Webhook signature for verification
   * @returns Promise<void>
   */
  async handleWebhookEvent(payload: any, signature?: string): Promise<void> {
    try {
      // Verify webhook signature if provided
      if (signature && !this.verifyWebhookSignature(payload, signature)) {
        throw new BadRequestException('Invalid webhook signature');
      }

      const eventType = payload.meta?.event_type;
      this.logger.log(`Processing Telnyx webhook event: ${eventType}`);

      switch (eventType) {
        case 'call.initiated':
          await this.onCallInitiated(payload);
          break;
        case 'call.answered':
          await this.onCallAnswered(payload);
          break;
        case 'call.completed':
          await this.onCallCompleted(payload);
          break;
        case 'call.recording.saved':
          await this.onRecordingSaved(payload);
          break;
        case 'call.transcript.ready':
          await this.onTranscriptReady(payload);
          break;
        default:
          this.logger.debug(`Unhandled event type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error('Error handling webhook event', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   * 
   * @param payload - Webhook payload
   * @param signature - Signature from headers
   * @returns boolean
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const webhookSecret = this.configService.get<string>('telnyx.webhookSecret');
      if (!webhookSecret) {
        this.logger.warn('Webhook secret not configured, skipping verification');
        return true; // Allow in development
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
    } catch (error) {
      this.logger.error('Error verifying webhook signature', error);
      return false;
    }
  }

  /**
   * Handle call initiated event
   * 
   * @param event - Call initiated event payload
   * @returns Promise<void>
   */
  private async onCallInitiated(event: any): Promise<void> {
    try {
      const callData = event.data;
      
      const call = await this.prisma.call.create({
        data: {
          telnyxCallId: callData.id,
          telnyxCallControlId: callData.call_control_id,
          phoneNumber: callData.from,
          callerName: callData.from_display_name,
          direction: callData.direction === 'inbound' ? 'INBOUND' : 'OUTBOUND',
          status: 'INITIATED',
          callDuration: 0, // Will be updated when call completes
          startedAt: new Date(callData.created_at),
          metadata: callData,
        },
      });

      // Capture lead from caller information
      await this.leadsService.captureLeadFromCall(call.id, callData.from);

      // Slack notification will be sent after call completion with scoring

      this.logger.log(`Call initiated: ${call.id} (${call.telnyxCallId})`);
    } catch (error) {
      this.logger.error('Error handling call initiated event', error);
      throw error;
    }
  }

  /**
   * Handle call answered event
   * 
   * @param event - Call answered event payload
   * @returns Promise<void>
   */
  private async onCallAnswered(event: any): Promise<void> {
    try {
      const callData = event.data;
      
      await this.prisma.call.update({
        where: { telnyxCallId: callData.id },
        data: {
          status: 'ANSWERED',
          answeredAt: new Date(callData.answered_at),
        },
      });

      this.logger.log(`Call answered: ${callData.id}`);
    } catch (error) {
      this.logger.error('Error handling call answered event', error);
      throw error;
    }
  }

  /**
   * Handle call completed event
   * 
   * @param event - Call completed event payload
   * @returns Promise<void>
   */
  private async onCallCompleted(event: any): Promise<void> {
    try {
      const callData = event.data;
      
      const call = await this.prisma.call.findUnique({
        where: { telnyxCallId: callData.id },
        include: {
          demoLead: true,
        },
      });

      if (!call) {
        this.logger.warn(`Call not found for completed event: ${callData.id}`);
        return;
      }

      const callDuration = callData.duration_seconds || 0;
      
      const updatedCall = await this.prisma.call.update({
        where: { telnyxCallId: callData.id },
        data: {
          status: 'COMPLETED',
          callDuration,
          endedAt: new Date(callData.ended_at),
          metadata: { ...(call.metadata as any), ...callData },
        },
        include: {
          demoLead: true,
        },
      });

      // Capture and score lead if not already captured
      let lead = updatedCall.demoLead;
      if (!lead) {
        lead = await this.leadsService.captureAndScoreLead(
          call.id,
          {
            phone_number: call.phoneNumber,
            duration: updatedCall.callDuration,
            transcript: callData.transcript,
            sentiment_score: callData.sentiment?.score,
            topics_discussed: callData.topics || [],
          }
        );
      }

      // Send Slack notification if allowed
      const shouldNotify = await this.notificationsService.shouldSendNotification(lead.id);
      if (shouldNotify) {
        await this.notificationsService.sendLeadNotification(updatedCall, lead);
      }

      this.logger.log(`Call completed: ${callData.id} (${callDuration}s) - Lead Score: ${lead.leadScore}`);
    } catch (error) {
      this.logger.error('Error handling call completed event', error);
      throw error;
    }
  }

  /**
   * Handle recording saved event
   * 
   * @param event - Recording saved event payload
   * @returns Promise<void>
   */
  private async onRecordingSaved(event: any): Promise<void> {
    try {
      const recordingData = event.data;
      
      await this.prisma.call.update({
        where: { telnyxCallId: recordingData.call_id },
        data: {
          recordingUrl: recordingData.recording_urls?.mp3 || recordingData.recording_urls?.wav,
        },
      });

      this.logger.log(`Recording saved for call: ${recordingData.call_id}`);
    } catch (error) {
      this.logger.error('Error handling recording saved event', error);
      throw error;
    }
  }

  /**
   * Handle transcript ready event
   * 
   * @param event - Transcript ready event payload
   * @returns Promise<void>
   */
  private async onTranscriptReady(event: any): Promise<void> {
    try {
      const transcriptData = event.data;
      
      await this.prisma.call.update({
        where: { telnyxCallId: transcriptData.call_id },
        data: {
          transcriptUrl: transcriptData.transcript_url,
        },
      });

      this.logger.log(`Transcript ready for call: ${transcriptData.call_id}`);
    } catch (error) {
      this.logger.error('Error handling transcript ready event', error);
      throw error;
    }
  }

  /**
   * Get call details from Telnyx API
   * 
   * @param callId - Telnyx call ID
   * @returns Promise<any>
   */
  async getCallDetails(callId: string): Promise<any> {
    try {
      const call = await this.telnyxClient.calls.retrieve(callId);
      return call.data;
    } catch (error) {
      this.logger.error(`Error fetching call details for ${callId}`, error);
      throw error;
    }
  }

  /**
   * Get call recording from Telnyx API
   * 
   * @param callId - Telnyx call ID
   * @returns Promise<string | null>
   */
  async getCallRecording(callId: string): Promise<string | null> {
    try {
      // Note: This is a placeholder implementation
      // The actual Telnyx API structure may vary
      const recordings = await (this.telnyxClient as any).recordings.list({ call_id: callId });
      
      if (recordings.data && recordings.data.length > 0) {
        return recordings.data[0].recording_urls?.mp3 || recordings.data[0].recording_urls?.wav;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error fetching recording for call ${callId}`, error);
      throw error;
    }
  }

  /**
   * Check Telnyx API connectivity
   * 
   * @returns Promise<boolean>
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      // Simple connectivity check - try to list calls with limit 1
      await (this.telnyxClient as any).calls.list({ limit: 1 });
      return true;
    } catch (error) {
      this.logger.error('Telnyx API connectivity check failed', error);
      return false;
    }
  }
}
