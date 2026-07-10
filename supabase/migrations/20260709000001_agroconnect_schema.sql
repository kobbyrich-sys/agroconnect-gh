-- ============================================================
-- AgroConnect GH - Complete Database Schema
-- PostgreSQL + Supabase
-- ============================================================

-- ----------------------------
-- EXTENSIONS
-- ----------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------
-- ENUMS
-- ----------------------------
CREATE TYPE user_role AS ENUM ('buyer', 'farmer', 'manufacturer', 'wholesaler', 'delivery_partner', 'support', 'admin', 'super_admin');
CREATE TYPE business_type AS ENUM ('farmer', 'manufacturer', 'wholesaler');
CREATE TYPE entity_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'completed', 'cancelled', 'returned', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('mobile_money', 'bank_transfer', 'paystack', 'cash_on_delivery', 'wallet', 'card');
CREATE TYPE payment_provider AS ENUM ('mtn', 'vodafone', 'airteltigo', 'paystack', 'hubtel');
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'withdrawal', 'commission', 'deposit');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE delivery_status AS ENUM ('pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('order_update', 'payment', 'message', 'review', 'promotion', 'system', 'verification', 'delivery');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_category AS ENUM ('order_issue', 'payment', 'account', 'seller_support', 'technical', 'other');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE change_type AS ENUM ('purchase', 'sale', 'return', 'adjustment', 'restock');

-- ----------------------------
-- TABLES
-- ----------------------------

-- 1. PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  status entity_status NOT NULL DEFAULT 'active',
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  fcm_token TEXT,
  preferred_language TEXT DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ADDRESSES
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Ghana',
  gps_address TEXT,
  landmark TEXT,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BUSINESSES
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type business_type NOT NULL,
  business_phone TEXT NOT NULL,
  business_email TEXT,
  business_logo TEXT,
  business_address TEXT NOT NULL,
  gps_address TEXT,
  ghana_card_number TEXT,
  registration_number TEXT,
  description TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  status entity_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SELLER VERIFICATION
CREATE TABLE seller_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  ghana_card_url TEXT NOT NULL,
  ghana_card_number TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  bank_account_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  mobile_money_provider payment_provider NOT NULL,
  mobile_money_number TEXT NOT NULL,
  additional_docs JSONB DEFAULT '[]',
  verification_status verification_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CATEGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SUBCATEGORIES
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 7. PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  brand TEXT,
  weight DECIMAL(10, 2),
  weight_unit TEXT DEFAULT 'kg',
  unit TEXT DEFAULT 'piece',
  retail_price DECIMAL(12, 2) NOT NULL CHECK (retail_price >= 0),
  wholesale_price DECIMAL(12, 2) CHECK (wholesale_price >= 0),
  wholesale_min_quantity INT CHECK (wholesale_min_quantity > 0),
  discount_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_end_date TIMESTAMPTZ,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT DEFAULT 5,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  status entity_status NOT NULL DEFAULT 'active',
  location TEXT,
  region TEXT,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  average_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(seller_id, slug)
);

-- 8. PRODUCT IMAGES
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PRODUCT VIDEOS
CREATE TABLE product_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. INVENTORY LOG
CREATE TABLE inventory_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_before INT NOT NULL,
  quantity_change INT NOT NULL,
  quantity_after INT NOT NULL,
  change_type change_type NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12, 2) NOT NULL,
  delivery_fee DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  commission DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  shipping_address_id UUID REFERENCES addresses(id),
  shipping_address JSONB,
  delivery_id UUID,
  coupon_id UUID,
  notes TEXT,
  buyer_notes TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  wholesale BOOLEAN DEFAULT FALSE,
  total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(12, 2) NOT NULL,
  method payment_method NOT NULL,
  provider payment_provider,
  reference TEXT NOT NULL UNIQUE,
  status transaction_status NOT NULL DEFAULT 'pending',
  gateway_response JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. WALLETS
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  locked_balance DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (locked_balance >= 0),
  currency TEXT DEFAULT 'GHS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. TRANSACTIONS
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  reference TEXT NOT NULL UNIQUE,
  description TEXT,
  order_id UUID REFERENCES orders(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. WITHDRAWAL REQUESTS
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  mobile_provider payment_provider,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, order_id, product_id)
);

