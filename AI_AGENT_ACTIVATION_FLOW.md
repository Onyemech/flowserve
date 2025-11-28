# AI Agent Activation Flow - How Admin Connects WhatsApp

## Current Problem
After admin completes registration and business setup, **there's NO way to connect their WhatsApp Business number** to activate the AI agent. The agent exists in the backend but has no way to know which WhatsApp number belongs to which admin.

## What's Missing

### 1. WhatsApp Connection in Setup
The setup page (`frontend/src/app/dashboard/setup/page.tsx`) only collects:
- Business name
- Business type
- Bank details

**Missing**: WhatsApp Business Phone Number ID

### 2. No Dashboard Settings Page
There's no page where admin can:
- Enter their WhatsApp Business Phone Number ID
- Enter their WhatsApp Access Token
- Test the connection
- See connection status

### 3. Backend Has No User-Specific WhatsApp Config
The backend (`backend/supabase/functions/_shared/config.ts`) uses **global** WhatsApp credentials:
```typescript
WHATSAPP_API_TOKEN=0b08b5bf4c69ce5e6adaf9c8988a73d6
WHATSAPP_PHONE_NUMBER_ID=1572646177519931
```

This means **ALL admins share the same WhatsApp number** - which is wrong!

## The Solution - Complete Flow

### Step 1: Admin Gets WhatsApp Business API Credentials

Admin needs to:
1. Go to Meta Developer Console (developers.facebook.com)
2. Create a WhatsApp Business App
3. Get their credentials:
   - **Phone Number ID** (e.g., `1572646177519931`)
   - **Access Token** (e.g., `EAABsbCS1iHgBO7ZA...`)
   - **Webhook Verify Token** (they create this)

### Step 2: Admin Enters Credentials in Dashboard

**Add to Setup Page** or **Create Settings Page**:

```typescript
// Add these fields to setup form:
{
  whatsapp_phone_number_id: '',
  whatsapp_access_token: '',
  whatsapp_webhook_verify_token: '',
}
```

### Step 3: Save to Database

Update `flowserve_users` table to store:
```sql
ALTER TABLE flowserve_users ADD COLUMN whatsapp_phone_number_id TEXT;
ALTER TABLE flowserve_users ADD COLUMN whatsapp_access_token TEXT;
ALTER TABLE flowserve_users ADD COLUMN whatsapp_webhook_verify_token TEXT;
ALTER TABLE flowserve_users ADD COLUMN whatsapp_connected BOOLEAN DEFAULT FALSE;
```

### Step 4: Backend Uses User-Specific Credentials

Modify `whatsapp-agent/index.ts` to:
1. Get the user_id from the incoming WhatsApp message
2. Fetch that user's WhatsApp credentials from database
3. Use those credentials to send responses

### Step 5: Configure Webhook in Meta

Admin needs to set webhook URL in Meta Developer Console:
```
https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook
```

With their custom verify token.

## Implementation Plan

### 1. Database Migration
```sql
-- Add WhatsApp credentials to users table
ALTER TABLE flowserve_users 
ADD COLUMN whatsapp_phone_number_id TEXT,
ADD COLUMN whatsapp_access_token TEXT,
ADD COLUMN whatsapp_webhook_verify_token TEXT,
ADD COLUMN whatsapp_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN whatsapp_connected_at TIMESTAMP;
```

### 2. Update Setup Page
Add WhatsApp connection step after bank details:
- Input for Phone Number ID
- Input for Access Token
- Input for Webhook Verify Token
- "Test Connection" button
- Instructions with link to Meta Developer Console

### 3. Create Settings Page
`frontend/src/app/dashboard/settings/page.tsx`:
- View current WhatsApp connection status
- Update WhatsApp credentials
- Test connection
- View webhook URL to configure in Meta
- Disconnect/Reconnect WhatsApp

### 4. Update Backend Agent
Modify `whatsapp-agent/index.ts`:
```typescript
// Instead of using global config
const { data: owner } = await supabase
  .from('flowserve_users')
  .select('whatsapp_phone_number_id, whatsapp_access_token')
  .eq('id', session.user_id)
  .single()

// Use owner's credentials
await fetch(`https://graph.facebook.com/v18.0/${owner.whatsapp_phone_number_id}/messages`, {
  headers: {
    'Authorization': `Bearer ${owner.whatsapp_access_token}`,
    ...
  }
})
```

### 5. Update Webhook Handler
Modify `whatsapp-webhook/index.ts`:
```typescript
// Extract phone number from incoming message
const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id

// Find which user owns this WhatsApp number
const { data: owner } = await supabase
  .from('flowserve_users')
  .select('*')
  .eq('whatsapp_phone_number_id', phoneNumberId)
  .single()

// Create session for that specific user
await supabase.from('whatsapp_sessions').insert({
  user_id: owner.id,
  customer_phone: message.from,
  ...
})
```

## User Journey

### For Admin:
1. **Register** → Create account
2. **Setup** → Enter business details + bank info
3. **Connect WhatsApp** → Enter WhatsApp credentials
4. **Test Connection** → Verify it works
5. **Configure Webhook** → Set webhook URL in Meta
6. **Done!** → AI agent is now active

### For Customer:
1. **Message WhatsApp** → "Hi, I want to buy a property"
2. **Webhook Receives** → Message sent to your backend
3. **Agent Processes** → AI analyzes intent
4. **Response Sent** → Using admin's WhatsApp credentials
5. **Customer Sees** → Reply from admin's WhatsApp Business number

## Current State vs Desired State

### Current (Broken):
```
Customer → WhatsApp → Webhook → Agent → ❌ Uses global credentials
                                        ❌ All admins share one number
                                        ❌ No way to connect own number
