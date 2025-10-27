# Phase 2 Launch - Next Steps Guide

**Status:** Ready for Final Configuration & Deployment  
**Date:** October 27, 2025  
**Estimated Time to Launch:** 30-45 minutes

---

## 🎯 Overview

Phase 2 implementation is **95% complete**. All code has been written, tested, and is ready for production deployment. This guide walks you through the final steps to launch the Pronto Demo AI receptionist.

---

## ⚠️ Prerequisites Checklist

Before starting, ensure you have:

- [ ] Access to Telnyx Portal (https://portal.telnyx.com)
- [ ] Access to Railway Dashboard (for deployment)
- [ ] Access to ConfigCat Dashboard (for feature flags)
- [ ] Real Slack webhook URL (replace placeholder)
- [ ] 30-45 minutes of uninterrupted time

---

## 🚀 Launch Steps

### Step 1: Update Slack Webhook URL (5 minutes)

**Why:** The current Slack webhook is a placeholder and needs to be replaced with your real webhook.

**Actions:**

1. **Create Slack Incoming Webhook:**
   - Go to your Slack workspace
   - Navigate to: https://api.slack.com/messaging/webhooks
   - Click "Create your Slack app"
   - Choose "From scratch"
   - Name: "ProntoPlus Notifications"
   - Select your workspace
   - Go to "Incoming Webhooks" → Enable
   - Click "Add New Webhook to Workspace"
   - Select channel: `#pronto-demo-leads` (create if needed)
   - Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)

2. **Update Railway Environment Variable:**
   ```bash
   # Via Railway CLI (if linked to project)
   railway variables set SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   
   # OR via Railway Dashboard
   # Go to: Railway Dashboard → prontoplus → api service → Variables
   # Edit SLACK_WEBHOOK_URL variable
   # Paste your real webhook URL
   # Click "Save"
   ```

3. **Redeploy API service** (Railway will auto-deploy if using dashboard, or manually redeploy)

---

### Step 2: Configure Telnyx AI Assistant (15-20 minutes)

**Why:** The Telnyx AI Assistant must be manually configured via their Portal UI.

**Actions:**

1. **Navigate to Telnyx Portal:**
   - URL: https://portal.telnyx.com/#/app/voice/ai-assistants
   - Log in with your Telnyx account

2. **Create New AI Assistant:**
   - Click **"Create AI Assistant"** (or "+ New Assistant")

3. **Basic Configuration:**
   ```
   Name: Pronto Demo Receptionist
   Description: AI receptionist for orthodontic practice demos
   Phone Number: +1-866-500-7760
   Language: English (United States)
   ```

4. **Voice Settings:**
   ```
   Voice: Select "Professional Female" voice (or test alternatives)
   Speed: 1.0 (normal)
   Pitch: 1.0 (normal)
   ```

5. **AI Model Settings:**
   ```
   Provider: OpenAI
   Model: GPT-4 Turbo (or latest available)
   Temperature: 0.7 (balanced creativity/consistency)
   Max Tokens: 150 (keeps responses concise)
   ```

6. **System Prompt:**
   - Open file: `apps/api/src/data/ai-system-prompt.txt`
   - **Copy entire contents** (all 65 lines)
   - Paste into the "System Prompt" or "Instructions" field
   - Replace `[PRACTICE_NAME]` with `ProntoPlus` (should be done automatically by script, but verify)

7. **Knowledge Base Integration:**
   
   **Option A: Embed in System Prompt (Recommended)**
   - Use the script to generate combined prompt:
     ```bash
     cd /Users/claudelevi/ProntoPlus
     node scripts/format-ai-prompt.js > combined-prompt.txt
     ```
   - Copy the output and paste as system prompt
   
   **Option B: Manual Integration**
   - Open: `apps/api/src/data/ortho-knowledge-base.json`
   - Convert key Q&A pairs to conversational format
   - Append to system prompt as reference material

8. **Features Configuration:**
   ```
   ✓ Call Recording: Enabled
   ✓ Transcription: Enabled
   ✓ Sentiment Analysis: Enabled (if available)
   ✓ Interrupt Detection: Enabled
   Response Timeout: 2000ms (2 seconds)
   ```

9. **Webhook Configuration:**
   ```
   Webhook URL: https://api-production-eb10.up.railway.app/webhooks/telnyx
   
   Events to Enable:
   ✓ call.initiated
   ✓ call.answered
   ✓ call.completed
   ✓ call.recording.saved
   ✓ call.transcript.ready
   
   Webhook Signature: Enabled
   ```

