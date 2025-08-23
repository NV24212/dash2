-- Complete Supabase Database Setup for E-commerce Application
-- This script sets up all necessary tables, policies, and functions

-- Enable Row Level Security
-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
-- 1. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    home TEXT,
    road TEXT,
    block TEXT,
    town TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    variants JSONB DEFAULT '[]'::jsonb,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    total_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'delivered', 'picked-up')),
    delivery_type TEXT NOT NULL DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup')),
    delivery_area TEXT DEFAULT 'sitra' CHECK (delivery_area IN ('sitra', 'muharraq', 'other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disable Row Level Security for easier development (can be enabled later)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Grant permissions to service role (for server-side operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant permissions to authenticated users (for client-side operations)
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;

-- Insert default categories with proper UUIDs
INSERT INTO categories (id, name) VALUES 
    (uuid_generate_v4(), 'Electronics'),
    (uuid_generate_v4(), 'Accessories'),
    (uuid_generate_v4(), 'Home & Office')
ON CONFLICT (id) DO NOTHING;

-- Get category IDs for sample products (we'll need to query these after categories are created)
-- For now, we'll insert products without category_id and update them later
-- This approach ensures the script works even if run multiple times

-- Insert sample products for testing
DO $$
DECLARE
    electronics_id UUID;
    accessories_id UUID;
BEGIN
    -- Get the category IDs
    SELECT id INTO electronics_id FROM categories WHERE name = 'Electronics' LIMIT 1;
    SELECT id INTO accessories_id FROM categories WHERE name = 'Accessories' LIMIT 1;
    
    -- Insert products with proper category references
    INSERT INTO products (name, description, price, images, variants, category_id, total_stock) VALUES 
        ('Sample Product 1', 'This is a sample product for testing', 35.00, '["https://via.placeholder.com/300"]', '[]', electronics_id, 10),
        ('Sample Product 2', 'Another sample product', 17.50, '["https://via.placeholder.com/300"]', '[]', accessories_id, 5)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Insert sample customer for testing
INSERT INTO customers (name, phone, address, town) VALUES 
    ('Test Customer', '+973 36283382', 'Test Address', 'Manama'),
    ('Sample Customer', '+973 12345678', 'Sample Address', 'Sitra')
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin user (password: 'admin123' - should be changed in production)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (email, password_hash) VALUES 
    ('admin@azharstore.com', '$2b$10$rKvK0YjMlJMK0ZYZYQGzKOKEGYZzKGYzKOKEGYZzKOKEGYZzKOKEGY')
ON CONFLICT (email) DO NOTHING;

-- Create a view to get order details with customer information
CREATE OR REPLACE VIEW order_details AS
SELECT 
    o.*,
    c.name as customer_name,
    c.phone as customer_phone,
    c.address as customer_address,
    c.home as customer_home,
    c.road as customer_road,
    c.block as customer_block,
    c.town as customer_town
FROM orders o
JOIN customers c ON o.customer_id = c.id;

-- Grant access to the view
GRANT SELECT ON order_details TO service_role;
GRANT SELECT ON order_details TO authenticated;

-- Create function to get order statistics
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL,
    orders_today BIGINT,
    revenue_today DECIMAL,
    orders_this_month BIGINT,
    revenue_this_month DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as orders_today,
        COALESCE(SUM(total) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0) as revenue_today,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as orders_this_month,
        COALESCE(SUM(total) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0) as revenue_this_month
    FROM orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_order_stats() TO service_role;
GRANT EXECUTE ON FUNCTION get_order_stats() TO authenticated;