```

### Desired (Working):
```
Customer → WhatsApp → Webhook → Find Owner → Agent → ✅ Uses owner's credentials
                                                      ✅ Each admin has own number
                                                      ✅ Easy setup in dashboard
```

## What Needs to Be Built

1. **Database Migration** - Add WhatsApp columns
2. **Settings Page** - UI for WhatsApp connection
3. **API Route** - Test WhatsApp connection
4. **Backend Update** - Use user-specific credentials
5. **Webhook Update** - Route to correct user
6. **Documentation** - Guide for admins

## Priority

**HIGH PRIORITY** - Without this, the AI agent cannot work for multiple admins. Currently only works for one hardcoded WhatsApp number.


---

## ✅ IMPLEMENTATION COMPLETE

### What Was Built:

#### 1. Database Migration ✅
**File**: `backend/supabase/migrations/20240127000000_add_whatsapp_credentials.sql`
- Added WhatsApp credentials columns to `flowserve_users` table
- Added connection status tracking
- Added index for fast webhook lookups

#### 2. Settings Page ✅
**File**: `frontend/src/app/dashboard/settings/page.tsx`
- UI for entering WhatsApp credentials
- Test connection button
- Instructions for getting credentials from Meta
- Webhook configuration details
- Connection status indicator

#### 3. Test Connection API ✅
**File**: `frontend/src/app/api/whatsapp/test-connection/route.ts`
- Validates WhatsApp credentials
- Tests connection to Meta API
- Returns phone number details

#### 4. Navigation Updated ✅
**File**: `frontend/src/components/dashboard/BottomNav.tsx`
- Added "Settings" tab to bottom navigation
- Now accessible from any dashboard page

### How Admin Activates AI Agent:

#### Step 1: Get WhatsApp Credentials
1. Go to https://developers.facebook.com
2. Create WhatsApp Business App
3. Get Phone Number ID and Access Token

#### Step 2: Enter in Dashboard
1. Login to FlowServe dashboard
2. Click "Settings" tab (bottom nav)
3. Enter:
   - Phone Number ID
   - Access Token
   - Webhook Verify Token (create your own)
4. Click "Test Connection"
5. Click "Save Settings"

#### Step 3: Configure Webhook in Meta
1. Go to Meta Developer Console
2. Navigate to WhatsApp → Configuration
3. Set Callback URL: `https://YOUR_PROJECT.supabase.co/functions/v1/whatsapp-webhook`
4. Set Verify Token: (the one you created in Step 2)
5. Subscribe to "messages" webhook

#### Step 4: Done! 🎉
- AI agent is now active
- Customers can message your WhatsApp Business number
- Agent will respond automatically using AI

### What Still Needs to Be Done:

#### 1. Update Backend Webhook Handler
**File**: `backend/supabase/functions/whatsapp-webhook/index.ts`

Need to modify to:
- Extract phone_number_id from incoming message
- Find which user owns that WhatsApp number
- Create session for that specific user

```typescript
// Extract phone number from webhook
const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id

// Find owner
const { data: owner } = await supabase
  .from('flowserve_users')
  .select('*')
  .eq('whatsapp_phone_number_id', phoneNumberId)
  .eq('whatsapp_connected', true)
  .single()

if (!owner) {
  return new Response('Webhook received but no owner found', { status: 200 })
}

// Create session for this owner
await supabase.from('whatsapp_sessions').insert({
  user_id: owner.id,
  customer_phone: message.from,
  ...
})
```

#### 2. Update Backend Agent
**File**: `backend/supabase/functions/whatsapp-agent/index.ts`

Need to modify to:
- Use owner's WhatsApp credentials instead of global config
- Send messages using owner's access token

```typescript
// Get owner's credentials
const { data: owner } = await supabase
  .from('flowserve_users')
  .select('whatsapp_phone_number_id, whatsapp_access_token')
  .eq('id', session.user_id)
  .single()

// Use owner's credentials to send message
await fetch(`https://graph.facebook.com/v18.0/${owner.whatsapp_phone_number_id}/messages`, {
  headers: {
    'Authorization': `Bearer ${owner.whatsapp_access_token}`,
    ...
  }
})
```

#### 3. Apply Database Migration
```bash
cd backend
supabase db push
```

#### 4. Test End-to-End
1. Admin enters credentials in Settings
2. Admin configures webhook in Meta
3. Customer sends WhatsApp message
4. Webhook receives message
5. Agent processes and responds
6. Customer receives reply

### Summary

**Frontend**: ✅ Complete
- Settings page created
- Navigation updated
- Test connection API created

**Backend**: ⚠️ Needs Update
- Webhook handler needs to route to correct user
- Agent needs to use user-specific credentials
- Migration needs to be applied

**Next Steps**:
1. Apply database migration
2. Update webhook handler
3. Update agent to use user credentials
4. Test with real WhatsApp message

**Result**: Each admin can connect their own WhatsApp Business number and have their own AI agent!
