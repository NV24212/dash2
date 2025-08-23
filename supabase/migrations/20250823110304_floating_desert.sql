/*
  # Add delivery area support to orders table

  1. Changes
    - Add `delivery_area` column to orders table
    - Add check constraint for valid delivery areas
    - Update existing orders with default delivery area

  2. Valid delivery areas
    - 'sitra' - Sitra area
    - 'muharraq' - Muharraq, Askar, Jao areas  
    - 'other' - Other cities
*/

-- Add delivery_area column to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_area'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_area TEXT DEFAULT 'sitra';
  END IF;
END $$;

-- Add check constraint for delivery_area
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_delivery_area_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_delivery_area_check 
    CHECK (delivery_area IN ('sitra', 'muharraq', 'other'));
  END IF;
END $$;

-- Update existing orders to have default delivery area
UPDATE orders SET delivery_area = 'sitra' WHERE delivery_area IS NULL;

-- Create index for delivery area queries
CREATE INDEX IF NOT EXISTS idx_orders_delivery_area ON orders(delivery_area);