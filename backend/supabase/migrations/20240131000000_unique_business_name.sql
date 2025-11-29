-- Add unique constraint to business_name
ALTER TABLE flowserve_users 
ADD CONSTRAINT unique_business_name UNIQUE (business_name);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_flowserve_users_business_name 
ON flowserve_users(business_name);
