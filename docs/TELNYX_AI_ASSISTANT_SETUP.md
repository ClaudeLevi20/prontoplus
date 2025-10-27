# Telnyx AI Assistant Configuration Guide

## Step 1: Create AI Assistant in Telnyx Portal

1. Navigate to: https://portal.telnyx.com/#/app/voice/ai-assistants
2. Click "Create AI Assistant"
3. Use the following configuration:

### Basic Settings:
- **Name:** `Pronto Demo Receptionist`
- **Phone Number:** Select your purchased number (e.g., +1-866-500-7760)
- **Language:** `English (United States)`

### Voice Settings:
- **Voice ID:** `professional_female_1` (or test alternatives)
- **Speed:** `1.0`
- **Pitch:** `1.0`

### AI Model Settings:
- **Provider:** `OpenAI`
- **Model ID:** `gpt-4-turbo`
- **Temperature:** `0.7`
- **Max Tokens:** `150` (keep responses concise)

### System Prompt:
Copy the entire contents from: `apps/api/src/data/ai-system-prompt.txt`

### Knowledge Base:
The knowledge base is in: `apps/api/src/data/ortho-knowledge-base.json`
- Telnyx Portal may not have a direct JSON upload
- Format the knowledge base as conversational instructions in the system prompt
- Or use the Telnyx API to upload programmatically

### Features:
- ✅ Call Recording: `Enabled`
- ✅ Transcription: `Enabled`
- ✅ Sentiment Analysis: `Enabled`
- ✅ Interrupt Enabled: `Yes`
- ✅ Response Timeout: `2000ms`

### Webhook Configuration:
- **Webhook URL:** `https://api-production-eb10.up.railway.app/webhooks/telnyx`
- **Webhook Events:** Select all events
- Enable webhook signature verification

### Fallback Settings:
- **Action:** `Transfer to Voicemail`
- **Message:** "I'm having trouble right now. Please leave a message and our team will call you back."

## Step 2: Link Phone Number

1. Navigate to: https://portal.telnyx.com/#/app/numbers
2. Select your phone number
3. Configure "Voice" settings:
   - **Inbound Call Handling:** `AI Assistant`
   - **Select Assistant:** `Pronto Demo Receptionist`
4. Save configuration

## Step 3: Test the Configuration

Call the number to test:
1. Verify AI answers professionally
2. Test greeting and tone
3. Test knowledge base responses
4. Verify webhook events are received

## Step 4: Get AI Assistant ID

After creation, copy the AI Assistant ID from the URL or details page.
Set it as an environment variable:

```bash
TELNYX_AI_ASSISTANT_ID=[paste-id-here]
```
