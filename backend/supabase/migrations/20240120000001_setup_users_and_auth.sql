-- Create flowserve_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS flowserve_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  business_name TEXT,
  business_type TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  bank_code TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMPTZ,
  password_reset_token TEXT,
  password_reset_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_flowserve_users_email ON flowserve_users(email);
CREATE INDEX IF NOT EXISTS idx_verification_token ON flowserve_users(verification_token);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON flowserve_users(password_reset_token);

-- Enable Row Level Security
ALTER TABLE flowserve_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON flowserve_users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON flowserve_users
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.flowserve_users (id, email, full_name, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    FALSE  -- Always start as unverified, we'll verify with our custom system
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create flowserve_users entry when auth.users entry is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to sync email updates from auth.users to flowserve_users
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.flowserve_users
  SET email = NEW.email,
      updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Sync email changes from auth.users to flowserve_users
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION sync_user_email();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on flowserve_users changes
DROP TRIGGER IF EXISTS update_flowserve_users_updated_at ON flowserve_users;
CREATE TRIGGER update_flowserve_users_updated_at
  BEFORE UPDATE ON flowserve_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate random token
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.flowserve_users TO authenticated;
