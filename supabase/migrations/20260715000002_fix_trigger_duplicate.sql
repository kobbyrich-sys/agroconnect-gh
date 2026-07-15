-- ============================================================
-- AgroConnect GH - Fix duplicate-key errors during registration
-- 2026-07-15
--
-- The register_user() function inserts into auth.users, which
-- fires the on_auth_user_created trigger. Both register_user()
-- and the trigger tried to insert the same profile/wallet/roles
-- rows, causing duplicate-key errors that silently broke registration.
--
-- Fix: Make all inserts in both functions idempotent via
-- ON CONFLICT DO NOTHING.
-- ============================================================

-- Fix register_user() — its wallet insert runs after the trigger's
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

  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (v_user_id, p_email, p_full_name, p_phone, 'buyer')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wallets (user_id, balance, type)
  VALUES (v_user_id, 0, 'seller')
  ON CONFLICT (user_id, type) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'buyer'::platform_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix handle_new_user — same idempotent inserts as above
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', 'buyer')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wallets (user_id, balance, type)
  VALUES (NEW.id, 0, 'seller')
  ON CONFLICT (user_id, type) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer'::platform_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

