# Complete Environment Variables Setup Guide

## 🔍 Environment Variables Audit Summary

### Variables Used in Backend (Supabase Edge Functions)
All backend functions use `Deno.env.get()` to access these variables:

#### ✅ Verified Variable Names:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `AI_PROVIDER`
- `AI_API_KEY`
- `AI_MODEL`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `APP_URL`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `BREVO_API_KEY` (optional)

### Variables Used in Frontend (Vercel)
Frontend uses `process.env.` to access these variables:

#### Browser-Exposed (NEXT_PUBLIC_*):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PLATFORM_WHATSAPP_NUMBER` ⚠️ **NEW - Must be set!**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

#### Server-Side Only (NO NEXT_PUBLIC):
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_SYSTEM_USER_TOKEN` (optional)

---

## 📋 Step 1: Deploy Supabase Edge Function Secrets

### Your Actual Values:
```bash
WHATSAPP_PHONE_NUMBER_ID=923851067476532
WHATSAPP_BUSINESS_ACCOUNT_ID=827847299962265
APP_ID=1572646177519931  # This is used in frontend as META_APP_ID
```

### Option A: Using PowerShell Script (Windows)

1. Open PowerShell in `backend/` directory
2. Run:
```powershell
supabase secrets set `
  SUPABASE_URL="https://lzofgtjotkmrravxhwfk.supabase.co" `
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2ZndGpvdGttcnJhdnhod2ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2NTU4MCwiZXhwIjoyMDc5NjQxNTgwfQ.XSQBwNYZZCm5MxewH7r8oeWg09gLa4XCz5CezzRnO94" `
  SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2ZndGpvdGttcnJhdnhod2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjU1ODAsImV4cCI6MjA3OTY0MTU4MH0.Q1PoTbcSA6hw_zp1ymDETJPGTLCpGRyoBqwh69Dm50c" `
  WHATSAPP_PHONE_NUMBER_ID="923851067476532" `
  WHATSAPP_ACCESS_TOKEN="EAAWWUDjEuTsBQD9BMzLXThcstvRAZAvkjyOaZCvBZARv4VLx57ZAZCymMMCevGYAPEiVXSC8FMTesZAbvedK3u3ZCKnGlhJkRCl88PMRukQ4bbZARZCwZAVm5HdNZAO90CpTUKJEQwpik5gCj4WfxFzyxBX0hCRD4oYcZBOeQpl4IDuUVZAOq1DZB4mZClkSmTfKT2ilz1cQNEFFmwAaeicqWePqdw8dhFR14PEZCshL8rCTggjOJOP0zxSjUi5JVp5DTtspiHUYVeJa11FYagAdhfS7NZCjCU4xS" `
  WHATSAPP_WEBHOOK_VERIFY_TOKEN="flowserve_webhook_verify_2025" `
  WHATSAPP_BUSINESS_ACCOUNT_ID="827847299962265" `
  AI_PROVIDER="openai" `
  AI_API_KEY="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" `
  AI_MODEL="gpt-4o-mini" `
  PAYSTACK_SECRET_KEY="sk_test_d15c241e62cee9318553da63b228a793438e7a30" `
  PAYSTACK_PUBLIC_KEY="pk_test_1f9158da9244a9b7db516152682318eed06767b7" `
  CLOUDINARY_CLOUD_NAME="flowservecloud" `
  CLOUDINARY_API_KEY="853347243522818" `
  CLOUDINARY_API_SECRET="JYPQTtJLA2D8LC_oLrnSquIVw5c" `
  APP_URL="https://flowserve.vercel.app"