10. **Fallback Settings:**
    ```
    Action: Transfer to Voicemail (or Human)
    Message: "I'm having trouble right now. Please leave a message and our team will call you back."
    ```

11. **Save Configuration**

12. **Link to Phone Number:**
    - Go to: https://portal.telnyx.com/#/app/numbers
    - Find phone: `+1-866-500-7760`
    - Click to edit
    - Under "Voice Settings":
      - Inbound Call Handling: **AI Assistant**
      - Select Assistant: **Pronto Demo Receptionist**
    - Save changes

13. **Get Assistant ID:**
    - After creation, note the Assistant ID from the portal URL or details page
    - Format: Usually a UUID or alphanumeric string
    - **Add to Railway:**
      ```bash
      railway variables set TELNYX_AI_ASSISTANT_ID="[paste-id-here]"
      ```

---

### Step 3: Deploy to Production (5 minutes)

**Why:** Get the latest code changes live on Railway.

**Actions:**

1. **Commit Changes (if any uncommitted):**
   ```bash
   cd /Users/claudelevi/ProntoPlus
   git add .
   git commit -m "Phase 2: Complete Pronto Demo implementation"
   ```

2. **Push to Main Branch:**
   ```bash
   git push origin main
   ```

3. **Verify Deployment:**
   - Railway automatically deploys on push to main
   - Go to: https://railway.app/project/[your-project-id]
   - Watch deployment logs
   - Wait for "Deployment successful" status
   - Both `api` and `frontend` services should redeploy

4. **Check Health:**
   ```bash
   # Test API health endpoint
   curl https://api-production-eb10.up.railway.app/health
   
   # Should return: {"status":"ok","database":"connected","redis":"connected"}
   ```

---

### Step 4: Enable Feature Flag (2 minutes)

**Why:** Feature flags control whether the Pronto Demo is active.

**Actions:**

1. **Go to ConfigCat Dashboard:**
   - URL: https://app.configcat.com
   - Navigate to: Prontoplus → Main Config

2. **Enable Pronto Demo Flag:**
   - Find setting: `pronto_demo_enabledBoolean`
   - Click to edit
   - Set value: **ON (true)**
   - Environment: **Production**
   - Save changes

3. **Verify Propagation:**
   - ConfigCat propagates changes within 60 seconds
   - Check frontend displays demo phone number correctly

---

### Step 5: Initial Testing (10-15 minutes)

**Why:** Verify everything works end-to-end before announcing launch.

**Testing Checklist:**

#### 5.1 Basic Call Test
- [ ] **Call the demo number:** +1-866-500-7760
- [ ] Verify AI answers within 2-3 rings
- [ ] Confirm professional greeting heard
- [ ] Listen for: "Hi! This is Pronto, the AI assistant for ProntoPlus Orthodontics..."

#### 5.2 Knowledge Base Test
- [ ] Ask: "How much do braces cost?"
- [ ] Verify AI provides range ($3,000-$7,000)
- [ ] Verify AI mentions insurance coverage
- [ ] Ask: "Do you accept Delta Dental?"
- [ ] Verify AI confirms acceptance

#### 5.3 Webhook Test
- [ ] **Check Railway API Logs:**
   ```bash
   railway logs --service api
   # Look for: "Processing Telnyx webhook event: call.initiated"
   ```
- [ ] Verify webhook events received
- [ ] Check for: call.initiated, call.answered, call.completed

#### 5.4 Lead Capture Test
- [ ] **Call and ask about pricing + scheduling**
- [ ] Hang up after 1-2 minutes
- [ ] **Check Admin Dashboard:**
   - URL: https://frontend-production-3177.up.railway.app/admin/calls
   - Verify call appears in table
   - Check lead score is calculated (should be >50 for pricing+scheduling)
   - Verify lead quality shows "WARM" or "HOT"

#### 5.5 Slack Notification Test
- [ ] **Check Slack channel:** #pronto-demo-leads
- [ ] Verify notification received
- [ ] Confirm it includes:
   - Lead score (e.g., 65/100)
   - Quality badge (HOT/WARM/COLD)
   - Engagement indicators (💰 pricing, 📅 scheduling)
   - Action buttons (Listen, View Dashboard, Call Back)

#### 5.6 Recording & Transcript Test
- [ ] Wait 2-5 minutes after call ends
- [ ] Check admin dashboard for recording URL
- [ ] Click "Listen to Recording" button
- [ ] Verify audio plays correctly
- [ ] Check if transcript available (may take longer)

---

### Step 6: Extended Testing with Test Scenarios (Optional, 1-2 hours)

