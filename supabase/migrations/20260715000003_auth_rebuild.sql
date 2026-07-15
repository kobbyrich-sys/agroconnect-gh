-- ============================================================
-- AgroConnect GH - Auth Rebuild: RLS + Region + Profile Trigger
-- ============================================================

-- Add region column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS: users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- RLS: users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS: admin can read all profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- RLS: admin can update all profiles
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
CREATE POLICY "Admin can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Enable RLS on businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- RLS: business owner can read own business
DROP POLICY IF EXISTS "Users can view own business" ON businesses;
CREATE POLICY "Users can view own business" ON businesses
  FOR SELECT USING (auth.uid() = owner_id);

-- RLS: business owner can update own business
DROP POLICY IF EXISTS "Users can update own business" ON businesses;
CREATE POLICY "Users can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);

-- RLS: everyone can see verified/active businesses
DROP POLICY IF EXISTS "Anyone can view active businesses" ON businesses;
CREATE POLICY "Anyone can view active businesses" ON businesses
  FOR SELECT USING (status = 'active');

-- Enable RLS on addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- RLS: users can manage own addresses
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can read active products
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (status = 'active' AND is_published = true);

-- RLS: seller can manage own products
DROP POLICY IF EXISTS "Sellers can manage own products" ON products;
CREATE POLICY "Sellers can manage own products" ON products
  FOR ALL USING (auth.uid() = seller_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'buyer',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
