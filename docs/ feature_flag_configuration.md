# ConfigCat Feature Flag Configuration Guide

## Enable Pronto Demo Feature Flag

Since ConfigCat MCP is not currently accessible, please configure via ConfigCat Dashboard:

### Step 1: Access ConfigCat Dashboard

1. Navigate to: https://app.configcat.com
2. Log in with your ConfigCat account
3. Select your project (or create one if needed)

### Step 2: Create Feature Flag

1. Click "Add Feature Flag"
2. Configure as follows:
   - **Name:** `pronto_demo_enabled`
   - **Key:** `pronto_demo_enabled`
   - **Description:** "Enable Pronto Demo AI Receptionist"
   - **Type:** `Boolean`
   - **Default Value:** `false`

### Step 3: Configure Environments

1. Select your **Production** environment
2. Toggle the flag to `true`
3. Add targeting rules if needed (all users for now)
4. Save changes

### Step 4: Verify Configuration

The flag should propagate automatically to your applications.

To verify in your code:
```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function MyComponent() {
  const isDemoEnabled = useFeatureFlag('pronto_demo_enabled');
  
  if (!isDemoEnabled) {
    return <div>Demo is disabled</div>;
  }
  
  return <div>Demo is enabled!</div>;
}
```

### Alternative: Local Override (Development)

For local testing without ConfigCat:
```bash
# In your .env file
CONFIGCAT_SDK_KEY=[your-key]
PRONTO_DEMO_ENABLED=true
```

## Current Status

- **SDK Key:** Already configured in production
- **Environment:** Production
- **Default State:** Demo disabled until manually enabled
- **Access:** Dashboard needed to toggle flag
