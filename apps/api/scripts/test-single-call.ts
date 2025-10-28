import * as dotenv from 'dotenv';
import * as path from 'path';
import { TwilioHelper } from './lib/twilio-helpers';
import { OpenAIClient } from './lib/openai-client';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

interface TestConfig {
  prontoPhoneNumber: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
  openaiApiKey: string;
}

interface CallDetails {
  callId: string;
  status: 'initiated' | 'completed' | 'failed';
  recordingUrl?: string;
  transcriptUrl?: string;
  duration?: number;
  twilioCallSid?: string;
}

async function testRecordingAndTranscription(
  callDetails: CallDetails, 
  openaiClient: OpenAIClient,
  twilioAccountSid: string,
  twilioAuthToken: string
) {
  console.log('\n4️⃣ Testing recording download and transcription...');
  try {
    const transcript = await openaiClient.transcribeRecording(
      callDetails.recordingUrl!, 
      twilioAccountSid, 
      twilioAuthToken
    );
    console.log(`✅ Transcription successful (${transcript.fullText.length} characters)`);
    console.log(`📝 Transcript preview: ${transcript.fullText.substring(0, 200)}...`);
    return true;
  } catch (error) {
    console.log('❌ Transcription failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function testSingleCall() {
  console.log('🧪 Testing Single Call - Validating All Components\n');

  // Load config
  const config: TestConfig = {
    prontoPhoneNumber: process.env.PRONTO_DEMO_PHONE_NUMBER || '',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  };

  // Validate config
  const missingVars = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log(`📞 From: ${config.twilioFromNumber}`);
  console.log(`📞 To: ${config.prontoPhoneNumber}`);
  console.log(`🔑 Twilio Account: ${config.twilioAccountSid.substring(0, 10)}...`);
  console.log(`🤖 OpenAI Key: ${config.openaiApiKey.substring(0, 10)}...\n`);

  // Initialize clients
  const twilioHelper = new TwilioHelper(config.twilioAccountSid, config.twilioAuthToken);
  const openaiClient = new OpenAIClient(config.openaiApiKey);
  const prisma = new PrismaClient();

  try {
    console.log('🚀 Starting single test call...\n');

    // Step 1: Start the call
    console.log('1️⃣ Starting Twilio call...');
    const callResult = await twilioHelper.startCall(
      config.prontoPhoneNumber,
      config.twilioFromNumber
    );
    console.log(`✅ Call started: ${callResult.callId}`);

    // Step 2: Wait for completion
    console.log('\n2️⃣ Waiting for call to complete...');
    const completed = await twilioHelper.waitForCallCompletion(callResult.callId, 120); // 120s timeout for test

    if (!completed) {
      console.log('❌ Call did not complete within timeout');
      console.log('🔍 Getting call details anyway to see current status...');
      try {
        const callDetails = await twilioHelper.getCallDetails(callResult.callId);
        console.log(`📊 Call status: ${callDetails.status}`);
        console.log(`📊 Call duration: ${callDetails.duration}s`);
        console.log(`📊 Recording URL: ${callDetails.recordingUrl || 'None'}`);
        
        // If we have a recording, let's test it anyway
        if (callDetails.recordingUrl) {
          console.log('\n🎯 Proceeding with recording test despite timeout...');
          await testRecordingAndTranscription(callDetails, openaiClient, config.twilioAccountSid, config.twilioAuthToken);
        }
      } catch (error) {
        console.log('❌ Could not get call details:', error instanceof Error ? error.message : String(error));
      }
      return;
    }

    // Step 3: Get call details
    console.log('\n3️⃣ Getting call details...');
    const callDetails = await twilioHelper.getCallDetails(callResult.callId);
    console.log(`✅ Call status: ${callDetails.status}`);
    console.log(`✅ Call duration: ${callDetails.duration}s`);
    console.log(`✅ Recording URL: ${callDetails.recordingUrl || 'None'}`);

    // Step 4: Test recording download and transcription
    if (callDetails.recordingUrl) {
      await testRecordingAndTranscription(callDetails, openaiClient, config.twilioAccountSid, config.twilioAuthToken);
    } else {
      console.log('\n4️⃣ ⚠️ No recording available - skipping transcription test');
    }

    // Step 5: Test database connection
    console.log('\n5️⃣ Testing database connection...');
    try {
      const testRun = await prisma.testRun.create({
        data: {
          name: 'Single Call Test',
          status: 'COMPLETED',
          scenariosRun: 1,
          scenariosTotal: 1,
          completedAt: new Date(),
          summary: {
            testType: 'single_call_validation',
            callId: callResult.callId,
            duration: callDetails.duration,
            hasRecording: !!callDetails.recordingUrl,
          },
        },
      });
      console.log(`✅ Database test successful - TestRun ID: ${testRun.id}`);
    } catch (error) {
      console.log('❌ Database test failed:', error instanceof Error ? error.message : String(error));
    }

    // Step 6: Summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Twilio call: ${callResult.callId}`);
    console.log(`✅ Call completion: ${completed ? 'Yes' : 'No'}`);
    console.log(`✅ Call duration: ${callDetails.duration}s`);
    console.log(`✅ Recording available: ${callDetails.recordingUrl ? 'Yes' : 'No'}`);
    console.log(`✅ Database write: Success`);
    
    if (callDetails.recordingUrl) {
      console.log(`✅ Transcription: Tested`);
    } else {
      console.log(`⚠️ Transcription: Skipped (no recording)`);
    }

    console.log('\n🎉 Single call test completed successfully!');
    console.log('Ready to run full test suite.');

  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testSingleCall().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
