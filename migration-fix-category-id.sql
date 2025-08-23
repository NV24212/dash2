-- Migration script to fix category_id data type issues
-- This script handles the transition from TEXT-based IDs to UUID-based IDs
-- Run this BEFORE running supabase-complete-setup.sql if you have existing data

-- Step 1: Check if we need to migrate (if categories table exists with TEXT id)
DO $$
DECLARE
    categories_exists boolean;
    id_is_text boolean;
BEGIN
    -- Check if categories table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
    ) INTO categories_exists;
    
    IF categories_exists THEN
        -- Check if id column is TEXT
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'categories' 
            AND column_name = 'id' 
            AND data_type = 'text'
        ) INTO id_is_text;
        
        IF id_is_text THEN
            RAISE NOTICE 'Found existing categories table with TEXT id - migration needed';
            
            -- Step 2: Create backup tables
            CREATE TABLE IF NOT EXISTS categories_backup AS SELECT * FROM categories;
            CREATE TABLE IF NOT EXISTS products_backup AS SELECT * FROM products;
            CREATE TABLE IF NOT EXISTS customers_backup AS SELECT * FROM customers;
            CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;
            
            -- Step 3: Drop foreign key constraints temporarily
            ALTER TABLE IF EXISTS products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
            ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
            
            -- Step 4: Drop existing tables
            DROP TABLE IF EXISTS orders CASCADE;
            DROP TABLE IF EXISTS products CASCADE;
            DROP TABLE IF EXISTS customers CASCADE;
            DROP TABLE IF EXISTS categories CASCADE;
            
            RAISE NOTICE 'Backup created and old tables dropped. Now run supabase-complete-setup.sql';
        ELSE
            RAISE NOTICE 'Categories table already uses UUID - no migration needed';
        END IF;
    ELSE
        RAISE NOTICE 'No existing categories table found - safe to run supabase-complete-setup.sql';
    END IF;
END $$;