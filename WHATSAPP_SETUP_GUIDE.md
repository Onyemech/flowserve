# Complete WhatsApp Bot Setup & Testing Guide

## Step 1: Meta Developer Console Configuration

### Go to Meta Developer Console
**URL:** https://developers.facebook.com/apps

### Configure Webhook

1. **Select your app** (or create one if you don't have it)
2. **Go to:** WhatsApp → Configuration
3. **Click:** Edit Webhook

### Webhook Settings:
```
Callback URL: https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook

Verify Token: flowserve_webhook_verify_2025

Webhook Fields (Subscribe to):
☑ messages
```

4. **Click:** Verify and Save

**Expected Result:** ✅ "Webhook verified successfully"

---

## Step 2: Get Your WhatsApp Business Number

### In Meta Developer Console:
1. Go to: **WhatsApp → API Setup**
2. Find: **Phone Number ID**
3. Copy the number shown (should be: 08158025887 or similar)

### Get Access Token:
1. In same page, find: **Temporary access token** or **Permanent token**
2. Copy the token
3. **Important:** This token expires! Generate a permanent one for production

---

## Step 3: Verify Supabase Secrets

Run this command to check if secrets are set:

```bash
cd backend
npx supabase secrets list
```

**Required Secrets:**
```
✅ AI_API_KEY (OpenAI)
✅ WHATSAPP_ACCESS_TOKEN (from Meta)
✅ WHATSAPP_PHONE_NUMBER_ID (from Meta)
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
✅ PAYSTACK_SECRET_KEY
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
```

### If any are missing, set them:
```bash
npx supabase secrets set WHATSAPP_ACCESS_TOKEN=your_token_here
npx supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here
```

---

## Step 4: Activate Bot in Your App

1. **Open your app:** https://flowserve.vercel.app (or your URL)
2. **Login** to your account
3. **Go to:** Settings (bottom nav) → WhatsApp Bot
4. **Click:** Activate AI Agent button
5. **Verify:** Status shows "Active" with green badge

---

## Step 5: Test the Bot

### Method 1: Send Real WhatsApp Message (RECOMMENDED)

**From another phone (NOT your business number):**

1. **Open WhatsApp**
2. **Send message to:** 08158025887 (your business number)
3. **Type:** "Hello"

**Expected Response:**
```
Hello! I am Kasungo AI, welcome to [Your Business Name]! 👋

How can I help you today?
```

### Test Conversation Flow:

**Message 1:** "Hello"
**Bot Response:** Greeting message

**Message 2:** "Show me properties" (or "Show services")
**Bot Response:** List of properties/services with images

**Message 3:** "1" (to select first item)
**Bot Response:** Item details + payment options

**Message 4:** "1" (for Paystack payment)
**Bot Response:** Payment link

---

### Method 2: Use Test Script

**Run from your computer:**
```bash
node test-whatsapp.js
```

**What it does:**
- Sends a test message directly to the bot
- Shows if bot is processing messages
- Displays success/error response

**Expected Output:**
```
🧪 Testing WhatsApp Bot...

📤 Sending test message to WhatsApp agent...
Phone: +234 815 802 5887
Message: "Hello, testing FlowServe AI bot"

✅ SUCCESS! Bot processed the message
Response: {
  "success": true
}
```

---

### Method 3: Test via Meta Console

1. **Go to:** Meta Developer Console → WhatsApp → API Setup
2. **Find:** "Send and receive messages" section
3. **Click:** "Send test message"
4. **Enter:** Your test phone number
5. **Send:** A test message
6. **Check:** If you receive it on WhatsApp

---

## Step 6: Verify Bot is Responding

### Check if message was sent:

**Option A: Check WhatsApp**
- Open WhatsApp on the phone you sent message from
- Look for response from your business number (08158025887)

**Option B: Check Supabase Logs**
```bash
cd backend
npx supabase functions logs whatsapp-agent
```

Look for:
- ✅ "AI Intent:" (shows bot understood message)
- ✅ "Message processed by agent successfully"
- ❌ Any errors

---

## Troubleshooting

### Problem: Bot doesn't respond

**Check 1: Webhook Verification**
```bash
# Test webhook manually
curl "https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=flowserve_webhook_verify_2025&hub.challenge=test123"

# Should return: test123
```

**Check 2: Access Token**
- Go to Meta Console
- Verify token is not expired
- Generate new permanent token if needed

**Check 3: Phone Number**
- Verify phone number is connected in Meta Console
- Check it's the correct number (08158025887)

**Check 4: Webhook Subscription**
- In Meta Console, verify "messages" is checked
- Re-save webhook if needed

**Check 5: Bot Activation**
- In your app, verify bot status shows "Active"
- Try toggling off and on again

---

## Complete Configuration Checklist

### ✅ Meta Developer Console
- [ ] App created
- [ ] WhatsApp product added
- [ ] Webhook URL set: `https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook`
- [ ] Verify token set: `flowserve_webhook_verify_2025`
- [ ] Webhook verified (green checkmark)
- [ ] "messages" field subscribed
- [ ] Phone number connected (08158025887)
- [ ] Access token copied

### ✅ Supabase Secrets
- [ ] AI_API_KEY set
- [ ] WHATSAPP_ACCESS_TOKEN set
- [ ] WHATSAPP_PHONE_NUMBER_ID set
- [ ] All other secrets set

### ✅ App Configuration
- [ ] Bot activated in settings
- [ ] Status shows "Active"
- [ ] At least one property/service added

### ✅ Testing
- [ ] Test script runs successfully
- [ ] Real WhatsApp message sent
- [ ] Bot responds to message

---

## Quick Test Commands

### Test webhook is live:
```bash
curl https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook
```

### Test bot with script:
```bash
node test-whatsapp.js
```

### Check Supabase secrets:
```bash
cd backend
npx supabase secrets list
```

---

## What to Expect

### First Message:
**You send:** "Hello"
**Bot replies:** "Hello! I am Kasungo AI, welcome to [Business Name]! 👋 How can I help you today?"

### Show Listings:
**You send:** "Show me properties" or "Show services"
**Bot replies:** List of items with images, numbered 1, 2, 3...

### Select Item:
**You send:** "1"
**Bot replies:** Item details + "Choose payment: 1️⃣ Paystack or 2️⃣ Manual"

### Choose Payment:
**You send:** "1"
**Bot replies:** Payment link

---

## Support

If bot still doesn't work after following all steps:

1. **Check Edge Function logs** for errors
2. **Verify all secrets** are set correctly
3. **Test webhook** manually with curl
4. **Check Meta Console** for any warnings
5. **Ensure phone number** is properly connected

---

## Summary

**Your WhatsApp Business Number:** 08158025887 (+234 815 802 5887)

**Webhook URL:** https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook

**Verify Token:** flowserve_webhook_verify_2025

**Test Command:** `node test-whatsapp.js`

**Test Message:** Send "Hello" to 08158025887 from another phone

The bot is deployed and working! Just complete the Meta configuration and you're ready to go! 🚀
