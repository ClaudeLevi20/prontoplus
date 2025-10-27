# Phase 2 Completion Guide - Pronto Demo Configuration

## ✅ Implementation Complete - Configuration Pending

All Phase 2 code implementation is **100% complete**. The following configuration steps remain:

---

## 1️⃣ ConfigCat Feature Flag (Ready to Enable)

The feature flag `pronto_demo_enabled` already exists in ConfigCat. Just enable it:

### Via ConfigCat Dashboard:
1. Go to: https://app.configcat.com
2. Navigate to: Products > Prontoplus's Product > Main Config
3. Find setting: `pronto_demo_enabled (boolean)` (ID: 798156)
4. **Toggle to `true`** for Production Environment
5. Save changes

**Or via ConfigCat API (if you have credentials):**
```bash
curl -X PATCH "https://api.configcat.com/v1/configs/configId/settings/settingId/value" \
  -H "Authorization: Bearer YOUR_CONFIGCAT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"environmentId": "08de13e4-6b2d-4491-86c4-8a7c55a3c4af", "value": true}'
```

---

## 2️⃣ Telnyx AI Assistant Configuration

The Telnyx MCP requires an actual API key (not the placeholder in Railway). You have two options:

### Option A: Configure via Telnyx Portal (Recommended)

1. **Get Your Real API Key:**
   - Go to: https://portal.telnyx.com/#/app/api-keys
   - Copy your API key (should start with `KEY01...`)
   - **Update Railway variable** with the real key:
   ```bash
   railway variables --service api set TELNYX_API_KEY="KEY017YourRealKeyHere"
   ```

2. **Create AI Assistant in Portal:**
   - Use the guide in: `docs/TELNYX_AI_ASSISTANT_SETUP.md`
   - Copy the enhanced system prompt from: `apps/api/src/data/enhanced-system-prompt.txt`
   - Reference knowledge base: `apps/api/src/data/ortho-knowledge-base.json`

3. **Test the Configuration:**
   - Call your demo number: `+1-866-500-7760`
   - Try questions from: `apps/api/src/data/demo-test-scenarios.json`
   - Check admin dashboard for lead scores

### Option B: Set API Key for MCP (Then use MCP tools)

If you want to use Telnyx MCP tools directly:

```bash
# In your terminal (or Railway environment)
export TELNYX_API_KEY="KEY017YourRealKeyHere"

# Then the MCP tools will work
```

**Once API key is set, run:**
```bash
# This will configure everything via MCP
node scripts/configure-telnyx-assistant.js
```

---

## 3️⃣ Verification Checklist

After configuration, verify:

### ✅ Telnyx Setup
- [ ] AI Assistant answers calls professionally
- [ ] Knowledge base responses are accurate
- [ ] Phone number displays on frontend
- [ ] Webhook events received in API logs

### ✅ ConfigCat Setup  
- [ ] Feature flag enabled in Production
- [ ] Frontend shows demo section
- [ ] API respects feature flag

### ✅ Lead Scoring
- [ ] Admin dashboard shows lead scores
- [ ] Lead quality cards display (HOT/WARM/COLD)
- [ ] Calls table shows score column

### ✅ Slack Notifications
- [ ] Notifications sent to Slack
- [ ] Rich formatting with emojis
- [ ] Action buttons work (recordings, dashboard)
- [ ] Hot leads mention @channel

---

## 4️⃣ Final Deployment Commands

Once configuration is complete:

```bash
# 1. Verify environment variables
railway variables --service api

# 2. Deploy API (auto-deploys on commit)
git add .
git commit -m "Phase 2: Complete Pronto Demo implementation"
git push origin main

# 3. Verify deployment
railway logs --service api
railway logs --service frontend

# 4. Test demo
curl https://api-production-eb10.up.railway.app/health
# Call: +1-866-500-7760

# 5. Enable feature flag
# Via ConfigCat dashboard (see step 1)
```

---

## 📊 Summary

### What's Complete ✅
- All 11 implementation steps done
- Database migration applied
- 70+ knowledge base scenarios created
- Lead scoring algorithm implemented
- Enhanced Slack notifications ready
- Frontend components updated
- 52 test scenarios documented
- Webhook integration complete

### What's Pending ⏳
- Set real Telnyx API key in Railway
- Configure AI Assistant (via Portal or MCP)
- Enable ConfigCat feature flag
- Execute manual testing

### Estimated Time to Complete
- **5-10 minutes** to set API key and configure
- **15-30 minutes** for initial testing
- **2-4 hours** for comprehensive test suite execution

---

## Need Help?

Refer to these docs:
- `docs/TELNYX_AI_ASSISTANT_SETUP.md` - Complete Telnyx configuration
- `docs/FEATURE_FLAG_CONFIGURATION.md` Discussion - ConfigCat setup
- `apps/api/src/data/demo-test-scenarios.json` - Test scenarios
- `apps/api/src/data/ortho-knowledge-base.json` - Knowledge base
