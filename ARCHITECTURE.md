# FlowServe AI - Architecture Overview

## Project Structure

```
flowserve/
├── frontend/                          # Next.js 14+ Application
│   ├── src/
│   │   ├── app/                      # App Router
│   │   │   ├── api/                  # Next.js API Routes (Backend)
│   │   │   │   ├── payments/        # Payment operations
│   │   │   │   └── media/           # File uploads
│   │   │   ├── auth/                # Auth pages
│   │   │   ├── dashboard/           # Dashboard pages
│   │   │   └── page.tsx             # Landing page
│   │   ├── components/              # React components
│   │   │   └── ui/                  # Reusable UI components
│   │   ├── lib/                     # Utilities
│   │   │   ├── supabase/           # Supabase clients
│   │   │   └── utils/              # Helper functions
│   │   └── types/                   # TypeScript types
│   └── public/                      # Static assets
│
├── backend/                          # Supabase Edge Functions
│   └── supabase/
│       └── functions/
│           ├── paystack-webhook/    # Payment webhooks
│           ├── whatsapp-webhook-receiver/  # WhatsApp forwarding
│           └── media-cleanup-cron/  # Scheduled cleanup
│
└── n8n/                             # n8n workflows (to be created)
    └── workflows/
        └── whatsapp-ai-agent.json   # AI agent workflow
```

## Backend Architecture

### 1. Next.js API Routes (`frontend/src/app/api/`)

**Purpose:** Handle frontend-to-backend operations

**Routes:**
- `/api/payments/create-link` - Generate Paystack payment links
- `/api/payments/confirm-manual` - Confirm manual payments
- `/api/media/upload` - Upload files to Cloudinary
- `/api/media/delete` - Delete files from Cloudinary
- `/api/profile/update` - Update user profile

**Technology:** Next.js 14+ Server Actions & Route Handlers

### 2. Supabase Edge Functions (`backend/supabase/functions/`)

**Purpose:** Handle external webhooks and scheduled tasks

**Functions:**
- `paystack-webhook` - Receives Paystack payment notifications
- `whatsapp-webhook-receiver` - Forwards WhatsApp messages to n8n
- `media-cleanup-cron` - Scheduled cleanup (runs daily)

**Technology:** Deno (TypeScript runtime)

### 3. Supabase Database

**Purpose:** PostgreSQL database with Row Level Security

**Tables:**
- `flowserve_users` - Business owners
- `properties` - Real estate listings
- `services` - Event planning services
- `orders` - Customer orders
- `whatsapp_sessions` - Conversation context
- `cloudinary_usage` - Storage tracking

**SQL Functions:**
- `sync_auth_user_to_public()` - Auto-sync auth users
- `update_user_profile()` - Update profile
- `verify_email()` - Email verification
- `validate_reset_token()` - Password reset
- `soft_delete_property()` - Mark property as sold
- `cleanup_old_media()` - Get old media for cleanup

### 4. n8n Workflows

**Purpose:** AI agent logic for WhatsApp automation

**Workflows:**
- WhatsApp message handling
- AI intent processing (OpenAI/Grok/Groq/etc.)
- Property/service queries
- Payment option presentation
- Session management

## Data Flow

### Payment Flow
```
Customer → WhatsApp → n8n → Paystack Link
                              ↓
                         Payment Made
                              ↓
                    Paystack Webhook
                              ↓
              Supabase Edge Function
                              ↓
                  Update Order Status
                              ↓
              Transfer to Business Owner
                              ↓
            Soft Delete Property (if applicable)
                              ↓
          Send Confirmation (WhatsApp + Email)
```

### WhatsApp Message Flow
```
Customer → WhatsApp Cloud API
                ↓
    Supabase Edge Function (webhook receiver)
                ↓
           n8n Workflow
                ↓
        AI Intent Processing
                ↓
      Query Supabase Database
                ↓
      Format Response + Images
                ↓
    Send via WhatsApp Cloud API
                ↓
    Update Session in Database
```

### File Upload Flow
```
Admin → Frontend Upload
            ↓
    Next.js API Route
            ↓
    Upload to Cloudinary
            ↓
    Update cloudinary_usage
            ↓
    Return URL to Frontend
```

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State:** React Context API
- **PWA:** next-pwa

### Backend
- **API Routes:** Next.js Server Actions
- **Serverless:** Supabase Edge Functions (Deno)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Automation:** n8n

### External Services
- **Payments:** Paystack
- **Messaging:** WhatsApp Cloud API
- **Media:** Cloudinary
- **Email:** Resend/SendGrid
- **AI:** OpenAI/Grok/Groq (configurable)

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Backend (Supabase Secrets)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
N8N_WEBHOOK_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Deployment

### Frontend
- **Platform:** Vercel
- **Command:** `npm run build`
- **Auto-deploy:** Push to main branch

### Backend (Supabase Edge Functions)
- **Platform:** Supabase
- **Command:** `supabase functions deploy`
- **Manual deploy:** Via Supabase CLI

### n8n
- **Platform:** Self-hosted or n8n Cloud
- **Setup:** Import workflow JSON files

## Security

- **RLS:** All tables have Row Level Security enabled
- **Auth:** Supabase Auth with JWT tokens
- **Webhooks:** Signature verification (Paystack)
- **API Keys:** Stored in environment variables
- **HTTPS:** All communications encrypted

## Currency

All monetary values use **Nigerian Naira (₦)**

## Brand Colors

- Primary: `#20C997` (Teal/Green)
- Secondary: `#4A90E2` (Blue)
- Accent: `#50E3C2` (Light Teal)
