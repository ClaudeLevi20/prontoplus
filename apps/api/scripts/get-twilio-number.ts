#!/usr/bin/env ts-node

/**
 * Get Twilio phone numbers
 */

import twilio from 'twilio';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function getTwilioNumbers() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.error('Error: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
    process.exit(1);
  }

  console.log(`Using Account SID: ${accountSid}`);
  console.log(`Using Auth Token: ${authToken.substring(0, 10)}...`);
  
  const client = twilio(accountSid, authToken);

  try {
    console.log('📞 Fetching Twilio phone numbers...\n');
    const incomingPhoneNumbers = await client.incomingPhoneNumbers.list();
    
    if (incomingPhoneNumbers.length === 0) {
      console.log('No phone numbers found in your Twilio account.');
      return;
    }

    console.log(`Found ${incomingPhoneNumbers.length} phone number(s):\n`);
    
    incomingPhoneNumbers.forEach((number, index) => {
      console.log(`${index + 1}. Phone Number: ${number.phoneNumber}`);
      console.log(`   Friendly Name: ${number.friendlyName || 'N/A'}`);
      console.log(`   SID: ${number.sid}`);
      console.log(`   Capabilities: SMS: ${number.capabilities.sms ? '✅' : '❌'}, Voice: ${number.capabilities.voice ? '✅' : '❌'}\n`);
    });

    // Use the first number as the from number
    const primaryNumber = incomingPhoneNumbers[0].phoneNumber;
    console.log(`\n💡 Using ${primaryNumber} as the default FROM number for test calls.`);
    console.log(`\nAdd this to your .env.local file:`);
    console.log(`TWILIO_FROM_NUMBER=${primaryNumber}`);
    
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    process.exit(1);
  }
}

getTwilioNumbers();