**Why:** Comprehensive quality assurance using the 52 test scenarios.

**Actions:**

1. **Open Test Document:**
   - File: `apps/api/src/data/demo-test-scenarios.json`
   - Or view in structured format in admin dashboard (if implemented)

2. **Create Test Results Spreadsheet:**
   ```
   Columns:
   - Scenario ID (e.g., G1, T5, P3)
   - Category
   - Question/Script
   - AI Response (transcribed)
   - Response Time (seconds)
   - Quality (1-5)
   - Accuracy (1-5)
   - Naturalness (1-5)
   - Professionalism (1-5)
   - Resolution (1-5)
   - Average Score
   - Pass/Fail
   - Notes
   ```

3. **Execute Test Scenarios:**
   - Call the demo number for each scenario
   - Follow the script exactly as written
   - Record AI response
   - Rate on 5 dimensions (1-5 stars)
   - Take notes on any issues

4. **Calculate Metrics:**
   - Average score across all scenarios
   - Pass rate (scenarios scoring 4.0+)
   - Category performance breakdown
   - Identify failing scenarios for improvement

5. **Target Metrics:**
   - ✅ Average score: **4.0+** / 5.0
   - ✅ Pass rate: **80%+** of scenarios
   - ✅ Response time: **<2 seconds** average
   - ✅ Call completion: **>95%** (no dropped calls)
   - ✅ Knowledge accuracy: **>90%** (correct information)

---

### Step 7: Monitor Production (24 hours)

**Why:** Ensure stability and catch any issues early.

**Monitoring Checklist:**

#### Hour 1 (Active Monitoring)
- [ ] Check Railway logs every 15 minutes
- [ ] Monitor Slack notifications
- [ ] Verify database writes (check admin dashboard)
- [ ] Test call quality periodically

#### Hour 2-8 (Regular Monitoring)
- [ ] Check logs hourly
- [ ] Monitor error rates
- [ ] Track lead scores trending
- [ ] Verify Slack throttling working (no spam)

#### Hour 8-24 (Periodic Monitoring)
- [ ] Check logs every 4 hours
- [ ] Review analytics dashboard
- [ ] Check for any error patterns
- [ ] Verify call recordings stored

#### Alerts to Watch For:
- 🚨 **Critical:** Webhook signature failures
- ⚠️ **High:** Database connection errors
- ⚠️ **Medium:** Slack notification failures (should retry)
- 💡 **Low:** Slow API responses (>500ms)

---

### Step 8: Launch Announcement (After 24h stability)

**Why:** Announce the demo once you're confident it's stable.

**Actions:**

1. **Internal Announcement (Slack/Email):**
   ```
   🎉 ProntoPlus Demo is Live!
   
   Call our AI receptionist: +1-866-500-7760
   
   Try asking:
   • "How much do braces cost?"
   • "Do you accept my insurance?"
   • "I need to schedule an appointment"
   • "What are your office hours?"
   
   📊 Track calls: [admin dashboard URL]
   🔔 Notifications: #pronto-demo-leads
   
   Please test and share feedback!
   ```

2. **External Announcement (if applicable):**
   - Update website hero section with demo CTA
   - Social media post (LinkedIn, Twitter)
   - Email to potential customers
   - Blog post about the AI receptionist

3. **Update Documentation:**
   - Mark Phase 2 as "LAUNCHED" in project docs
   - Update README with demo phone number
   - Add launch date to CHANGELOG

---

## 🐛 Troubleshooting Common Issues

### Issue: AI Not Answering Calls

**Symptoms:** Calls go to voicemail or ring indefinitely

**Solutions:**
1. Verify AI Assistant is linked to phone number in Telnyx Portal
2. Check AI Assistant status is "Active" (not paused/disabled)
3. Verify phone number status is "Active" in Telnyx
4. Check Telnyx account balance (ensure funded)
5. Review Telnyx call logs for error messages

### Issue: Webhook Events Not Received

**Symptoms:** No logs in Railway, no Slack notifications

**Solutions:**
1. Verify webhook URL is correct in Telnyx Portal
2. Check webhook signature secret matches between Telnyx and Railway
3. Ensure Railway API service is running (check health endpoint)
4. Verify firewall/security rules allow Telnyx IPs
5. Check Railway logs for webhook signature validation errors
6. Test webhook manually using Telnyx Portal "Test Webhook" button

### Issue: Slack Notifications Not Sending

**Symptoms:** Webhook received but no Slack message

