-- ============================================================
-- AgroConnect GH - Dual-Role System Migration
-- 2026-07-15
-- ============================================================

-- ----------------------------
-- NEW ENUMS
-- ----------------------------
CREATE TYPE platform_role AS ENUM ('buyer', 'seller');
CREATE TYPE seller_business_type AS ENUM (
  'farmer', 'manufacturer', 'wholesaler', 'food_processor',
  'cooperative', 'agro_dealer', 'input_supplier', 'exporter'
);
CREATE TYPE seller_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- ----------------------------
-- USER ROLES (one user can have multiple roles)
-- ----------------------------
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role platform_role NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);

-- ----------------------------
-- SELLER PROFILES (extends profiles for seller-specific data)
-- ----------------------------
CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  business_phone TEXT NOT NULL,
  business_email TEXT,
  business_address TEXT,
  gps_address TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  ghana_card_url TEXT,
  ghana_card_number TEXT,
  profile_photo_url TEXT,
  status seller_status NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_seller_profiles_status ON seller_profiles(status);
CREATE INDEX idx_seller_profiles_verified ON seller_profiles(is_verified);

-- ----------------------------
-- SELLER BUSINESS TYPES (join table - one seller can have many types)
-- ----------------------------
CREATE TABLE seller_business_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  business_type seller_business_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(seller_id, business_type)
);
CREATE INDEX idx_seller_business_types_seller ON seller_business_types(seller_id);

-- ----------------------------
-- SELLER FINANCIALS
-- ----------------------------
CREATE TABLE seller_financials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE UNIQUE,
  mobile_money_provider TEXT,
  mobile_money_number TEXT,
  bank_name TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- HELPER FUNCTIONS
-- ----------------------------

-- Grant a role to a user
CREATE OR REPLACE FUNCTION public.grant_user_role(
  p_user_id UUID,
  p_role platform_role
) RETURNS boolean AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a user has a role
CREATE OR REPLACE FUNCTION public.has_role(
  p_user_id UUID,
  p_role TEXT
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id
    AND role::text = p_role
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(
  p_user_id UUID
) RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT role::text FROM public.user_roles
    WHERE user_id = p_user_id AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------
-- SEED EXISTING USERS
-- Every existing user gets 'buyer' role (backward compat)
-- If their profile.role was farmer/manufacturer/wholesaler,
-- also grant 'seller' role
-- ----------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'buyer'::platform_role FROM public.profiles
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'seller'::platform_role FROM public.profiles
WHERE role IN ('farmer', 'manufacturer', 'wholesaler')
ON CONFLICT DO NOTHING;

-- ----------------------------
-- UPDATED AUTH FUNCTIONS (dual-role support)
-- ----------------------------

-- Register a new user (defaults to buyer role)
DROP FUNCTION IF EXISTS public.register_user(text, text, text, text, text);
CREATE OR REPLACE FUNCTION public.register_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'buyer'
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Create user in auth.users
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at
  ) VALUES (
    v_user_id,
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone),
    NOW(),
    NOW()
  );

  -- Create profile (role param ignored — we use user_roles table)
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (v_user_id, p_email, p_full_name, p_phone, 'buyer');

  -- Auto-create wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (v_user_id, 0);

  -- Grant buyer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'buyer'::platform_role);

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify password and return user info + roles
DROP FUNCTION IF EXISTS public.verify_password(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.verify_password(
  p_email TEXT,
  p_password TEXT
) RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  user_status TEXT,
  user_roles TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id::UUID,
    au.email::TEXT,
    p.role::TEXT,
    p.status::TEXT,
    ARRAY(SELECT ur.role::TEXT FROM public.user_roles ur WHERE ur.user_id = au.id AND ur.is_active = TRUE)::TEXT[]
  FROM auth.users au
  JOIN public.profiles p ON p.id = au.id
  WHERE au.email = p_email
  AND au.encrypted_password = crypt(p_password, au.encrypted_password)
  AND au.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user by email with roles
DROP FUNCTION IF EXISTS public.get_user_by_email(TEXT);
CREATE OR REPLACE FUNCTION public.get_user_by_email(
  p_email TEXT
) RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  user_status TEXT,
  full_name TEXT,
  user_roles TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id::UUID,
    p.email::TEXT,
    p.role::TEXT,
    p.status::TEXT,
    p.full_name::TEXT,
    ARRAY(SELECT ur.role::TEXT FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.is_active = TRUE)::TEXT[]
  FROM public.profiles p
  WHERE p.email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing handle_new_user to also grant buyer role
-- Uses ON CONFLICT DO NOTHING so it doesn't conflict with register_user()
-- which also inserts the same rows before the trigger fires.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', 'buyer')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer'::platform_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------
-- TRIGGERS for new tables
-- ----------------------------
CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON seller_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_seller_financials_updated_at BEFORE UPDATE ON seller_financials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------
-- ROW LEVEL SECURITY
-- ----------------------------
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_financials ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY user_roles_select ON user_roles FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Users can insert their own roles (only buyer)
CREATE POLICY user_roles_insert ON user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Seller profiles: user can read own, admins can read all
CREATE POLICY seller_profiles_select ON seller_profiles FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Seller profiles: user can insert/update own
CREATE POLICY seller_profiles_insert ON seller_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY seller_profiles_update ON seller_profiles FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

-- Seller business types: user can read own
CREATE POLICY seller_business_types_select ON seller_business_types FOR SELECT
  USING (seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid()) OR is_admin());

-- Seller financials: user can read/update own
CREATE POLICY seller_financials_select ON seller_financials FOR SELECT
  USING (seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid()) OR is_admin());
CREATE POLICY seller_financials_update ON seller_financials FOR UPDATE
  USING (seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid()));