```

### Option B: Using Bash Script (Mac/Linux/Git Bash)

1. Create file `backend/deploy-secrets-manual.sh`:
```bash
#!/bin/bash
supabase secrets set \
  SUPABASE_URL="https://lzofgtjotkmrravxhwfk.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2ZndGpvdGttcnJhdnhod2ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2NTU4MCwiZXhwIjoyMDc5NjQxNTgwfQ.XSQBwNYZZCm5MxewH7r8oeWg09gLa4XCz5CezzRnO94" \
  SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2ZndGpvdGttcnJhdnhod2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjU1ODAsImV4cCI6MjA3OTY0MTU4MH0.Q1PoTbcSA6hw_zp1ymDETJPGTLCpGRyoBqwh69Dm50c" \
  WHATSAPP_PHONE_NUMBER_ID="923851067476532" \
  WHATSAPP_ACCESS_TOKEN="EAAWWUDjEuTsBQD9BMzLXThcstvRAZAvkjyOaZCvBZARv4VLx57ZAZCymMMCevGYAPEiVXSC8FMTesZAbvedK3u3ZCKnGlhJkRCl88PMRukQ4bbZARZCwZAVm5HdNZAO90CpTUKJEQwpik5gCj4WfxFzyxBX0hCRD4oYcZBOeQpl4IDuUVZAOq1DZB4mZClkSmTfKT2ilz1cQNEFFmwAaeicqWePqdw8dhFR14PEZCshL8rCTggjOJOP0zxSjUi5JVp5DTtspiHUYVeJa11FYagAdhfS7NZCjCU4xS" \
  WHATSAPP_WEBHOOK_VERIFY_TOKEN="flowserve_webhook_verify_2025" \
  WHATSAPP_BUSINESS_ACCOUNT_ID="827847299962265" \
  AI_PROVIDER="openai" \
  AI_API_KEY="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" \
  AI_MODEL="gpt-4o-mini" \
  PAYSTACK_SECRET_KEY="sk_test_d15c241e62cee9318553da63b228a793438e7a30" \
  PAYSTACK_PUBLIC_KEY="pk_test_1f9158da9244a9b7db516152682318eed06767b7" \
  CLOUDINARY_CLOUD_NAME="flowservecloud" \
  CLOUDINARY_API_KEY="853347243522818" \
  CLOUDINARY_API_SECRET="JYPQTtJLA2D8LC_oLrnSquIVw5c" \
  APP_URL="https://flowserve.vercel.app"

