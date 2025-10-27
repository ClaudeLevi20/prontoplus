/**
 * Telnyx Integration Helpers
 * 
 * Provides wrapper functions for Telnyx operations
 */

import { Telnyx } from 'telnyx';

export interface CallResult {
  callId: string;
  status: 'initiated' | 'completed' | 'failed';
  recordingUrl?: string;
  transcriptUrl?: string;
  duration?: number;
  telnyxCallId?: string;
  telnyxCallControlId?: string;
}

export interface CallLogs {
  timestamp: string;
  level: string;
  message: string;
}

export class TelnyxHelper {
  private client: Telnyx;

  constructor(apiKey: string) {
    this.client = new Telnyx(apiKey);
  }

  /**
   * Start a test call to the Pronto Demo AI assistant
   * Uses Telnyx Call Control to initiate the call
   * 
   * @param prontoPhoneNumber - The AI assistant phone number
   * @param fromNumber - Number to call from
   * @param callControlAppId - Call Control Application ID
   * @returns Promise<CallResult>
   */
  async startCall(
    prontoPhoneNumber: string,
    fromNumber: string,
    callControlAppId: string
  ): Promise<CallResult> {
    try {
      console.log(`Starting call from ${fromNumber} to ${prontoPhoneNumber}`);
      
      const response = await this.client.calls.create({
        connection_id: callControlAppId,
        to: prontoPhoneNumber,
        from: fromNumber,
      } as any);

      const callControlId = response.data.call_control_id;
      const callId = response.data.call_session_id || response.data.call_leg_id;

      console.log(`Call started: ${callId}`);

      return {
        callId,
        status: 'initiated',
        telnyxCallId: callId,
        telnyxCallControlId: callControlId,
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
   * @param callId - The call ID to wait for
   * @param maxWaitSeconds - Maximum time to wait in seconds (default: 120)
   * @returns Promise<boolean> - true if completed, false if timed out
   */
  async waitForCallCompletion(
    callId: string,
    maxWaitSeconds: number = 120
  ): Promise<boolean> {
    const pollInterval = 5000; // 5 seconds
    const maxPolls = Math.floor(maxWaitSeconds * 1000 / pollInterval);
    
    for (let i = 0; i < maxPolls; i++) {
      try {
        const call = await this.client.calls.retrieve(callId);
        const isAlive = call.data.is_alive;
        
        if (!isAlive) {
          console.log(`Call ${callId} completed`);
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
   * Get call details including recording and transcript URLs
   * 
   * @param callId - The call ID
   * @returns Promise<CallResult>
   */
  async getCallDetails(callId: string): Promise<CallResult> {
    try {
      const call = await this.client.calls.retrieve(callId);
      const data = call.data;
      
      // Get recordings if available
      let recordingUrl: string | undefined;
      try {
        const recordings = await (this.client as any).recordings.list({ 
          call_id: callId 
        });
        
        if (recordings.data && recordings.data.length > 0) {
          recordingUrl = recordings.data[0].recording_urls?.mp3 || 
                        recordings.data[0].recording_urls?.wav;
        }
      } catch (error) {
        console.log('No recordings available for call');
      }

      return {
        callId,
        status: data.is_alive ? 'initiated' : 'completed',
        recordingUrl,
        duration: data.call_duration || 0,
        telnyxCallId: callId,
        telnyxCallControlId: data.call_control_id,
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
   * @param callControlId - The call control ID
   */
  async hangupCall(callControlId: string): Promise<void> {
    try {
      // Use the hangup method directly
      await (this.client.calls as any).hangup(callControlId);
      console.log(`Call ${callControlId} hung up`);
    } catch (error) {
      console.error('Error hanging up call:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to hang up call: ${errorMessage}`);
    }
  }

  /**
   * List all call control applications
   * 
   * @returns Promise<any[]>
   */
  async listCallControlApplications(): Promise<any[]> {
    try {
      const apps = await (this.client as any).callControlApplications.list();
      return apps.data || [];
    } catch (error) {
      console.error('Error listing call control applications:', error);
      return [];
    }
  }
}

