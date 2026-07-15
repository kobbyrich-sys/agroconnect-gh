-- ============================================================
-- AgroConnect GH - Demo Seed Data
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create auth user (demo seller farmer)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'farmer@agroconnectgh.com',
  crypt('Demo@123456', gen_salt('bf')),
  NOW(),
  '{"full_name":"Kofi Mensah","role":"farmer"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create second auth user (buyer)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'buyer@agroconnectgh.com',
  crypt('Demo@123456', gen_salt('bf')),
  NOW(),
  '{"full_name":"Ama Serwaa","role":"buyer"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Update seller profile role (trigger creates it as 'buyer')
UPDATE profiles SET role = 'farmer', phone = '+233 20 123 4567', full_name = 'Kofi Mensah'
WHERE id = 'a0000000-0000-0000-0000-000000000001';

-- 3b. Grant seller platform role
INSERT INTO user_roles (user_id, role) VALUES ('a0000000-0000-0000-0000-000000000001', 'seller')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Update buyer profile
UPDATE profiles SET phone = '+233 24 987 6543', full_name = 'Ama Serwaa'
WHERE id = 'a0000000-0000-0000-0000-000000000002';

-- 5. Create seller's business
INSERT INTO businesses (
  id, owner_id, business_name, business_type, business_phone,
  business_email, business_address, gps_address, description,
  is_verified, status
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Mensah Fresh Farms',
  'farmer',
  '+233 20 123 4567',
  'kofi.mensah@example.com',
  'Farm Junction, Kumasi',
  'GA-123-4567',
  'Family-owned farm in the Ashanti Region growing fresh vegetables, fruits, and grains since 2010. We supply across all regions of Ghana.',
  TRUE,
  'active'
);

-- 6. Create products
-- Product 1: Fresh Tomatoes (Vegetables > Leafy Greens)
INSERT INTO products (
  id, seller_id, business_id, category_id, subcategory_id,
  name, slug, description, short_description, sku,
  retail_price, wholesale_price, wholesale_min_quantity, stock_quantity,
  unit, weight, weight_unit, is_featured, is_published, status,
  region, location, brand
) VALUES (
  'p0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'vegetables'),
  (SELECT id FROM subcategories WHERE slug = 'leafy-greens'),
  'Fresh Ghana Tomatoes',
  'fresh-ghana-tomatoes',
  'Sun-ripened, vine-fresh tomatoes harvested straight from our farm in Kumasi. Perfect for stews, salads, and cooking. Our tomatoes are grown organically without chemical fertilizers.',
  'Sun-ripened vine tomatoes from Kumasi. Perfect for stews and salads.',
  'SKU-TOMATO-001',
  8.00, 6.50, 10, 500,
  'kg', 1.00, 'kg', TRUE, TRUE, 'active',
  'Ashanti', 'Kumasi, Ghana', 'Mensah Fresh'
);

-- Product 2: Organic Maize (Grains & Cereals > Maize)
INSERT INTO products (
  id, seller_id, business_id, category_id, subcategory_id,
  name, slug, description, short_description, sku,
  retail_price, wholesale_price, wholesale_min_quantity, stock_quantity,
  unit, weight, weight_unit, is_featured, is_published, status,
  region, location, brand
) VALUES (
  'p0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'grains-cereals'),
  (SELECT id FROM subcategories WHERE slug = 'maize'),
  'Premium Organic Maize',
  'premium-organic-maize',
  'High-quality organic maize grown in the fertile lands of the Ashanti Region. Non-GMO, sun-dried, and sorted for consistent quality. Ideal for human consumption and animal feed.',
  'Premium organic maize, non-GMO, sun-dried and sorted.',
  'SKU-MAIZE-001',
  5.00, 3.80, 20, 1000,
  'kg', 50.00, 'kg', TRUE, TRUE, 'active',
  'Ashanti', 'Ejisu, Ghana', 'Mensah Fresh'
);

-- Product 3: Fresh Tilapia (Fish & Seafood)
INSERT INTO products (
  id, seller_id, business_id, category_id,
  name, slug, description, short_description, sku,
  retail_price, wholesale_price, wholesale_min_quantity, stock_quantity,
  unit, weight, weight_unit, is_featured, is_published, status,
  region, location
) VALUES (
  'p0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'fish-seafood'),
  'Fresh Tilapia (Whole)',
  'fresh-tilapia-whole',
  'Farm-raised fresh tilapia from the Volta Region. Clean, healthy, and delivered fresh daily. Each fish weighs between 500g-800g. Perfect for grilling, frying, or steaming.',
  'Farm-raised fresh tilapia from Volta Region. 500g-800g each.',
  'SKU-FISH-001',
  15.00, 12.00, 5, 200,
  'piece', 0.65, 'kg', FALSE, TRUE, 'active',
  'Volta', 'Akosombo, Ghana'
);

-- 7. Create product images (using placeholder images)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, order_index) VALUES
  ('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800', 'Fresh red tomatoes', TRUE, 1),
  ('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=800', 'Tomatoes on vine', FALSE, 2),
  ('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800', 'Dried maize grains', TRUE, 1),
  ('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800', 'Maize harvesting', FALSE, 2),
  ('p0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800', 'Fresh tilapia fish', TRUE, 1);

-- 8. Verify the data
SELECT 'Products seeded successfully!' AS result;
SELECT COUNT(*) || ' products' AS products_count FROM products;
SELECT COUNT(*) || ' businesses' AS businesses_count FROM businesses;
SELECT COUNT(*) || ' profiles' AS profiles_count FROM profiles;
