# Backend - Supabase Edge Functions

This directory contains Supabase Edge Functions (Deno-based serverless functions) and database migrations.

## Structure

```
backend/
├── supabase/
│   ├── functions/           # Edge Functions (Deno)
│   │   ├── _shared/        # Shared utilities and services
│   │   ├── whatsapp-webhook/      # Receives WhatsApp messages
│   │   ├── whatsapp-agent/        # AI agent processing
│   │   ├── paystack-webhook/      # Payment webhooks
│   │   ├── send-payment-confirmation/  # Email confirmations
│   │   └── media-cleanup-cron/    # Scheduled cleanup
│   └── migrations/         # Database schema migrations
```

## Edge Functions Overview

### _shared/
Contains reusable code shared across functions:
- `config.ts` - Environment configuration
- `ai-service.ts` - OpenAI integration
- `whatsapp-sender.ts` - WhatsApp API client
- `invoice-generator.ts` - PDF invoice generation
- `email-sender.ts` - Email service

### whatsapp-webhook/
- Receives incoming WhatsApp messages
- Validates webhook signatures
- Queues messages for processing

### whatsapp-agent/
- Processes WhatsApp messages with AI
- Handles property inquiries, bookings, payments
- Generates invoices and confirmations

### paystack-webhook/
- Receives payment notifications from Paystack
- Updates order status
- Triggers confirmation emails

### send-payment-confirmation/
- Sends payment confirmation emails
- Generates and attaches invoices

### media-cleanup-cron/
- Scheduled function to clean up old media files
- Runs daily to free up storage

## Local Development

### Prerequisites
- Deno installed: https://deno.land/
- Supabase CLI: `npm install -g supabase`

### Setup
```bash
cd backend
supabase start
supabase functions serve
```

### Test Functions Locally
```bash
# Test whatsapp-webhook
curl -X POST http://localhost:54321/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{"entry": [{"changes": [{"value": {"messages": [{"from": "1234567890", "text": {"body": "Hello"}}]}}]}]}'
```

## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for full deployment instructions.

Quick deploy:
```bash
supabase functions deploy whatsapp-webhook
supabase functions deploy whatsapp-agent
supabase functions deploy paystack-webhook
```

## Environment Variables

Required secrets for Edge Functions:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin access
- `WHATSAPP_API_TOKEN` - Meta WhatsApp Business API token
- `WHATSAPP_PHONE_NUMBER_ID` - Your WhatsApp phone number ID
- `OPENAI_API_KEY` - OpenAI API key for AI agent
- `PAYSTACK_SECRET_KEY` - Paystack secret key for payments

Set secrets:
```bash
supabase secrets set KEY=value
```

## Deno vs Node.js

Edge Functions use Deno, not Node.js:
- Use `import` instead of `require`
- Use Deno standard library: `https://deno.land/std`
- Use npm packages via CDN: `npm:package-name`
- No `package.json` needed

Example import:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "npm:stripe@^12.0.0"
```

## Debugging

### View Logs
```bash
supabase functions logs whatsapp-webhook --tail
```

### Common Issues

**Import errors**: Make sure to use full URLs for imports
```typescript
// ❌ Wrong
import { config } from '../_shared/config'

// ✅ Correct
import { config } from '../_shared/config.ts'
```

**CORS errors**: Add CORS headers to responses
```typescript
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
})
```

**Timeout errors**: Edge Functions have 150s timeout limit

## Testing

Test individual functions:
```bash
# Unit test
deno test supabase/functions/whatsapp-agent/index.test.ts

# Integration test with local Supabase
supabase functions serve
curl http://localhost:54321/functions/v1/whatsapp-webhook
```
