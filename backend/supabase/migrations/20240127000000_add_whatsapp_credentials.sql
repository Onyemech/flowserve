-- Add WhatsApp credentials to flowserve_users table
ALTER TABLE flowserve_users 
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_display_phone_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_connected_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_flowserve_users_whatsapp_phone 
ON flowserve_users(whatsapp_phone_number_id) 
WHERE whatsapp_connected = TRUE;

-- Add comment
COMMENT ON COLUMN flowserve_users.whatsapp_phone_number_id IS 'WhatsApp Business Phone Number ID from Meta';
COMMENT ON COLUMN flowserve_users.whatsapp_access_token IS 'WhatsApp Business API Access Token (from OAuth)';
COMMENT ON COLUMN flowserve_users.whatsapp_business_account_id IS 'WhatsApp Business Account ID';
COMMENT ON COLUMN flowserve_users.whatsapp_display_phone_number IS 'Display phone number (e.g., +1 234 567 8900)';
COMMENT ON COLUMN flowserve_users.whatsapp_connected IS 'Whether WhatsApp is connected and active';