-- 18. COUPONS
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value DECIMAL(12, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(12, 2) DEFAULT 0,
  max_discount DECIMAL(12, 2),
  usage_limit INT NOT NULL DEFAULT 100,
  used_count INT DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'categories', 'products', 'sellers')),
  applicable_ids JSONB DEFAULT '[]',
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. COUPON USAGE
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  discount_amount DECIMAL(12, 2) NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(coupon_id, user_id, order_id)
);

-- 20. ADVERTISEMENTS
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  placement TEXT NOT NULL CHECK (placement IN ('home_banner', 'home_featured', 'category_top', 'search_top', 'sidebar', 'popup')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  click_count INT DEFAULT 0,
  impression_count INT DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. CHATS
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1_id UUID NOT NULL REFERENCES profiles(id),
  participant_2_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count_1 INT DEFAULT 0,
  unread_count_2 INT DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. MESSAGES
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. DELIVERY PARTNERS
CREATE TABLE delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle_type TEXT NOT NULL,
  vehicle_number TEXT,
  license_number TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  current_location_lat DECIMAL(10, 7),
  current_location_lng DECIMAL(10, 7),
  rating DECIMAL(3, 2) DEFAULT 0,
  total_deliveries INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  status entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. DELIVERIES
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) UNIQUE,
  delivery_partner_id UUID REFERENCES delivery_partners(id),
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10, 7),
  pickup_lng DECIMAL(10, 7),
  delivery_address TEXT NOT NULL,
  delivery_lat DECIMAL(10, 7),
  delivery_lng DECIMAL(10, 7),
  distance_km DECIMAL(10, 2),
  delivery_fee DECIMAL(12, 2) NOT NULL,
  status delivery_status NOT NULL DEFAULT 'pending',
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. DELIVERY TRACKING
CREATE TABLE delivery_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  status delivery_status NOT NULL,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  location_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. SUPPORT TICKETS
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category ticket_category NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. TICKET MESSAGES
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 29. WISHLIST ITEMS
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 30. SEARCH HISTORY
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 31. AUDIT LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 32. ACTIVITY LOGS
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 33. SYSTEM SETTINGS
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- INDEXES
-- ----------------------------
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

CREATE INDEX idx_addresses_user ON addresses(user_id);

CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_type ON businesses(business_type);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_verified ON businesses(is_verified);

CREATE INDEX idx_seller_verifications_business ON seller_verifications(business_id);
CREATE INDEX idx_seller_verifications_status ON seller_verifications(verification_status);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_published ON products(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_products_rating ON products(average_rating DESC);
CREATE INDEX idx_products_sold ON products(sold_count DESC);
CREATE INDEX idx_products_price ON products(retail_price);
CREATE INDEX idx_products_region ON products(region);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);
CREATE INDEX idx_products_created ON products(created_at DESC);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX idx_inventory_log_product ON inventory_log(product_id);
CREATE INDEX idx_inventory_log_created ON inventory_log(created_at DESC);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_business ON orders(business_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_buyer ON payments(buyer_id);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_wallets_user ON wallets(user_id);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_reference ON transactions(reference);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

CREATE INDEX idx_withdrawal_requests_seller ON withdrawal_requests(seller_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user ON coupon_usage(user_id);

CREATE INDEX idx_advertisements_placement ON advertisements(placement);
CREATE INDEX idx_advertisements_active ON advertisements(is_active);
CREATE INDEX idx_advertisements_dates ON advertisements(starts_at, ends_at);

CREATE INDEX idx_chats_participant1 ON chats(participant_1_id);
CREATE INDEX idx_chats_participant2 ON chats(participant_2_id);
CREATE INDEX idx_chats_last_message ON chats(last_message_at DESC);

CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

CREATE INDEX idx_delivery_partners_available ON delivery_partners(is_available) WHERE is_available = TRUE;

CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_partner ON deliveries(delivery_partner_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

CREATE INDEX idx_delivery_tracking_delivery ON delivery_tracking(delivery_id);
CREATE INDEX idx_delivery_tracking_created ON delivery_tracking(created_at);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_product ON wishlist_items(product_id);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_created ON search_history(created_at DESC);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ----------------------------
-- TRIGGERS & FUNCTIONS
-- ----------------------------

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_seller_verifications_updated_at BEFORE UPDATE ON seller_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_delivery_partners_updated_at BEFORE UPDATE ON delivery_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create wallet on profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer'));

  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update product search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.brand, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_search_vector_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Update product rating on review
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id AND is_published = TRUE),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_published = TRUE)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity THEN
    INSERT INTO inventory_log (product_id, quantity_before, quantity_change, quantity_after, change_type, notes)
    VALUES (
      NEW.id,
      OLD.stock_quantity,
      NEW.stock_quantity - OLD.stock_quantity,
      NEW.stock_quantity,
      CASE WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'restock' ELSE 'sale' END,
      'Auto-logged from product update'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_inventory_change_trigger
  AFTER UPDATE OF stock_quantity ON products
  FOR EACH ROW EXECUTE FUNCTION log_inventory_change();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INT;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SPLIT_PART(order_number, '-', 3) AS INT)), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_number LIKE 'AGC-' || year_prefix || '-%';

  RETURN 'AGC-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------
