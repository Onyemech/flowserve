# WhatsApp Business API Setup Guide

## ✅ Credentials Configured

- **Phone Number ID**: 1572646177519931
- **Access Token**: 0b08b5bf4c69ce5e6adaf9c8988a73d6
- **Verify Token**: flowserve_webhook_verify_2025

## 📋 Meta Business Suite Configuration

### Step 1: Configure Webhook in Meta Business Suite

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Navigate to **WhatsApp** → **API Setup**
3. Click on **Configuration** → **Webhook**

### Step 2: Set Webhook URL

```
https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook
```

### Step 3: Set Verify Token

```
flowserve_webhook_verify_2025
```

### Step 4: Subscribe to Webhook Fields

Select the following fields:
- ✅ **messages** - To receive incoming messages
- ✅ **message_status** - To track message delivery status

### Step 5: Verify Webhook

Click **Verify and Save** button. Meta will send a GET request to verify your webhook.

## 🚀 Deploy Supabase Functions

Run these commands to deploy your WhatsApp functions:

```bash
cd backend

# Deploy the webhook function
supabase functions deploy whatsapp-webhook

# Deploy the agent function
supabase functions deploy whatsapp-agent

# Set environment variables
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=1572646177519931
supabase secrets set WHATSAPP_ACCESS_TOKEN=0b08b5bf4c69ce5e6adaf9c8988a73d6
supabase secrets set WHATSAPP_WEBHOOK_VERIFY_TOKEN=flowserve_webhook_verify_2025
supabase secrets set WHATSAPP_BUSINESS_ACCOUNT_ID=1572646177519931
```

## 🧪 Test Your Webhook

### Test Verification (GET Request)

```bash
curl "https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=flowserve_webhook_verify_2025&hub.challenge=test123"
```

Expected response: `test123`

### Test Message Webhook (POST Request)

```bash
curl -X POST https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messages": [{
            "from": "2348012345678",
            "type": "text",
            "text": { "body": "Hello" },
            "timestamp": "1234567890"
          }]
        }
      }]
    }]
  }'
```

## 📱 Send Test Message

Once configured, send a message to your WhatsApp Business number to test:

1. Save your WhatsApp Business number in your phone
2. Send a message like "Hello"
3. Check Supabase logs to see if the webhook received it
4. The AI agent should respond automatically

## 🔍 Monitor Webhook Activity

View logs in Supabase Dashboard:
1. Go to **Functions** → **whatsapp-webhook**
2. Click **Logs** tab
3. You'll see all incoming webhook requests

## 🎯 Webhook Flow

```
User sends WhatsApp message
    ↓
Meta sends webhook to your endpoint
    ↓
whatsapp-webhook function receives it
    ↓
Calls whatsapp-agent function
    ↓
AI processes message
    ↓
Response sent back to user via WhatsApp API
```

## ⚠️ Important Notes

- Webhook URL must be HTTPS (Supabase provides this)
- Verify token must match exactly: `flowserve_webhook_verify_2025`
- Subscribe to both `messages` and `message_status` fields
- Test webhook verification before going live
- Monitor logs for any errors

## 🔐 Security

- Access token is stored securely in Supabase secrets
- Webhook verification prevents unauthorized requests
- All communication is over HTTPS

## 📞 Support

If you encounter issues:
1. Check Supabase function logs
2. Verify webhook configuration in Meta Business Suite
3. Ensure all credentials are correct
4. Test with curl commands above
