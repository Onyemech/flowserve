# Proper WhatsApp Integration - Embedded Signup

## The Problem with Current Approach

❌ **Bad UX**: Admin has to:
- Go to Meta Developer Console
- Create app
- Get credentials
- Copy/paste multiple keys
- Configure webhooks manually

This is **NOT** how SaaS products work!

## The Right Solution: Embedded Signup

✅ **Good UX**: Admin just:
1. Clicks "Connect WhatsApp" button
2. Logs into Facebook (popup)
3. Selects their WhatsApp Business number
4. Clicks "Allow"
5. Done! ✨

## How It Works

### 1. Platform Owner (You) Setup - ONE TIME

You create ONE Meta Business App with:
- App ID
- App Secret
- System User Access Token (permanent)

### 2. Implement Embedded Signup Flow

When admin clicks "Connect WhatsApp":

```typescript
// Frontend - Open Facebook login popup
const connectWhatsApp = () => {
  const url = `https://www.facebook.com/v18.0/dialog/oauth?
    client_id=YOUR_APP_ID
    &redirect_uri=https://yourapp.com/whatsapp/callback
    &state=${userId}
    &scope=whatsapp_business_management,whatsapp_business_messaging
    &response_type=code`
  
  window.open(url, 'Connect WhatsApp', 'width=600,height=700')
}
```

### 3. Handle Callback

```typescript
// Backend - Exchange code for access token
const code = req.query.code
const userId = req.query.state

// Exchange code for token
const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
  method: 'POST',
  body: JSON.stringify({
    client_id: YOUR_APP_ID,
    client_secret: YOUR_APP_SECRET,
    code: code,
    redirect_uri: 'https://yourapp.com/whatsapp/callback'
  })
})

const { access_token } = await tokenResponse.json()

// Get user's WhatsApp Business Accounts
const wabas = await fetch(`https://graph.facebook.com/v18.0/me/businesses?access_token=${access_token}`)

// Get phone numbers
const phoneNumbers = await fetch(`https://graph.facebook.com/v18.0/${wabaId}/phone_numbers?access_token=${access_token}`)

// Save to database
await supabase
  .from('flowserve_users')
  .update({
    whatsapp_phone_number_id: phoneNumbers[0].id,
    whatsapp_access_token: access_token,
    whatsapp_connected: true
  })
  .eq('id', userId)
```

### 4. Subscribe to Webhooks Automatically

```typescript
// Subscribe to webhooks for this phone number
await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/subscribed_apps`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${YOUR_SYSTEM_USER_TOKEN}`
  }
})
```

## Implementation Steps

### Step 1: Create Meta Business App (You, One Time)

1. Go to https://developers.facebook.com
2. Create Business App
3. Add WhatsApp Product
4. Get:
   - App ID
   - App Secret
   - Create System User → Get permanent token

### Step 2: Update Frontend

Replace Settings page with simple button:

```typescript
// frontend/src/app/dashboard/settings/page.tsx
export default function SettingsPage() {
  const connectWhatsApp = () => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID
    const redirectUri = `${window.location.origin}/api/whatsapp/callback`
    const state = userId // for security
    
    const url = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}` +
      `&scope=whatsapp_business_management,whatsapp_business_messaging` +
      `&response_type=code`
    
    window.open(url, 'Connect WhatsApp', 'width=600,height=700')
  }
  
  return (
    <div>
      <h1>WhatsApp Connection</h1>
      {!connected ? (
        <button onClick={connectWhatsApp}>
          Connect WhatsApp Business
        </button>
      ) : (
        <div>
          ✅ Connected: {phoneNumber}
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  )
}
```

### Step 3: Create Callback Handler

```typescript
// frontend/src/app/api/whatsapp/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // userId
  
  // Exchange code for token
  const tokenRes = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      code: code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/callback`
    })
  })
  
  const { access_token } = await tokenRes.json()
  
  // Get WhatsApp Business Accounts
  const wabaRes = await fetch(
    `https://graph.facebook.com/v18.0/me/businesses?access_token=${access_token}`
  )
  const { data: businesses } = await wabaRes.json()
  const wabaId = businesses[0].id
  
  // Get phone numbers
  const phoneRes = await fetch(
    `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers?access_token=${access_token}`
  )
  const { data: phones } = await phoneRes.json()
  
  // Save to database
  const supabase = createClient()
  await supabase
    .from('flowserve_users')
    .update({
      whatsapp_phone_number_id: phones[0].id,
      whatsapp_access_token: access_token,
      whatsapp_business_account_id: wabaId,
      whatsapp_display_phone_number: phones[0].display_phone_number,
      whatsapp_connected: true,
      whatsapp_connected_at: new Date().toISOString()
    })
    .eq('id', state)
  
  // Subscribe to webhooks
  await fetch(
    `https://graph.facebook.com/v18.0/${phones[0].id}/subscribed_apps`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.META_SYSTEM_USER_TOKEN}`
      }
    }
  )
  
  // Close popup and refresh parent
  return new Response(`
    <script>
      window.opener.postMessage({ type: 'whatsapp_connected' }, '*')
      window.close()
    </script>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}
```

### Step 4: Configure Webhook (You, One Time)

In Meta Developer Console:
- Webhook URL: `https://YOUR_PROJECT.supabase.co/functions/v1/whatsapp-webhook`
- Verify Token: Your custom token
- Subscribe to: messages

## Comparison

### ❌ Current Approach (Bad)
```
Admin → Meta Console → Create App → Get Keys → Copy/Paste → Configure Webhook
Time: 30+ minutes
Difficulty: High
Support tickets: Many
```

### ✅ Embedded Signup (Good)
```
Admin → Click Button → Login Facebook → Select Number → Done
Time: 2 minutes
Difficulty: Zero
Support tickets: None
```

## Examples in the Wild

- **Twilio**: Click "Connect WhatsApp" → Done
- **MessageBird**: Click "Add Channel" → Done
- **Intercom**: Click "Connect" → Done
- **Zendesk**: Click "Authorize" → Done

## Environment Variables Needed

```env
# Platform-level (You set once)
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_SYSTEM_USER_TOKEN=your_permanent_token
META_WEBHOOK_VERIFY_TOKEN=your_verify_token

# User-level (Stored in database per admin)
# - whatsapp_phone_number_id
# - whatsapp_access_token
# - whatsapp_business_account_id
```

## Benefits

1. **Better UX**: Admin clicks one button
2. **Less Support**: No technical setup needed
3. **More Conversions**: Easier onboarding = more signups
4. **Professional**: Looks like a real SaaS product
5. **Secure**: OAuth flow, no manual key copying

## This is the Industry Standard

Every major platform uses Embedded Signup:
- Slack integrations
- Google OAuth
- Facebook Login
- Twitter API
- Stripe Connect

Your WhatsApp integration should work the same way!
