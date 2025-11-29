# Environment Variables Setup Guide

## 🔐 Supabase Edge Functions (Backend)

### Deploy Secrets to Supabase

**Windows (PowerShell):**
```powershell
cd backend
.\deploy-secrets.ps1
```

**Mac/Linux (Bash):**
```bash
cd backend
bash deploy-secrets.sh
```

### Required Secrets for Edge Functions:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (from Supabase Dashboard > Settings > API)
- `SUPABASE_ANON_KEY` - Anon public key
- `WHATSAPP_PHONE_NUMBER_ID` - From Meta Developer Dashboard
- `WHATSAPP_ACCESS_TOKEN` - From Meta Developer Dashboard
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` - Custom token for webhook verification
- `WHATSAPP_BUSINESS_ACCOUNT_ID` - From Meta Developer Dashboard (MUST be different from Phone Number ID)
- `AI_PROVIDER` - "openai" or "anthropic"
- `AI_API_KEY` - Your OpenAI or Anthropic API key
- `AI_MODEL` - "gpt-4o-mini" or other model
- `PAYSTACK_SECRET_KEY` - From Paystack Dashboard
- `PAYSTACK_PUBLIC_KEY` - From Paystack Dashboard
- `CLOUDINARY_CLOUD_NAME` - From Cloudinary Dashboard
- `CLOUDINARY_API_KEY` - From Cloudinary Dashboard
- `CLOUDINARY_API_SECRET` - From Cloudinary Dashboard
- `APP_URL` - Your production URL (e.g., https://flowserve.vercel.app)

---

## 🌐 Vercel (Frontend)

### Add these environment variables in Vercel Dashboard:

1. Go to: https://vercel.com/your-project/settings/environment-variables

2. Add the following variables:

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` = `https://lzofgtjotkmrravxhwfk.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key)

#### Paystack (Server-Side Only - NO NEXT_PUBLIC prefix!)
- `PAYSTACK_SECRET_KEY` = `sk_test_...` (your secret key)
- `PAYSTACK_PUBLIC_KEY` = `pk_test_...` (your public key)

#### Cloudinary
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = `flowservecloud`
- `CLOUDINARY_API_KEY` = `853347243522818`
- `CLOUDINARY_API_SECRET` = `JYPQTtJLA2D8LC_oLrnSquIVw5c`

#### App
- `NEXT_PUBLIC_APP_URL` = `https://flowserve.vercel.app`
- `NEXT_PUBLIC_PLATFORM_WHATSAPP_NUMBER` = `15550239843` (or your platform number)

---

## ⚠️ CRITICAL SECURITY NOTES:

1. **NEVER** use `NEXT_PUBLIC_` prefix for secret keys (Paystack Secret, Cloudinary Secret, etc.)
2. **ONLY** use `NEXT_PUBLIC_` for values that are safe to expose in the browser
3. The Paystack payment initialization is now handled server-side via `/api/paystack/initialize`
4. Verify that `WHATSAPP_BUSINESS_ACCOUNT_ID` is different from `WHATSAPP_PHONE_NUMBER_ID`

---

## 📝 How to Get Missing Values:

### Supabase Service Role Key:
1. Go to: https://supabase.com/dashboard/project/lzofgtjotkmrravxhwfk/settings/api
2. Copy the "service_role" key (NOT the anon key)

### Paystack Public Key:
1. Go to: https://dashboard.paystack.com/#/settings/developer
2. Copy the "Public Key" (starts with `pk_test_` or `pk_live_`)

### WhatsApp Business Account ID:
1. Go to: https://developers.facebook.com/apps/
2. Select your app
3. Go to WhatsApp > API Setup
4. Look for "WhatsApp Business Account ID" (should be different from Phone Number ID)

### OpenAI API Key:
1. Go to: https://platform.openai.com/api-keys
2. Create a new secret key
