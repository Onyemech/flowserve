-- Create properties table for real estate businesses
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    location TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    square_feet INTEGER,
    property_type TEXT, -- apartment, house, land, commercial
    images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'available', -- available, sold, pending
    sold_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table for event planning businesses
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    duration_hours INTEGER,
    category TEXT, -- wedding, birthday, corporate, etc
    images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active', -- active, inactive
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    name TEXT,
    email TEXT,
    whatsapp_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, phone_number)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    order_type TEXT NOT NULL, -- property, service
    amount DECIMAL(15, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, refunded
    payment_method TEXT, -- paystack, bank_transfer, cash
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    paystack_reference TEXT UNIQUE,
    status TEXT DEFAULT 'pending', -- pending, success, failed
    transfer_status TEXT DEFAULT 'pending', -- pending, transferred, failed
    transfer_reference TEXT,
    paid_at TIMESTAMPTZ,
    transferred_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB[] DEFAULT '{}',
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cloudinary_assets table
CREATE TABLE IF NOT EXISTS cloudinary_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL,
    public_id TEXT NOT NULL,
    url TEXT NOT NULL,
    secure_url TEXT NOT NULL,
    format TEXT,
    resource_type TEXT,
    size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_deleted_at ON properties(deleted_at);

CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_status ON services(status);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_phone ON customers(phone_number);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_reference ON payments(paystack_reference);

CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

CREATE INDEX idx_cloudinary_user_id ON cloudinary_assets(user_id);
CREATE INDEX idx_cloudinary_deleted_at ON cloudinary_assets(deleted_at);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloudinary_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties
CREATE POLICY "Users can view their own properties"
    ON properties FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties"
    ON properties FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
    ON properties FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
    ON properties FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Users can view their own services"
    ON services FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services"
    ON services FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
    ON services FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
    ON services FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for customers
CREATE POLICY "Users can view their own customers"
    ON customers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers"
    ON customers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
    ON customers FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
    ON orders FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
    ON payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for cloudinary_assets
CREATE POLICY "Users can view their own assets"
    ON cloudinary_assets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
    ON cloudinary_assets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
    ON cloudinary_assets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
    ON cloudinary_assets FOR DELETE
    USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own assets"
    ON cloudinary_assets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
    ON cloudinary_assets FOR DELETE
    USING (auth.uid() = user_id);