echo "✅ Supabase secrets deployed!"
```

2. Run:
```bash
chmod +x backend/deploy-secrets-manual.sh
./backend/deploy-secrets-manual.sh
```

---

## 📋 Step 2: Configure Vercel Environment Variables

### Go to Vercel Dashboard
1. Visit: https://vercel.com/[your-project]/settings/environment-variables
2. Add each variable below

### Browser-Exposed Variables (NEXT_PUBLIC_*)

```
Variable: NEXT_PUBLIC_SUPABASE_URL
Value: https://lzofgtjotkmrravxhwfk.supabase.co
Environment: Production, Preview, Development
```

```
Variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2ZndGpvdGttcnJhdnhod2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjU1ODAsImV4cCI6MjA3OTY0MTU4MH0.Q1PoTbcSA6hw_zp1ymDETJPGTLCpGRyoBqwh69Dm50c
Environment: Production, Preview, Development
```

```
Variable: NEXT_PUBLIC_APP_URL
Value: https://flowserve.vercel.app
Environment: Production, Preview, Development
```

```
Variable: NEXT_PUBLIC_PLATFORM_WHATSAPP_NUMBER
Value: 923851067476532
Environment: Production, Preview, Development
⚠️ CRITICAL: This is the shared WhatsApp number for the platform
```

```
Variable: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
Value: flowservecloud
Environment: Production, Preview, Development
```

```
Variable: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
Value: flowserve_unsigned
Environment: Production, Preview, Development
⚠️ Create this preset in Cloudinary dashboard if not exists
```

### Server-Side Only Variables (NO NEXT_PUBLIC prefix)

```
Variable: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2ZndGpvdGttcnJhdnhod2ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2NTU4MCwiZXhwIjoyMDc5NjQxNTgwfQ.XSQBwNYZZCm5MxewH7r8oeWg09gLa4XCz5CezzRnO94
Environment: Production, Preview, Development
🔒 SENSITIVE - Server-side only
```

```
Variable: PAYSTACK_SECRET_KEY
Value: sk_test_d15c241e62cee9318553da63b228a793438e7a30
Environment: Production, Preview, Development
🔒 SENSITIVE - Server-side only
```

```
Variable: CLOUDINARY_API_KEY
Value: 853347243522818
Environment: Production, Preview, Development
```

```
Variable: CLOUDINARY_API_SECRET
Value: JYPQTtJLA2D8LC_oLrnSquIVw5c
Environment: Production, Preview, Development
🔒 SENSITIVE - Server-side only
```

```
Variable: META_APP_ID
Value: 1572646177519931
Environment: Production, Preview, Development
⚠️ NOTE: This is your APP_ID from Meta
```

```
Variable: META_APP_SECRET
Value: [Get from Meta Developer Dashboard]
Environment: Production, Preview, Development
🔒 SENSITIVE - Server-side only
```

### Optional SMTP Variables (For email functionality)

```
Variable: SMTP_HOST
Value: smtp.gmail.com
Environment: Production, Preview, Development
```

```
Variable: SMTP_PORT
Value: 587
Environment: Production, Preview, Development
```

```
Variable: SMTP_SECURE
Value: false
Environment: Production, Preview, Development
```

```
Variable: SMTP_USER
Value: [Your Gmail]
Environment: Production, Preview, Development
```

```
Variable: SMTP_PASSWORD
Value: [Gmail App Password]
Environment: Production, Preview, Development
🔒 SENSITIVE - Use App Password, not regular password
```

```
Variable: SMTP_FROM_EMAIL
Value: [Your Gmail]
Environment: Production, Preview, Development
```

```
Variable: SMTP_FROM_NAME
Value: FlowServe AI
Environment: Production, Preview, Development
```

---

## ✅ Verification Checklist

### Backend (Supabase)
- [ ] Run `supabase secrets list` to verify all secrets are set
- [ ] Confirm `WHATSAPP_PHONE_NUMBER_ID=923851067476532`
- [ ] Confirm `WHATSAPP_BUSINESS_ACCOUNT_ID=827847299962265`
- [ ] Deploy functions: `supabase functions deploy whatsapp-agent`
- [ ] Deploy functions: `supabase functions deploy whatsapp-webhook`

### Frontend (Vercel)
- [ ] All NEXT_PUBLIC_ variables are set
- [ ] All server-side secrets are set (no NEXT_PUBLIC_ prefix)
- [ ] `NEXT_PUBLIC_PLATFORM_WHATSAPP_NUMBER=923851067476532` is set
- [ ] `META_APP_ID=1572646177519931` is set (NOT WHATSAPP_PHONE_NUMBER_ID)
- [ ] Redeploy: `git push` will trigger auto-deploy

### Critical Distinctions
```
Backend uses:     WHATSAPP_PHONE_NUMBER_ID=923851067476532
Frontend uses:    NEXT_PUBLIC_PLATFORM_WHATSAPP_NUMBER=923851067476532

These should have the SAME VALUE (your WhatsApp number)
```

```
Frontend uses:    META_APP_ID=1572646177519931
This is your Meta App ID (different from phone number ID)
```

---

## 🚨 Security Reminders

1. **NEVER** expose these with `NEXT_PUBLIC_` prefix:
   - `PAYSTACK_SECRET_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLOUDINARY_API_SECRET`
   - `META_APP_SECRET`
   - `SMTP_PASSWORD`
   - `AI_API_KEY`

2. **ALWAYS** use `NEXT_PUBLIC_` for:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `APP_URL`
   - `PLATFORM_WHATSAPP_NUMBER`
   - `CLOUDINARY_CLOUD_NAME`

3. After setting Vercel variables, **redeploy** your app.

---

## 📞 Quick Reference

| Purpose | Backend Variable | Frontend Variable | Value |
|---------|-----------------|-------------------|-------|
| WhatsApp Phone Number | `WHATSAPP_PHONE_NUMBER_ID` | `NEXT_PUBLIC_PLATFORM_WHATSAPP_NUMBER` | `923851067476532` |
| WhatsApp Business ID | `WHATSAPP_BUSINESS_ACCOUNT_ID` | N/A | `827847299962265` |
| Meta App ID | N/A | `META_APP_ID` | `1572646177519931` |
