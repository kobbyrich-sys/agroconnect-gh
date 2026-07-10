-- ============================================================
-- AgroConnect GH - Migration: Remove Delivery, Add Wallet/Payout System
-- ============================================================

-- ----------------------------
-- 1. DROP DELIVERY TABLES
-- ----------------------------
DROP TABLE IF EXISTS delivery_tracking CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS delivery_partners CASCADE;

-- ----------------------------
-- 2. DROP DELIVERY ENUMS
-- ----------------------------
DROP TYPE IF EXISTS delivery_status CASCADE;

-- ----------------------------
-- 3. UPDATE order_status ENUM
--    Remove: packed, shipped, out_for_delivery, delivered, returned
--    Add: ready_for_pickup
-- ----------------------------
CREATE TYPE order_status_new AS ENUM ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'completed', 'cancelled', 'refunded');
ALTER TABLE orders ALTER COLUMN status TYPE order_status_new USING status::text::order_status_new;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';
DROP TYPE order_status CASCADE;
ALTER TYPE order_status_new RENAME TO order_status;

-- ----------------------------
-- 4. UPDATE user_role ENUM - remove delivery_partner
-- ----------------------------
CREATE TYPE user_role_new AS ENUM ('buyer', 'farmer', 'manufacturer', 'wholesaler', 'support', 'admin', 'super_admin');
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_new USING CASE WHEN role = 'delivery_partner' THEN 'buyer'::text ELSE role::text END::user_role_new;
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'buyer';
DROP TYPE user_role CASCADE;
ALTER TYPE user_role_new RENAME TO user_role;

-- ----------------------------
-- 5. UPDATE notification_type ENUM - remove delivery, add withdrawal
-- ----------------------------
CREATE TYPE notification_type_new AS ENUM ('order_update', 'payment', 'message', 'review', 'promotion', 'system', 'verification', 'withdrawal');
ALTER TABLE notifications ALTER COLUMN type TYPE notification_type_new USING CASE WHEN type = 'delivery' THEN 'payment'::text ELSE type::text END::notification_type_new;
DROP TYPE notification_type CASCADE;
ALTER TYPE notification_type_new RENAME TO notification_type;

-- ----------------------------
-- 6. REMOVE CASH_ON_DELIVERY FROM payment_method ENUM
-- ----------------------------
CREATE TYPE payment_method_new AS ENUM ('mobile_money', 'bank_transfer', 'paystack', 'wallet', 'card');
ALTER TABLE payments ALTER COLUMN method TYPE payment_method_new USING CASE WHEN method = 'cash_on_delivery' THEN 'mobile_money'::text ELSE method::text END::payment_method_new;
DROP TYPE payment_method CASCADE;
ALTER TYPE payment_method_new RENAME TO payment_method;

-- ----------------------------
-- 7. UPDATE transaction_type ENUM - add all new wallet types
-- ----------------------------
CREATE TYPE transaction_type_new AS ENUM ('sale', 'commission', 'refund', 'withdrawal', 'adjustment', 'bonus', 'penalty', 'manual_credit', 'manual_debit');
ALTER TABLE transactions ALTER COLUMN type TYPE transaction_type_new USING 
  CASE 
    WHEN type = 'payment' THEN 'sale'::text 
    WHEN type = 'deposit' THEN 'manual_credit'::text
    ELSE type::text 
  END::transaction_type_new;
DROP TYPE transaction_type CASCADE;
ALTER TYPE transaction_type_new RENAME TO transaction_type;

-- ----------------------------
-- 8. ALTER ORDERS TABLE - drop delivery-related columns
-- ----------------------------
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_fee CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address_id CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_id CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS delivered_at CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ----------------------------
-- 9. ALTER WALLETS TABLE - add new columns
-- ----------------------------
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0);
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_earned DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_earned >= 0);
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_withdrawn >= 0);

-- ----------------------------
-- 10. CREATE WITHDRAWAL ACCOUNTS TABLE
-- ----------------------------
CREATE TABLE IF NOT EXISTS withdrawal_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  network TEXT NOT NULL,
  bank_name TEXT,
  branch TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- 11. CREATE PLATFORM REVENUE TABLE
