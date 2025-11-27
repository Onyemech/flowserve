# Design Document

## Overview

FlowServe AI is a full-stack Progressive Web Application built with Next.js (frontend), Supabase (backend/database), and integrated with WhatsApp Cloud API, Paystack, and Cloudinary. The architecture follows a loosely coupled, service-oriented design with reusable components and clear separation of concerns.

### Technology Stack

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React Context API for state management
- PWA capabilities (service workers, offline support)

**Backend:**
- Supabase (PostgreSQL database, Authentication, Row Level Security)
- Supabase Edge Functions (serverless functions)
- PostgreSQL SQL Functions for data operations

**Integrations:**
- WhatsApp Cloud API (customer interactions)
- Paystack API (payments and transfers)
- Cloudinary API (media storage and delivery)
- Email service (Resend or SendGrid for transactional emails)
- n8n (workflow automation for AI agent logic)
- OpenAI API or similar (for natural language understanding - free tier)

**Design System:**
- Primary Color: `#20C997` (teal/green from landing page)
- Secondary Color: `#4A90E2` (blue from dashboard)
- Accent Color: `#50E3C2` (light teal)
- Currency: Nigerian Naira (₦)
- Toast Notifications: Rectangle with rounded corners, branded contrast colors

## Architecture

### AI Agent Strategy with n8n

The WhatsApp AI agent is built using n8n workflow automation to keep costs low while maintaining flexibility. This approach allows:

- **Visual workflow design** - Easy to modify and debug agent logic
- **Free tier usage** - n8n can be self-hosted or use cloud free tier
- **No-code/low-code** - Reduce development time for AI logic
- **Integration flexibility** - Easy to swap AI providers (OpenAI, Anthropic, local models)
- **Session management** - Built-in state management between nodes

**AI Processing Flow:**
1. Customer message → WhatsApp Cloud API → n8n webhook
2. n8n identifies business and loads session context from Supabase
3. n8n sends message to OpenAI API (or free alternative) for intent extraction
4. Based on intent, n8n queries Supabase for properties/services
5. n8n formats response with images and sends via WhatsApp Cloud API
6. n8n updates session context in Supabase

**Loose Coupling AI Provider Strategy:**

The system uses an abstraction layer in n8n that allows switching between AI providers without changing the core workflow:

- **n8n Function Node** acts as AI provider abstraction
- Environment variable `AI_PROVIDER` determines which API to use
- All providers return standardized JSON: `{ intent, entities, confidence }`
- Easy to swap providers by changing configuration

**Supported AI Providers (interchangeable):**
- OpenAI API (GPT-3.5/4)
- Grok API (xAI)
- Anthropic Claude API
- Hugging Face Inference API (free tier)
- Local LLM via Ollama (completely free, self-hosted)
- Groq API (fast inference, free tier)
- Simple keyword matching fallback (no AI cost)

**Implementation:**
- n8n Switch node routes to appropriate AI provider based on config
- Each provider has its own HTTP Request node with specific formatting
- Response normalizer Function node converts all responses to standard format
- Fallback to keyword matching if AI provider fails

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (PWA)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │  │     Auth     │  │   Dashboard  │     │
│  │     Page     │  │    Pages     │  │    Pages     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     
 │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  API Routes  │  │  Middleware  │  │  Server      │     │
│  │              │  │              │  │  Actions     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Services Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Supabase   │  │   Supabase   │  │  PostgreSQL  │     │
│  │     Auth     │  │     Edge     │  │     SQL      │     │
│  │              │  │   Functions  │  │   Functions  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Integrations                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   WhatsApp   │  │   Paystack   │  │  Cloudinary  │     │
│  │   Cloud API  │  │     API      │  │     API      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    n8n Workflow Engine                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   WhatsApp   │  │   OpenAI     │  │   Business   │     │
│  │   Message    │  │   Intent     │  │    Logic     │     │
│  │   Handler    │  │  Processing  │  │   Workflows  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication Flow:**
   - User registers/logs in via Next.js auth pages
   - Supabase Auth creates record in `auth.users`
   - SQL trigger/function syncs data to `public.users`
   - JWT token issued for subsequent requests