**Solutions:**
1. Verify `SLACK_WEBHOOK_URL` is set correctly in Railway
2. Test Slack webhook directly:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test from ProntoPlus"}' \
     YOUR_SLACK_WEBHOOK_URL
   ```
3. Check Slack app permissions and channel access
4. Verify notification throttling not blocking (check 24h cooldown)
5. Check quiet hours logic (no notifications 10pm-8am)
6. Review Railway logs for Slack API errors

### Issue: Lead Score Always 0

**Symptoms:** All leads show 0/100 score

**Solutions:**
1. Verify transcript data in webhook payload
2. Check Telnyx transcription is enabled
3. Verify sentiment analysis is enabled
4. Review lead scoring algorithm logic
5. Check database fields are populated correctly
6. Test with longer calls (>1 minute) with clear pricing/scheduling keywords

### Issue: Admin Dashboard Not Loading Data

**Symptoms:** Dashboard shows no calls or errors

**Solutions:**
1. Verify API is reachable from frontend
2. Check `NEXT_PUBLIC_API_URL` environment variable
3. Verify CORS settings on API allow frontend domain
4. Check browser console for errors
5. Verify database connection from API
6. Test API endpoints directly with curl/Postman

### Issue: Recording URLs Not Working

**Symptoms:** "Listen to Recording" button returns 404

**Solutions:**
1. Verify call recording is enabled in Telnyx AI Assistant
2. Check Telnyx storage settings
3. Verify `recording.saved` webhook is being received
4. Check recording URL format in database
5. Test recording URL expiry time (may expire after X hours)
6. Verify Telnyx account has recording feature enabled

---

## 📊 Success Metrics Dashboard

Track these metrics to measure Phase 2 success:

### Week 1 Goals
- **Total Calls:** 50+
- **Average Lead Score:** 45+
- **HOT Leads:** 10+
- **Call Completion Rate:** >90%
- **Average Call Duration:** 2-5 minutes
- **Knowledge Accuracy:** >85% (based on manual review)

### Month 1 Goals
- **Total Calls:** 500+
- **Average Lead Score:** 50+
- **HOT Leads:** 100+
- **Call Completion Rate:** >95%
- **Conversion Rate:** 20%+ (HOT leads to customers)
- **Knowledge Accuracy:** >90%

---

## 📝 Post-Launch Optimization

### Week 1 Actions
1. Review all call transcripts
2. Identify common questions not in knowledge base
3. Note any incorrect or incomplete responses
4. Adjust lead scoring thresholds based on real data
5. Fine-tune AI prompt based on conversation quality

### Week 2-4 Actions
1. Add new FAQ entries discovered during calls
2. A/B test different AI voices
3. Experiment with greeting variations
4. Optimize response timing (speed vs quality)
5. Enhance Slack notification formatting based on team feedback

### Month 2+ Actions
1. Implement outbound calling for follow-ups
2. Add SMS notifications for high-value leads
3. Create automated email sequences
4. Build lead conversion tracking
5. Integrate with CRM system

---

## 🎯 Final Checklist

Before considering Phase 2 "LAUNCHED":

- [ ] Slack webhook URL updated with real webhook
- [ ] Telnyx AI Assistant configured and linked to phone number
- [ ] Code deployed to production (Railway)
- [ ] Feature flag enabled (ConfigCat)
- [ ] Basic call test passed (AI answers and responds)
- [ ] Knowledge base test passed (accurate responses)
- [ ] Webhook integration test passed (events received)
- [ ] Lead capture test passed (score calculated)
- [ ] Slack notification test passed (message received)
- [ ] Recording test passed (audio stored)
- [ ] Admin dashboard test passed (data displays)
- [ ] 24-hour stability period completed
- [ ] Launch announcement sent
- [ ] Documentation updated

---

## 🆘 Support Contacts

**Technical Issues:**
- Railway Support: https://railway.app/help
- Telnyx Support: https://telnyx.com/support
- ConfigCat Support: https://configcat.com/support

**Internal Support:**
- Check: `docs/TROUBLESHOOTING.md`
- Review: `docs/ARCHITECTURE.md`
- Reference: `docs/PHASE2_COMPLETION_REPORT.md`

---

## 🎉 Congratulations!

Once all steps are complete, you'll have a fully operational AI receptionist demo that:
- Answers calls 24/7 with professional, knowledgeable responses
- Captures and scores leads automatically
- Sends real-time Slack notifications
- Provides comprehensive analytics dashboard
- Integrates seamlessly with your tech stack

**Good luck with the launch! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Estimated Total Time:** 30-45 minutes (excluding extended testing)


