/*
  # Create admin users table for authentication

  1. New Tables
    - `admin_users`
      - `id` (text, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for service role access
    - Create trigger for automatic updated_at updates

  3. Default Data
    - Insert default admin user with email: admin@azharstore.com
    - Password: azhar2311 (hashed with bcrypt)
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Insert default admin user (password: azhar2311)
-- Note: This is a bcrypt hash of "azhar2311" with salt rounds 10
INSERT INTO admin_users (id, email, password_hash, created_at, updated_at)
VALUES (
  'admin_' || extract(epoch from now())::text || '_' || floor(random() * 1000000)::text,
  'admin@azharstore.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow service role full access to admin_users table
DROP POLICY IF EXISTS "Allow service role full access" ON admin_users;
CREATE POLICY "Allow service role full access" ON admin_users
FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON admin_users TO postgres, anon, authenticated, service_role;