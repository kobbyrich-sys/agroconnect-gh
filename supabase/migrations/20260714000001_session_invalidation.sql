-- Add session invalidation and password reset tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS token_valid_since TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_password_reset_at TIMESTAMPTZ DEFAULT NOW();
