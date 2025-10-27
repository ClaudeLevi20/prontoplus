import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { TelnyxService } from './telnyx.service';

/**
 * Controller for handling Telnyx webhook events
 * 
 * Provides secure webhook endpoint for Telnyx call events
 * with signature verification and async processing
 */
@ApiTags('webhooks')
@Controller('webhooks')
export class TelnyxWebhookController {
  private readonly logger = new Logger(TelnyxWebhookController.name);

  constructor(private readonly telnyxService: TelnyxService) {}

  /**
   * Handle Telnyx webhook events
   * 
   * @param payload - Webhook payload from Telnyx
   * @param headers - Request headers including signature
   * @returns Promise<{ success: boolean; message: string }>
   */
  @Post('telnyx')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle Telnyx webhook events',
    description: 'Endpoint for receiving webhook events from Telnyx for call management and analytics.',
  })
  @ApiHeader({
    name: 'telnyx-signature',
    description: 'HMAC-SHA256 signature for webhook verification',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Webhook processed successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or malformed payload',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Invalid webhook signature' },
      },
    },
  })
  async handleWebhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const signature = headers['telnyx-signature'] || headers['x-telnyx-signature'];
      
      // Process webhook asynchronously to avoid timeouts
      setImmediate(async () => {
        try {
          await this.telnyxService.handleWebhookEvent(payload, signature);
        } catch (error) {
          this.logger.error('Error processing webhook asynchronously', error);
        }
      });

      // Return immediately to prevent webhook timeouts
      return {
        success: true,
        message: 'Webhook received and queued for processing',
      };
    } catch (error) {
      this.logger.error('Error handling webhook', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      return {
        success: false,
        message: 'Error processing webhook',
      };
    }
  }
}