-- VIEWS
-- ----------------------------

-- Seller Dashboard Stats
CREATE OR REPLACE VIEW seller_dashboard_stats AS
SELECT
  b.id AS business_id,
  b.owner_id,
  COUNT(DISTINCT p.id) AS total_products,
  COUNT(DISTINCT p.id) FILTER (WHERE p.is_published = TRUE) AS published_products,
  COUNT(DISTINCT o.id) AS total_orders,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('pending', 'confirmed', 'processing')) AS pending_orders,
  COALESCE(SUM(o.total) FILTER (WHERE o.status NOT IN ('cancelled', 'returned', 'refunded')), 0) AS total_revenue,
  COALESCE(AVG(r.rating), 0) AS average_rating,
  COUNT(DISTINCT r.id) AS total_reviews
FROM businesses b
LEFT JOIN products p ON p.business_id = b.id
LEFT JOIN orders o ON o.business_id = b.id
LEFT JOIN reviews r ON r.product_id = p.id
GROUP BY b.id, b.owner_id;

-- Product with Primary Image
CREATE OR REPLACE VIEW products_with_primary_image AS
SELECT
  p.*,
  pi.image_url AS primary_image,
  pi.alt_text AS primary_image_alt
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE;

-- Order Details
CREATE OR REPLACE VIEW order_details AS
SELECT
  o.*,
  buyer.email AS buyer_email,
  buyer.full_name AS buyer_name,
  seller.email AS seller_email,
  seller.full_name AS seller_name,
  b.business_name,
  COALESCE(oi.item_count, 0) AS item_count,
  COALESCE(oi.items_json, '[]'::jsonb) AS items
FROM orders o
LEFT JOIN profiles buyer ON buyer.id = o.buyer_id
LEFT JOIN profiles seller ON seller.id = o.seller_id
LEFT JOIN businesses b ON b.id = o.business_id
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS item_count,
    JSONB_AGG(ROW_TO_JSON(oi.*)::jsonb) AS items_json
  FROM order_items oi
  WHERE oi.order_id = o.id
) oi ON TRUE;

-- ----------------------------
-- ROW LEVEL SECURITY
-- ----------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is owner or admin
CREATE OR REPLACE FUNCTION is_owner_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = user_id OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Only admins can create profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin());

-- ADDRESSES
CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  USING (auth.uid() = user_id OR is_admin());

-- BUSINESSES
CREATE POLICY "Sellers can read own businesses"
  ON businesses FOR SELECT
  USING (auth.uid() = owner_id OR is_admin());

CREATE POLICY "Sellers can create businesses"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Sellers can update own businesses"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Public can view verified businesses"
  ON businesses FOR SELECT
  USING (is_verified = TRUE OR auth.uid() = owner_id OR is_admin());