-- ----------------------------
CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  commission_amount DECIMAL(12, 2) NOT NULL,
  order_amount DECIMAL(12, 2) NOT NULL,
  commission_percentage DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- 12. CREATE PAYMENT RECEIPTS TABLE
-- ----------------------------
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  receipt_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- 13. ADD BALANCE_BEFORE / BALANCE_AFTER TO TRANSACTIONS
-- ----------------------------
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS balance_before DECIMAL(12, 2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS balance_after DECIMAL(12, 2);

-- ----------------------------
-- 14. UPDATE WITHDRAWAL_REQUESTS - drop business_id, add network
-- ----------------------------
ALTER TABLE withdrawal_requests DROP COLUMN IF EXISTS business_id CASCADE;
ALTER TABLE withdrawal_requests DROP COLUMN IF EXISTS method CASCADE;
ALTER TABLE withdrawal_requests DROP COLUMN IF EXISTS mobile_provider CASCADE;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS network TEXT NOT NULL DEFAULT 'MTN';
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS account_name TEXT NOT NULL DEFAULT '';
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS account_number TEXT NOT NULL DEFAULT '';
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_requests_status_check;
ALTER TABLE withdrawal_requests ALTER COLUMN status SET DATA TYPE TEXT;
UPDATE withdrawal_requests SET status = 'pending' WHERE status NOT IN ('pending', 'approved', 'rejected', 'completed', 'cancelled');

-- ----------------------------
-- 15. DROP OLD INDEXES
-- ----------------------------
DROP INDEX IF EXISTS idx_delivery_partners_available;
DROP INDEX IF EXISTS idx_deliveries_order;
DROP INDEX IF EXISTS idx_deliveries_partner;
DROP INDEX IF EXISTS idx_deliveries_status;
DROP INDEX IF EXISTS idx_delivery_tracking_delivery;
DROP INDEX IF EXISTS idx_delivery_tracking_created;

-- ----------------------------
-- 16. CREATE NEW INDEXES
-- ----------------------------
CREATE INDEX IF NOT EXISTS idx_withdrawal_accounts_seller ON withdrawal_accounts(seller_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_accounts_primary ON withdrawal_accounts(seller_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_platform_revenue_order ON platform_revenue(order_id);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_created ON platform_revenue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_order ON payment_receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_buyer ON payment_receipts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ----------------------------
-- 17. RLS POLICIES
-- ----------------------------
ALTER TABLE withdrawal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- Withdrawal accounts
CREATE POLICY "Sellers can manage own withdrawal accounts"
  ON withdrawal_accounts FOR ALL
  USING (auth.uid() = seller_id OR is_admin());

-- Platform revenue (admin only for select, insert on order completion)
CREATE POLICY "Admins can read platform revenue"
  ON platform_revenue FOR SELECT
  USING (is_admin());

-- Payment receipts
CREATE POLICY "Buyers can read own receipts"
  ON payment_receipts FOR SELECT
  USING (auth.uid() = buyer_id OR is_admin());

-- Update wallet policy to include new fields
DROP POLICY IF EXISTS "Users can read own wallet" ON wallets;
CREATE POLICY "Users can read own wallet"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- Update withdrawal requests policies
DROP POLICY IF EXISTS "Sellers can create withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Sellers can manage withdrawal requests"
  ON withdrawal_requests FOR ALL
  USING (auth.uid() = seller_id OR is_admin());

-- ----------------------------
-- 18. UPDATE SEED DATA - system settings
-- ----------------------------
INSERT INTO system_settings (key, value, description) VALUES
  ('commission_percentage', '10', 'Platform commission percentage on sales'),
  ('withdrawal_minimum', '50', 'Minimum withdrawal amount in GHS'),
  ('auto_approve_withdrawals', 'false', 'Automatically approve withdrawal requests')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ----------------------------
-- 19. UPDATE TRIGGERS - remove delivery triggers
-- ----------------------------
DROP TRIGGER IF EXISTS update_delivery_partners_updated_at ON delivery_partners;
DROP TRIGGER IF EXISTS update_deliveries_updated_at ON deliveries;
DROP TRIGGER IF EXISTS update_delivery_tracking_updated_at ON delivery_tracking;

-- ----------------------------
-- 20. DROP VIEWS that reference deliveries
-- ----------------------------
DROP VIEW IF EXISTS order_details CASCADE;
