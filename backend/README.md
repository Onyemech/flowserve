# FlowServe AI - Backend

This folder contains Supabase Edge Functions (Deno-based serverless functions).

## Structure

```
backend/
└── supabase/
    └── functions/
        ├── paystack-webhook/          # Handles Paystack payment webhooks
        ├── whatsapp-webhook-receiver/ # Forwards WhatsApp messages to n8n
        └── media-cleanup-cron/        # Scheduled cleanup of old media
```

## Supabase Edge Functions

These are Deno-based serverless functions that run on Supabase infrastructure.

### paystack-webhook
- Receives Paystack payment notifications
- Verifies webhook signature
- Updates order status
- Initiates transfer to business owner
- Soft-deletes properties when sold

### whatsapp-webhook-receiver
- Receives WhatsApp Cloud API webhooks
- Forwards messages to n8n for AI processing
- Handles webhook verification

### media-cleanup-cron
- Scheduled function (runs daily)
- Deletes images from Cloudinary for properties soft-deleted > 14 days
- Updates storage usage tracking

## Installation

Supabase CLI is installed as a dev dependency:

```bash
cd backend
npm install
```

## Deployment

Deploy functions using npm scripts:

```bash
# Login to Supabase
npm run supabase login

# Link to your project
npm run supabase link --project-ref your-project-ref

# Deploy all functions
npm run deploy

# Deploy specific function
npm run deploy:paystack
npm run deploy:whatsapp
npm run deploy:cleanup
```

## Environment Variables

Set these in Supabase Dashboard → Edge Functions → Secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `N8N_WEBHOOK_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Local Development

```bash
# Serve functions locally
npm run serve:paystack
npm run serve:whatsapp
npm run serve:cleanup
```

## Next.js API Routes

Next.js API routes are located in `frontend/src/app/api/` and handle:
- Payment link generation
- Manual payment confirmation
- File uploads to Cloudinary
- User profile updates
- Other frontend-to-backend operations

## Architecture

```
Frontend (Next.js)
    ↓
Next.js API Routes (/api/*)
    ↓
Supabase (Database + Auth)
    ↓
Supabase Edge Functions (Webhooks)
    ↓
External Services (Paystack, WhatsApp, n8n)
```