-- SELLER VERIFICATION
CREATE POLICY "Sellers can read own verification"
  ON seller_verifications FOR SELECT
  USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id) OR is_admin());

CREATE POLICY "Sellers can submit verification"
  ON seller_verifications FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));

-- CATEGORIES & SUBCATEGORIES (public read, admin write)
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin());

CREATE POLICY "Public can read subcategories"
  ON subcategories FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage subcategories"
  ON subcategories FOR ALL
  USING (is_admin());

-- PRODUCTS
CREATE POLICY "Public can read published products"
  ON products FOR SELECT
  USING (is_published = TRUE OR auth.uid() = seller_id OR is_admin());

CREATE POLICY "Sellers can create products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  USING (is_admin());

-- PRODUCT IMAGES
CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT
  USING (TRUE);

CREATE POLICY "Sellers can manage own product images"
  ON product_images FOR ALL
  USING (auth.uid() IN (SELECT seller_id FROM products WHERE id = product_id) OR is_admin());

-- ORDERS
CREATE POLICY "Buyers can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id OR is_admin());

CREATE POLICY "Sellers can read orders for their business"
  ON orders FOR SELECT
  USING (auth.uid() = seller_id OR is_admin());

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order status"
  ON orders FOR UPDATE
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id OR is_admin())
  WITH CHECK (auth.uid() = seller_id OR auth.uid() = buyer_id OR is_admin());

-- ORDER ITEMS
CREATE POLICY "Users can read order items for their orders"
  ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin())));

-- PAYMENTS
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  USING (auth.uid() = buyer_id OR is_admin());

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR is_admin());

-- WALLETS
CREATE POLICY "Users can read own wallet"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- TRANSACTIONS
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM wallets WHERE id = wallet_id AND user_id = auth.uid()) OR is_admin());

-- REVIEWS
CREATE POLICY "Public can read published reviews"
  ON reviews FOR SELECT
  USING (is_published = TRUE OR auth.uid() = user_id OR is_admin());

CREATE POLICY "Buyers can create reviews for their orders"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CHATS
CREATE POLICY "Participants can read chats"
  ON chats FOR SELECT
  USING (auth.uid() IN (participant_1_id, participant_2_id) OR is_admin());

CREATE POLICY "Participants can create chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() IN (participant_1_id, participant_2_id));

-- MESSAGES
CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM chats WHERE id = chat_id AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())) OR is_admin());

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- NOTIFICATIONS
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- WISHLIST
CREATE POLICY "Users can manage own wishlist"
  ON wishlist_items FOR ALL
  USING (auth.uid() = user_id);

-- SUPPORT TICKETS
CREATE POLICY "Users can read own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to OR is_admin());

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELIVERY
CREATE POLICY "Delivery partners can read own deliveries"
  ON deliveries FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM delivery_partners WHERE id = delivery_partner_id) OR auth.uid() IN (SELECT buyer_id FROM orders WHERE id = order_id) OR auth.uid() IN (SELECT seller_id FROM orders WHERE id = order_id) OR is_admin());

CREATE POLICY "Delivery partners can update deliveries"
  ON deliveries FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM delivery_partners WHERE id = delivery_partner_id) OR is_admin());

-- AUDIT LOGS (admin only)
CREATE POLICY "Only admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

-- SYSTEM SETTINGS (admin only)
CREATE POLICY "Public can read system settings"
  ON system_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can update system settings"
  ON system_settings FOR ALL
  USING (is_admin());

-- ----------------------------
-- STORAGE BUCKETS
-- ----------------------------
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', TRUE),
  ('product-videos', 'product-videos', TRUE),
  ('avatars', 'avatars', TRUE),
  ('business-logos', 'business-logos', TRUE),
  ('verification-docs', 'verification-docs', FALSE),
  ('chat-images', 'chat-images', TRUE),
  ('review-images', 'review-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images', 'product-videos', 'avatars', 'business-logos', 'review-images'));

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('product-images', 'product-videos', 'avatars', 'business-logos', 'chat-images', 'review-images')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Owners can update their files"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = owner);

CREATE POLICY "Owners can delete their files"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner);