2. **WhatsApp Message Flow:**
   - Customer sends message → WhatsApp Cloud API webhook
   - Webhook hits Supabase Edge Function
   - Edge Function processes intent, queries database
   - Response sent back to WhatsApp Cloud API
   - Message delivered to customer

3. **Payment Flow:**
   - Customer selects payment → Paystack link generated
   - Customer pays → Paystack webhook to Edge Function
   - Edge Function verifies payment, initiates transfer
   - SQL function updates order status, soft-deletes property
   - Confirmation sent via WhatsApp and email

## Components and Interfaces

### Database Schema (public schema)

#### users table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  business_name TEXT,
  business_type TEXT CHECK (business_type IN ('real_estate', 'event_planning')),
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  bank_code TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMPTZ,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### properties table (Real Estate)
```sql
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  description TEXT,
  location TEXT,
  images JSONB, -- Array of Cloudinary URLs
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### services table (Event Planning)
```sql
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15, 2) NOT NULL,
  images JSONB, -- Array of Cloudinary URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### orders table
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  order_type TEXT CHECK (order_type IN ('property', 'service')),
  item_id UUID, -- References properties.id or services.id
  amount DECIMAL(15, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('paystack', 'manual')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  paystack_reference TEXT UNIQUE,
  transfer_status TEXT CHECK (transfer_status IN ('pending', 'completed', 'failed')),
  transfer_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### whatsapp_sessions table
```sql
CREATE TABLE public.whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  session_data JSONB, -- Conversation context
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### cloudinary_usage table
```sql
CREATE TABLE public.cloudinary_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  total_storage_mb DECIMAL(10, 2) DEFAULT 0,
  total_assets INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

### SQL Functions

#### sync_auth_user_to_public()
```sql
CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_auth_user_to_public();
```

#### update_user_profile()
```sql
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_business_name TEXT,
  p_business_type TEXT,
  p_bank_name TEXT,
  p_account_number TEXT,
  p_account_name TEXT,
  p_bank_code TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET 
    full_name = p_full_name,
    business_name = p_business_name,
    business_type = p_business_type,
    bank_name = p_bank_name,
    account_number = p_account_number,
    account_name = p_account_name,
    bank_code = p_bank_code,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### verify_email()
```sql
CREATE OR REPLACE FUNCTION verify_email(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM public.users
  WHERE verification_token = p_token
    AND verification_token_expires_at > NOW();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.users
  SET 
    email_verified = TRUE,
    verification_token = NULL,
    verification_token_expires_at = NULL,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### reset_password()
```sql
CREATE OR REPLACE FUNCTION reset_password(
  p_token TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM public.users
  WHERE reset_token = p_token
    AND reset_token_expires_at > NOW();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update password in auth.users (handled by Supabase Auth API)
  -- Clear reset token
  UPDATE public.users
  SET 
    reset_token = NULL,
    reset_token_expires_at = NULL,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### soft_delete_property()
```sql
CREATE OR REPLACE FUNCTION soft_delete_property(p_property_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.properties
  SET 
    status = 'sold',
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### cleanup_old_media()
```sql
CREATE OR REPLACE FUNCTION cleanup_old_media()
RETURNS TABLE(property_id UUID, images JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT id, properties.images
  FROM public.properties
  WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '14 days'
    AND images IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloudinary_usage ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Users can view own properties" ON public.properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON public.properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON public.properties
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for services, orders, whatsapp_sessions, cloudinary_usage
```

### Frontend Components

#### Reusable UI Components

1. **Button Component**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}
```

2. **Toast Component**
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
// Rectangle with rounded corners, branded colors
```

3. **Card Component**
```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}
```

4. **Modal Component**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

#### Page Components

1. **Landing Page** (`/`)
   - Hero section with CTA
   - Features showcase
   - Pricing (if applicable)
   - Footer with links

2. **Auth Pages**
   - `/auth/login` - Email/password + Google OAuth
   - `/auth/register` - Email/password + Google OAuth
   - `/auth/verify-email` - Email verification
   - `/auth/forgot-password` - Request reset
   - `/auth/reset-password` - Reset with token

3. **Dashboard Pages**
   - `/dashboard` - Home overview
   - `/dashboard/properties` - Property management (Real Estate)
   - `/dashboard/services` - Service management (Event Planning)
   - `/dashboard/orders` - Order history
   - `/dashboard/customers` - Customer list
   - `/dashboard/payments` - Payment overview
   - `/dashboard/settings` - Business settings
   - `/dashboard/whatsapp` - WhatsApp bot settings
   - `/dashboard/storage` - Cloudinary usage tracker

### API Routes

#### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth callback
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Properties (Real Estate)
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Soft delete property
- `POST /api/properties/:id/restore` - Restore soft-deleted property

#### Services (Event Planning)
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

#### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/confirm-payment` - Confirm manual payment

#### Payments
- `POST /api/payments/create-link` - Generate Paystack payment link
- `POST /api/payments/webhook` - Paystack webhook handler
- `GET /api/payments/transactions` - List transactions

#### Media
- `POST /api/media/upload` - Upload to Cloudinary
- `DELETE /api/media/:id` - Delete from Cloudinary
- `GET /api/media/usage` - Get Cloudinary usage stats

### n8n Workflow Automation

#### WhatsApp AI Agent Workflow
n8n will handle the AI agent logic with the following workflow:

1. **Webhook Trigger** - Receives WhatsApp messages from WhatsApp Cloud API
2. **Business Identification** - Query Supabase to identify which business the message is for
3. **Session Management** - Load or create session context from whatsapp_sessions table
4. **AI Intent Processing** - Use configurable AI provider to understand customer intent
5. **Database Query** - Based on intent, query properties/services from Supabase
6. **Response Generation** - Format response with images and text
7. **WhatsApp Send** - Send response via WhatsApp Cloud API
8. **Session Update** - Update whatsapp_sessions table with conversation context

#### n8n Workflow Nodes:
- **Webhook Node** - Receive WhatsApp messages
- **Supabase Node** - Query database for business, properties, services, sessions
- **Switch Node** - Route to appropriate AI provider based on config
- **HTTP Request Nodes** - Multiple nodes for different AI providers (OpenAI, Grok, Claude, Groq, etc.)
- **Function Node** - Normalize AI responses to standard format
- **Function Node** - Keyword matching fallback
- **Function Node** - Custom logic for filtering and formatting
- **HTTP Request Node** - Send messages via WhatsApp Cloud API
- **Supabase Node** - Update session and create orders

#### AI Provider Abstraction Layer

**Standard Intent Response Format:**
```json
{
  "intent": "view_properties" | "view_services" | "make_payment" | "ask_question" | "greeting",
  "entities": {
    "property_type": "3-bedroom",
    "price_range": "under_10M",
    "service_type": "wedding_decor"
  },
  "confidence": 0.85,
  "raw_response": "..."
}
```

**n8n AI Provider Switch Logic:**
```javascript
// Function Node: AI Provider Router
const provider = $env.AI_PROVIDER || 'keyword'; // Default to keyword matching

return {
  provider: provider,
  message: $json.message,
  context: $json.session_context
};
```

**Provider-Specific HTTP Request Nodes:**

1. **OpenAI Provider:**
```javascript
// HTTP Request to OpenAI
POST https://api.openai.com/v1/chat/completions
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {"role": "system", "content": "Extract intent from customer message..."},
    {"role": "user", "content": "{{$json.message}}"}
  ]
}
```

2. **Grok Provider:**
```javascript
// HTTP Request to Grok (xAI)
POST https://api.x.ai/v1/chat/completions
{
  "model": "grok-beta",
  "messages": [...]
}
```

3. **Groq Provider:**
```javascript
// HTTP Request to Groq
POST https://api.groq.com/openai/v1/chat/completions
{
  "model": "mixtral-8x7b-32768",
  "messages": [...]
}
```

4. **Keyword Matching Fallback:**
```javascript
// Function Node: Simple keyword matching
const message = $json.message.toLowerCase();
let intent = 'ask_question';
let entities = {};

if (message.includes('property') || message.includes('house')) {
  intent = 'view_properties';
  if (message.includes('bedroom')) {
    entities.property_type = message.match(/(\d+)[\s-]?bedroom/)?.[1] + '-bedroom';
  }
  if (message.includes('under') || message.includes('below')) {
    entities.price_range = 'budget';
  }
} else if (message.includes('service') || message.includes('event')) {
  intent = 'view_services';
} else if (message.includes('pay') || message.includes('buy')) {
  intent = 'make_payment';
} else if (message.includes('hello') || message.includes('hi')) {
  intent = 'greeting';
}

return {
  intent,
  entities,
  confidence: 0.7,
  provider: 'keyword'
};
```

**Response Normalizer Function:**
```javascript
// Function Node: Normalize AI responses
const provider = $json.provider;
let normalized = {
  intent: 'ask_question',
  entities: {},
  confidence: 0.5
};

if (provider === 'openai' || provider === 'grok' || provider === 'groq') {
  // Parse structured response from AI
  const aiResponse = JSON.parse($json.response.choices[0].message.content);
  normalized = aiResponse;
} else if (provider === 'keyword') {
  // Already in correct format
  normalized = $json;
}

return normalized;
```

### Supabase Edge Functions

#### whatsapp-webhook-receiver
Lightweight function that forwards WhatsApp webhooks to n8n:
```typescript
// Deno Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const body = await req.json()
  
  // Forward to n8n webhook
  await fetch(Deno.env.get('N8N_WEBHOOK_URL'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

#### paystack-webhook
Handles Paystack payment webhooks:
```typescript
serve(async (req) => {
  const signature = req.headers.get("x-paystack-signature")
  const body = await req.text()
  
  // 1. Verify webhook signature
  // 2. Extract payment data
  // 3. Update order status
  // 4. Initiate transfer to business owner
  // 5. Soft delete property if applicable
  // 6. Send confirmation via WhatsApp and email
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

#### media-cleanup-cron
Scheduled function (runs daily):
```typescript
serve(async (req) => {
  // 1. Query properties soft-deleted > 14 days
  // 2. Delete images from Cloudinary
  // 3. Update cloudinary_usage table
  // 4. Log cleanup actions
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

## Data Models

### TypeScript Interfaces

```typescript
interface User {
  id: string;
  email: string;
  full_name?: string;
  business_name?: string;
  business_type?: 'real_estate' | 'event_planning';
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  bank_code?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Property {
  id: string;
  user_id: string;
  title: string;
  price: number;
  description?: string;
  location?: string;
  images: string[]; // Cloudinary URLs
  status: 'available' | 'sold';
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  images: string[]; // Cloudinary URLs
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_id: string;
  customer_name?: string;
  customer_phone: string;
  customer_email?: string;
  order_type: 'property' | 'service';
  item_id: string;
  amount: number;
  payment_method: 'paystack' | 'manual';
  payment_status: 'pending' | 'completed' | 'failed';
  paystack_reference?: string;
  transfer_status?: 'pending' | 'completed' | 'failed';
  transfer_reference?: string;
  created_at: string;
  updated_at: string;
}

interface WhatsAppSession {
  id: string;
  user_id: string;
  customer_phone: string;
  session_data: Record<string, any>;
  last_message_at: string;
  created_at: string;
}

interface CloudinaryUsage {
  id: string;
  user_id: string;
  total_storage_mb: number;
  total_assets: number;
  last_updated: string;
}
```

## Error Handling

### Error Types

```typescript
enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Payment
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  TRANSFER_FAILED = 'TRANSFER_FAILED',
  WEBHOOK_VERIFICATION_FAILED = 'WEBHOOK_VERIFICATION_FAILED',
  
  // External Services
  WHATSAPP_API_ERROR = 'WHATSAPP_API_ERROR',
  PAYSTACK_API_ERROR = 'PAYSTACK_API_ERROR',
  CLOUDINARY_API_ERROR = 'CLOUDINARY_API_ERROR',
  
  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  
  // General
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
}
```

### Error Handling Strategy

1. **Frontend:**
   - Display user-friendly error messages in toast notifications
   - Log errors to console in development
   - Send error reports to monitoring service in production

2. **Backend:**
   - Catch and log all errors
   - Return standardized error responses
   - Retry failed external API calls (with exponential backoff)
   - Send critical errors to monitoring service

3. **Payment Errors:**
   - Retry failed transfers up to 3 times
   - Log all payment failures for manual review
   - Notify admin via email for critical payment issues

## Testing Strategy

### Unit Tests

- Test SQL functions with sample data
- Test utility functions (currency formatting, date handling)
- Test validation logic
- Test API route handlers

### Integration Tests

- Test authentication flow (register, login, verify email, reset password)
- Test property/service CRUD operations
- Test payment flow (Paystack link generation, webhook handling, transfer)
- Test WhatsApp message processing

### End-to-End Tests

- Test complete user journey: register → setup business → add property → customer inquiry → payment → confirmation
- Test PWA installation and offline functionality
- Test responsive design on mobile devices

### Testing Tools

- Jest for unit tests
- Supertest for API testing
- Playwright for E2E tests
- Supabase local development for database testing

## Security Considerations

### Authentication & Authorization

- Use Supabase Auth for secure authentication
- Implement JWT token validation on all protected routes
- Use RLS policies to enforce data access control
- Store sensitive tokens (reset, verification) with expiration

### Payment Security

- Verify all Paystack webhooks with signature validation
- Never expose Paystack secret keys in frontend
- Use HTTPS for all payment-related communications
- Log all payment transactions for audit trail

### Data Protection

- Encrypt sensitive data at rest (passwords, tokens)
- Use parameterized queries to prevent SQL injection
- Implement rate limiting on API endpoints
- Sanitize user inputs to prevent XSS attacks

### Media Security

- Use signed Cloudinary URLs for private media
- Implement file type and size validation
- Scan uploaded files for malware (if applicable)

## Performance Optimization

### Frontend

- Implement code splitting for faster initial load
- Use Next.js Image component for optimized images
- Cache static assets with service workers
- Lazy load dashboard modules

### Backend

- Index frequently queried database columns
- Use connection pooling for database connections
- Cache frequently accessed data (Redis if needed)
- Optimize SQL queries with EXPLAIN ANALYZE

### Media Delivery

- Use Cloudinary transformations for responsive images
- Implement lazy loading for image galleries
- Compress images before upload
- Use CDN for faster media delivery

### WhatsApp Integration

- Implement message queuing for high volume
- Cache business data to reduce database queries
- Use webhook retry logic for failed deliveries
- Optimize AI response generation time

## Deployment Strategy

### Environment Setup

- **Development:** Local Next.js + Supabase local
- **Staging:** Vercel + Supabase staging project
- **Production:** Vercel + Supabase production project

### CI/CD Pipeline

1. Push to GitHub
2. Run tests (unit, integration)
3. Build Next.js application
4. Deploy to Vercel
5. Run database migrations on Supabase
6. Deploy Edge Functions
7. Run smoke tests

### Monitoring

- Use Vercel Analytics for frontend performance
- Use Supabase Dashboard for database monitoring
- Implement error tracking (Sentry or similar)
- Set up uptime monitoring for critical endpoints
- Monitor Paystack webhook delivery

## Future Enhancements (Post-MVP)

- Google Sheets integration for logs
- Google Drive backup for media
- Google Calendar for event bookings
- Google Maps for property locations
- Multi-admin team support
- Advanced analytics dashboard
- Customer segmentation and marketing
- Multi-language support
- Additional business types (e.g., restaurants, retail)
