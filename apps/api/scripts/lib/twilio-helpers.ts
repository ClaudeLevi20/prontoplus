/**
 * Twilio Integration Helpers for Test Calls
 * 
 * Provides wrapper functions for Twilio operations to make test calls
 * Test calls come from Twilio phone number to Telnyx AI Assistant
 */

import twilio from 'twilio';

export interface CallResult {
  callId: string;
  status: 'initiated' | 'completed' | 'failed';
  recordingUrl?: string;
  transcriptUrl?: string;
  duration?: number;
  twilioCallSid?: string;
  telnyxCallId?: string;
  telnyxCallControlId?: string;
}

export class TwilioHelper {
  private client: twilio.Twilio;

  constructor(accountSid: string, authToken: string) {
    this.client = twilio(accountSid, authToken);
  }

  /**
   * Start a test call to the Pronto Demo AI assistant
   * 
   * @param toNumber - The Telnyx AI assistant phone number
   * @param fromNumber - Twilio phone number to call from
   * @returns Promise<CallResult>
   */
  async startCall(
    toNumber: string,
    fromNumber: string
  ): Promise<CallResult> {
    try {
      console.log(`Starting Twilio call from ${fromNumber} to ${toNumber}`);
      
      // Make the call via Twilio to a phone number with call recording enabled
      const call = await this.client.calls.create({
        to: toNumber,
        from: fromNumber,
        record: true,
        recordingStatusCallback: 'https://example.com/recording-callback', // Optional callback
        twiml: '<Response><Dial><Number>' + toNumber + '</Number></Dial></Response>',
      });

      console.log(`Call started: ${call.sid}`);

      return {
        callId: call.sid,
        status: 'initiated',
        twilioCallSid: call.sid,
      };
    } catch (error) {
      console.error('Error starting call:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to start call: ${errorMessage}`);
    }
  }

  /**
   * Wait for a call to complete
   * 
   * @param callId - The Twilio call SID
   * @param maxWaitSeconds - Maximum time to wait in seconds (default: 120)
   * @returns Promise<boolean> - true if completed, false if timed out
   */
  async waitForCallCompletion(
    callId: string,
    maxWaitSeconds: number = 120
  ): Promise<boolean> {
    const pollInterval = 2000; // 2 seconds
    const maxPolls = Math.floor(maxWaitSeconds * 1000 / pollInterval);
    
    for (let i = 0; i < maxPolls; i++) {
      try {
        const call = await this.client.calls(callId).fetch();
        
        if (call.status === 'completed' || call.status === 'busy' || call.status === 'failed' || call.status === 'no-answer') {
          console.log(`Call ${callId} completed with status: ${call.status}`);
          return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Error checking call status:', error);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    console.log(`Call ${callId} timed out after ${maxWaitSeconds} seconds`);
    return false;
  }

  /**
   * Get call details including recording URL
   * 
   * @param callId - The Twilio call SID
   * @returns Promise<CallResult>
   */
  async getCallDetails(callId: string): Promise<CallResult> {
    try {
      const call = await this.client.calls(callId).fetch();
      
      // Get recordings if available
      let recordingUrl: string | undefined;
      try {
        const recordings = await this.client.recordings.list({ callSid: callId });
        
        if (recordings && recordings.length > 0) {
          // Use the mediaUrl property directly, ensuring it has .mp3 extension
          recordingUrl = recordings[0].mediaUrl;
          if (!recordingUrl.endsWith('.mp3')) {
            recordingUrl += '.mp3';
          }
        }
      } catch (error) {
        console.log('No recordings available for call:', error instanceof Error ? error.message : String(error));
      }

      return {
        callId,
        status: (call.status === 'completed' || call.status === 'failed') ? 'completed' : 'initiated',
        recordingUrl,
        duration: call.duration ? parseInt(call.duration) : 0,
        twilioCallSid: call.sid,
      };
    } catch (error) {
      console.error('Error getting call details:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get call details: ${errorMessage}`);
    }
  }

  /**
   * Hang up a call
   * 
   * @param callId - The Twilio call SID
   */
  async hangupCall(callId: string): Promise<void> {
    try {
      await this.client.calls(callId).update({ status: 'completed' });
      console.log(`Call ${callId} hung up`);
    } catch (error) {
      console.error('Error hanging up call:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to hang up call: ${errorMessage}`);
    }
  }
}