-- ----------------------------
-- SEED DATA
-- ----------------------------

-- Categories
INSERT INTO categories (name, slug, description, icon, order_index) VALUES
  ('Vegetables', 'vegetables', 'Fresh vegetables sourced directly from Ghanaian farms', '🥬', 1),
  ('Fruits', 'fruits', 'Fresh fruits from across all regions of Ghana', '🍎', 2),
  ('Grains & Cereals', 'grains-cereals', 'Rice, maize, millet, sorghum and more', '🌾', 3),
  ('Dairy & Eggs', 'dairy-eggs', 'Fresh milk, cheese, eggs from Ghanaian farms', '🥚', 4),
  ('Livestock & Poultry', 'livestock-poultry', 'Cattle, goats, sheep, chickens and other livestock', '🐄', 5),
  ('Fish & Seafood', 'fish-seafood', 'Fresh and smoked fish from Ghanaian waters', '🐟', 6),
  ('Farming Equipment', 'farming-equipment', 'Tools, machinery, and equipment for farming', '🔧', 7),
  ('Fertilizers & Chemicals', 'fertilizers-chemicals', 'Agricultural inputs, fertilizers, and crop protection', '🧪', 8),
  ('Packaging & Storage', 'packaging-storage', 'Packaging materials and storage solutions', '📦', 9),
  ('Manufacturing Supplies', 'manufacturing-supplies', 'Raw materials and supplies for manufacturing', '🏭', 10);

-- Subcategories for Vegetables
INSERT INTO subcategories (category_id, name, slug, order_index)
SELECT id, 'Leafy Greens', 'leafy-greens', 1 FROM categories WHERE slug = 'vegetables'
UNION ALL
SELECT id, 'Root Vegetables', 'root-vegetables', 2 FROM categories WHERE slug = 'vegetables'
UNION ALL
SELECT id, 'Peppers & Spices', 'peppers-spices', 3 FROM categories WHERE slug = 'vegetables'
UNION ALL
SELECT id, 'Legumes', 'legumes', 4 FROM categories WHERE slug = 'vegetables'
UNION ALL
SELECT id, 'Mushrooms', 'mushrooms', 5 FROM categories WHERE slug = 'vegetables';

-- Subcategories for Fruits
INSERT INTO subcategories (category_id, name, slug, order_index)
SELECT id, 'Tropical Fruits', 'tropical-fruits', 1 FROM categories WHERE slug = 'fruits'
UNION ALL
SELECT id, 'Citrus Fruits', 'citrus-fruits', 2 FROM categories WHERE slug = 'fruits'
UNION ALL
SELECT id, 'Berries', 'berries', 3 FROM categories WHERE slug = 'fruits'
UNION ALL
SELECT id, 'Melons', 'melons', 4 FROM categories WHERE slug = 'fruits';

-- Subcategories for Grains & Cereals
INSERT INTO subcategories (category_id, name, slug, order_index)
SELECT id, 'Rice', 'rice', 1 FROM categories WHERE slug = 'grains-cereals'
UNION ALL
SELECT id, 'Maize', 'maize', 2 FROM categories WHERE slug = 'grains-cereals'
UNION ALL
SELECT id, 'Millet & Sorghum', 'millet-sorghum', 3 FROM categories WHERE slug = 'grains-cereals'
UNION ALL
SELECT id, 'Beans & Pulses', 'beans-pulses', 4 FROM categories WHERE slug = 'grains-cereals';

-- System Settings
INSERT INTO system_settings (key, value, description) VALUES
  ('platform_name', '"AgroConnect GH"', 'Platform display name'),
  ('commission_percentage', '5', 'Platform commission on sales'),
  ('withdrawal_minimum', '50', 'Minimum withdrawal amount in GHS'),
  ('withdrawal_fee', '2', 'Withdrawal processing fee in GHS'),
  ('currency', '"GHS"', 'Default currency'),
  ('support_email', '"support@agroconnectgh.com"', 'Support email address'),
  ('support_phone', '"+233 XX XXX XXXX"', 'Support phone number'),
  ('maintenance_mode', 'false', 'Enable maintenance mode');
