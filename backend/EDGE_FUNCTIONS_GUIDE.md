# Supabase Edge Functions Guide

## What Are Edge Functions?

Edge Functions are serverless functions that run on Supabase's infrastructure using **Deno** (not Node.js). They're similar to AWS Lambda or Vercel Functions but optimized for Supabase.

## Why Deno, Not Node.js?

Deno is a modern JavaScript/TypeScript runtime that's:
- More secure (no file system access by default)
- Faster cold starts
- Built-in TypeScript support
- No `node_modules` needed

## Key Differences from Node.js

### Imports
```typescript
// ❌ Node.js style (won't work)
const express = require('express')
import { config } from '../shared/config'

// ✅ Deno style (correct)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { config } from '../_shared/config.ts'  // Note the .ts extension
```

### NPM Packages
```typescript
// Use npm: prefix for npm packages
import Stripe from "npm:stripe@^12.0.0"
import OpenAI from "npm:openai@^4.0.0"
```

### Environment Variables
```typescript
// Access via Deno.env
const apiKey = Deno.env.get('OPENAI_API_KEY')
```

## Your Edge Functions Structure

```
backend/supabase/functions/
├── _shared/                    # Shared utilities
│   ├── config.ts              # Environment config
│   ├── ai-service.ts          # OpenAI integration
│   ├── whatsapp-sender.ts     # WhatsApp API client
│   ├── invoice-generator.ts   # PDF generation
│   └── email-sender.ts        # Email service
│
├── whatsapp-webhook/          # Receives WhatsApp messages
│   └── index.ts
│
├── whatsapp-agent/            # AI agent processing
│   └── index.ts
│
├── paystack-webhook/          # Payment notifications
│   └── index.ts
│
├── send-payment-confirmation/ # Email confirmations
│   └── index.ts
│
└── media-cleanup-cron/        # Scheduled cleanup
    └── index.ts
```

## How Each Function Works

### 1. whatsapp-webhook
**Purpose**: Receives incoming WhatsApp messages from Meta

**Flow**:
1. Meta sends POST request when user messages your WhatsApp
2. Function validates webhook signature
3. Extracts message data
4. Stores in `whatsapp_messages` table
5. Triggers `whatsapp-agent` function

**Deployment**:
```bash
supabase functions deploy whatsapp-webhook
```

**Webhook URL**: 
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/whatsapp-webhook
```

### 2. whatsapp-agent
**Purpose**: Processes messages with AI and responds

**Flow**:
1. Triggered by new message in database
2. Loads conversation context
3. Calls OpenAI to generate response
4. Handles commands (book property, make payment, etc.)
5. Sends response via WhatsApp API

**Deployment**:
```bash
supabase functions deploy whatsapp-agent
```

### 3. paystack-webhook
**Purpose**: Receives payment notifications from Paystack

**Flow**:
1. Paystack sends POST when payment succeeds/fails
2. Function validates webhook signature
3. Updates order status in database
4. Triggers confirmation email

**Deployment**:
```bash
supabase functions deploy paystack-webhook
```

**Webhook URL**:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/paystack-webhook
```

### 4. send-payment-confirmation
**Purpose**: Sends email confirmations with invoices

**Flow**:
1. Triggered when order status changes to 'completed'
2. Generates PDF invoice
3. Sends email with invoice attached
4. Updates notification in database

**Deployment**:
```bash
supabase functions deploy send-payment-confirmation
```

### 5. media-cleanup-cron
**Purpose**: Scheduled cleanup of old media files

**Flow**:
1. Runs daily (configured in Supabase Dashboard)
2. Finds media files older than 30 days
3. Deletes from storage
4. Updates database records

**Deployment**:
```bash
supabase functions deploy media-cleanup-cron
```

**Schedule**: Set in Supabase Dashboard > Database > Cron Jobs

## Deploying Functions

### First Time Setup

1. **Install Supabase CLI**:
```bash
npm install -g supabase
```

2. **Login**:
```bash
supabase login
```

3. **Link Project**:
```bash
cd backend
supabase link --project-ref lzofgtjotkmrravxhwfk
```

### Deploy All Functions

```bash
# Deploy each function
supabase functions deploy whatsapp-webhook
supabase functions deploy whatsapp-agent
supabase functions deploy paystack-webhook
supabase functions deploy send-payment-confirmation
supabase functions deploy media-cleanup-cron
```

### Set Environment Secrets

```bash
# Required for all functions
supabase secrets set SUPABASE_URL=https://lzofgtjotkmrravxhwfk.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp functions
supabase secrets set WHATSAPP_API_TOKEN=0b08b5bf4c69ce5e6adaf9c8988a73d6
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=1572646177519931
supabase secrets set WHATSAPP_BUSINESS_ACCOUNT_ID=1572646177519931

# AI agent
supabase secrets set OPENAI_API_KEY=your_openai_key

# Payment functions
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_28fb9289dc5ddf3910c92d040fecc11e7beeeb19

# Email functions
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=onyemechicaleb4@gmail.com
supabase secrets set SMTP_PASSWORD=vapmmsbaootvgtau
```

## Testing Functions

### Local Testing

1. **Start Supabase locally**:
```bash
cd backend
supabase start
```

2. **Serve functions**:
```bash
supabase functions serve
```

3. **Test with curl**:
```bash
# Test whatsapp-webhook
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{"entry": [{"changes": [{"value": {"messages": [{"from": "1234567890", "text": {"body": "Hello"}}]}}]}]}'
```

### Production Testing

```bash
# View logs
supabase functions logs whatsapp-webhook --tail

# Test deployed function
curl -X POST https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Common Issues

### Import Errors
```
Error: Cannot find module '../_shared/config'
```
**Fix**: Add `.ts` extension
```typescript
import { config } from '../_shared/config.ts'
```

### CORS Errors
```
Access to fetch at '...' from origin '...' has been blocked by CORS
```
**Fix**: Add CORS headers
```typescript
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  },
})
```

### Timeout Errors
```
Function execution timed out
```
**Fix**: Edge Functions have 150s timeout. Optimize long-running tasks or use database triggers.

### Environment Variable Not Found
```
Error: OPENAI_API_KEY is not defined
```
**Fix**: Set the secret
```bash
supabase secrets set OPENAI_API_KEY=your_key
```

## Monitoring

### View Logs
```bash
# Real-time logs
supabase functions logs whatsapp-webhook --tail

# Last 100 lines
supabase functions logs whatsapp-webhook

# Specific time range
supabase functions logs whatsapp-webhook --since 1h
```

### Check Function Status
```bash
supabase functions list
```

### View Secrets
```bash
supabase secrets list
```

## Best Practices

1. **Always use `.ts` extension in imports**
2. **Add CORS headers to all responses**
3. **Validate webhook signatures** (WhatsApp, Paystack)
4. **Use try-catch for error handling**
5. **Log errors for debugging**
6. **Keep functions small and focused**
7. **Use `_shared` for reusable code**

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Deno Standard Library](https://deno.land/std)

## Summary

- Edge Functions = Serverless functions using Deno
- Deploy with `supabase functions deploy`
- Set secrets with `supabase secrets set`
- View logs with `supabase functions logs`
- Always use `.ts` extension in imports
- Test locally with `supabase functions serve`

Your backend is ready to deploy! 🚀
