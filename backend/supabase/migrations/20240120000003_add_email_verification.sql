-- This migration is now handled in 20240120000001_setup_users_and_auth.sql
-- Keeping this file for migration history consistency

-- Verify columns exist (idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'flowserve_users' 
                 AND column_name = 'email_verified') THEN
    ALTER TABLE flowserve_users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'flowserve_users' 
                 AND column_name = 'verification_token') THEN
    ALTER TABLE flowserve_users ADD COLUMN verification_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'flowserve_users' 
                 AND column_name = 'verification_token_expires_at') THEN
    ALTER TABLE flowserve_users ADD COLUMN verification_token_expires_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'flowserve_users' 
                 AND column_name = 'password_reset_token') THEN
    ALTER TABLE flowserve_users ADD COLUMN password_reset_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'flowserve_users' 
                 AND column_name = 'password_reset_token_expires_at') THEN
    ALTER TABLE flowserve_users ADD COLUMN password_reset_token_expires_at TIMESTAMPTZ;
  END IF;
END $$;
