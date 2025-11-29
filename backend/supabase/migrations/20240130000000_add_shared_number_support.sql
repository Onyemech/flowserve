-- Create whatsapp_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The admin
    customer_phone TEXT NOT NULL,
    session_data JSONB DEFAULT '{}',
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customer_admin_mapping table if it doesn't exist
CREATE TABLE IF NOT EXISTS customer_admin_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_phone TEXT NOT NULL,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_phone, admin_id)
);

-- Add last_interaction_at to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_customer_admin 
ON whatsapp_sessions(customer_phone, user_id);

CREATE INDEX IF NOT EXISTS idx_customer_mapping_phone 
ON customer_admin_mapping(customer_phone);

-- RLS Policies
-- IMPORTANT: These tables are used by the webhook (service role) and internal logic.
-- RLS should be DISABLED to ensure the webhook has full access.
ALTER TABLE whatsapp_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_admin_mapping DISABLE ROW LEVEL SECURITY;

-- We do not need policies if RLS is disabled.
-- The webhook uses the service role key which bypasses RLS anyway, 
-- but disabling it makes it explicit and avoids accidental blocks if logic changes.
