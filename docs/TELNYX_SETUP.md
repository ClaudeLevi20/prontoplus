# Telnyx AI Assistant Setup Guide

This guide will walk you through setting up Telnyx AI Assistant for ProntoPlus demo calls.

## Prerequisites

- Telnyx account (sign up at [telnyx.com](https://telnyx.com))
- ProntoPlus application deployed
- Slack workspace for notifications (optional)

## Step 1: Create Telnyx Account

1. Visit [telnyx.com](https://telnyx.com) and sign up for a free account
2. Complete account verification
3. Navigate to the Telnyx Portal dashboard

## Step 2: Provision Phone Number

1. In the Telnyx Portal, go to **Phone Numbers** → **Buy Numbers**
2. Select your preferred area code and country
3. Choose a phone number (US numbers cost ~$2/month)
4. Purchase the number

## Step 3: Get API Credentials

1. Go to **Settings** → **API Authentication**
2. Create a new API key with the following permissions:
   - `call_control:read`
   - `call_control:write`
   - `calls:read`
   - `recordings:read`
3. Copy the API key (starts with `KEY...`)
4. Also note your **API V2 Key** from the same page

## Step 4: Configure AI Assistant

1. In the Telnyx Portal, go to **AI Assistant** → **Create Assistant**
2. Fill in the assistant details:
   - **Name**: ProntoPlus Demo Assistant
   - **Description**: AI receptionist for orthodontic practice demos
   - **Language**: English (US)
   - **Voice**: Choose a professional voice (e.g., "Alloy" or "Nova")

3. **Configure the Assistant**:
   - **Greeting**: "Hello! Thank you for calling ProntoPlus. I'm your AI receptionist. How can I help you today?"
   - **Instructions**: Use the orthodontic knowledge base to answer questions about appointments, services, and practice information
   - **Ending**: "Thank you for calling ProntoPlus. Have a great day!"

## Step 5: Upload Knowledge Base

Create a comprehensive knowledge base for orthodontic practices:

### Sample Knowledge Base Content

```
# ProntoPlus AI Receptionist Knowledge Base

## Practice Information
- ProntoPlus is an AI-powered receptionist service for orthodontic practices
- We help streamline appointment scheduling, patient communication, and practice management
- Our service is available 24/7 and integrates with existing practice management systems

## Services Offered
- Appointment scheduling and rescheduling
- Patient reminders via SMS and email
- Waitlist management
- Insurance verification
- Treatment plan coordination
- Emergency appointment handling

## Common Questions

### Appointment Scheduling
Q: How do I schedule an appointment?
A: I can help you schedule an appointment. What type of appointment do you need? (consultation, adjustment, emergency, etc.)

Q: Can I reschedule my appointment?
A: Yes, I can help you reschedule. What's your current appointment date and time?

Q: Do you have any emergency appointments available?
A: We do accommodate emergency appointments. Let me check our availability for urgent cases.

### Insurance and Billing
Q: Do you accept my insurance?
A: We accept most major insurance plans. I can verify your coverage if you provide your insurance information.

Q: What are your payment options?
A: We accept cash, check, credit cards, and offer payment plans for treatment.

### Treatment Information
Q: How long does orthodontic treatment take?
A: Treatment duration varies by individual case, typically ranging from 12-24 months for comprehensive treatment.

Q: What types of braces do you offer?
A: We offer traditional metal braces, ceramic braces, and clear aligner options like Invisalign.

### Practice Hours and Location
Q: What are your office hours?
A: Our office is open Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM. We're closed Sundays.

Q: Where are you located?
A: We're located at [Your Practice Address]. Would you like directions?

## Lead Capture Script
When a caller shows interest in scheduling or learning more:
1. Collect their name and phone number
2. Ask about their specific orthodontic needs
3. Offer to schedule a consultation
4. Provide practice contact information
5. Thank them for their interest

## Escalation Procedures
If the AI cannot handle a complex request:
1. Apologize for the limitation
2. Offer to transfer to a human staff member
3. Provide alternative contact methods
4. Schedule a callback if needed
```

## Step 6: Configure Webhooks

1. In the Telnyx Portal, go to **Webhooks** → **Create Webhook**
2. Set the webhook URL to: `https://your-domain.com/webhooks/telnyx`
3. Select the following events:
   - `call.initiated`
   - `call.answered`
   - `call.completed`
   - `call.recording.saved`
   - `call.transcript.ready`
4. Generate a webhook secret and save it securely

## Step 7: Set Up Slack Notifications (Optional)

1. In your Slack workspace, go to **Apps** → **Incoming Webhooks**
2. Create a new webhook for your desired channel
3. Copy the webhook URL
4. Add the URL to your ProntoPlus environment variables

## Step 8: Configure Environment Variables

Add the following environment variables to your ProntoPlus deployment:

```bash
# Telnyx Configuration
TELNYX_API_KEY=KEY_your_api_key_here
TELNYX_API_V2_KEY=your_v2_key_here
TELNYX_PHONE_NUMBER=+1234567890
TELNYX_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_DEMO_PHONE_NUMBER=+1 (555) 123-4567

# Slack Configuration (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
```

## Step 9: Test the Integration

1. **Test Webhook Delivery**:
   - Use ngrok or similar tool to expose your local webhook endpoint
   - Update the webhook URL in Telnyx Portal temporarily
   - Make a test call to verify webhook events are received

2. **Test Call Flow**:
   - Call your Telnyx phone number
   - Verify the AI assistant answers appropriately
   - Test various scenarios (appointment requests, general questions)
   - Check that call records are created in your database

3. **Test Notifications**:
   - Verify Slack notifications are sent when calls are initiated/completed
   - Check that lead information is captured correctly

## Step 10: Monitor and Optimize

1. **Review Call Analytics**:
   - Monitor call completion rates
   - Analyze common questions and responses
   - Track lead capture success rates

2. **Optimize Knowledge Base**:
   - Add frequently asked questions
   - Refine responses based on caller feedback
   - Update practice-specific information

3. **Fine-tune AI Assistant**:
   - Adjust voice and speaking pace
   - Modify greeting and ending messages
   - Update escalation procedures

## Troubleshooting

### Common Issues

**Webhook Not Receiving Events**:
- Verify webhook URL is accessible from the internet
- Check webhook secret configuration
- Ensure webhook events are properly selected

**AI Assistant Not Responding**:
- Verify phone number is properly configured
- Check AI Assistant is active and published
- Ensure knowledge base is uploaded and active

**Call Records Not Created**:
- Check database connection
- Verify webhook signature validation
- Review application logs for errors

**Slack Notifications Not Working**:
- Verify Slack webhook URL is correct
- Check webhook permissions in Slack
- Ensure environment variable is set correctly

### Support Resources

- [Telnyx Documentation](https://developers.telnyx.com/)
- [Telnyx AI Assistant Guide](https://developers.telnyx.com/docs/api/v2/ai-assistant)
- [Webhook Configuration](https://developers.telnyx.com/docs/api/v2/webhooks)

## Security Considerations

1. **Webhook Security**:
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Implement rate limiting

2. **API Key Management**:
   - Store API keys securely
   - Rotate keys regularly
   - Use environment variables, never hardcode

3. **Data Privacy**:
   - Ensure HIPAA compliance for patient data
   - Implement proper data encryption
   - Regular security audits

## Next Steps

Once your Telnyx integration is working:

1. **Customize for Your Practice**:
   - Update knowledge base with practice-specific information
   - Customize AI assistant personality and responses
   - Configure practice hours and contact information

2. **Integrate with Practice Management**:
   - Connect to your existing PMS system
   - Set up automated appointment scheduling
   - Configure patient communication workflows

3. **Scale and Optimize**:
   - Monitor performance metrics
   - A/B test different approaches
   - Continuously improve based on feedback

For additional support, contact the ProntoPlus development team or refer to the main documentation.
