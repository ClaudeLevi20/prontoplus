# Telnyx & ConfigCat Setup Instructions

## Status Check

### ConfigCat ✅ Working
- **Product ID:** `08de13e4-6b1d-4eb5-8be9-ecd5a9bbfd95`
- **Config ID:** `08de13e4-6b35-4dc9-8e74-de9418f2cbdb`
- **Settings Available:** 5 feature flags already created
- **Feature Flag to Enable:** `pronto_demo_enabledBoolean` (ID: 798156)

**Action Required:**
The `pronto_demo_enabled` flag exists but needs to be enabled in the Production environment. Please:
1. Go to: https://app.configcat.com
2. Navigate to: Products > Prontoplus's Product > Main Config
3. Find the setting: `pronto_demo_enabled (boolean)`
4. Toggle to **TRUE** for Production Environment
5. Save changes

### Telnyx ❌ Needs API Key
The Telnyx MCP requires a valid API key. Please set this environment variable:

**Via Railway Dashboard:**
1. Go to: https://railway.app/dashboard
2. Select `prontoplus` project
3. Open `api` service
4. Go to Variables tab
5. Add: `TELNYX_API_KEY` = `[your API key from portal.telnyx.com]`

**Or via Command Line:**
```bash
cd /Users/claudelevi/ProntoPlus
railway variables --service api set TELNYX_API_KEY="KEY017xxxxxxxx"
```

## Once Telnyx API Key is Set

After setting the API key, run this script to automatically configure the AI Assistant:

```bash
node scripts/configure-telnyx-assistant.js
```

This will:
1. List available phone numbers
2. Create AI Assistant with knowledge base
3. Link to selected phone number
4. Configure webhook endpoint
5. Enable call recording and transcription

## Manual Configuration (Alternative)

If MCP configuration fails, follow the manual setup guides:
- `docs/TELNYX_AI_ASSISTANT_SETUP.md` - Complete Telnyx setup
- `docs/FEATURE_FLAG_CONFIGURATION.md` - ConfigCat setup
