-- ============================================================
-- AgroConnect GH - Escrow Payment System
-- Three-wallet architecture: Buyer | Seller | Escrow
-- ============================================================

-- ----------------------------
-- 1. ADD WALLET TYPE
-- ----------------------------
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'seller' CHECK (type IN ('buyer', 'seller', 'escrow'));
ALTER TABLE wallets ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE wallets ADD CONSTRAINT unique_user_wallet_type UNIQUE (user_id, type);

-- ----------------------------
-- 2. CREATE SYSTEM ESCROW WALLET
-- ----------------------------
INSERT INTO wallets (user_id, type, balance, pending_balance, total_earned, total_withdrawn, currency)
SELECT NULL, 'escrow', 0, 0, 0, 0, 'GHS'
WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE type = 'escrow');

-- ----------------------------
-- 3. ENSURE EVERY USER HAS BUYER + SELLER WALLETS
-- ----------------------------
-- Function to ensure wallet pairs on user creation
CREATE OR REPLACE FUNCTION ensure_user_wallets()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, type, balance, pending_balance, total_earned, total_withdrawn, currency)
  VALUES
    (NEW.id, 'buyer', 0, 0, 0, 0, 'GHS'),
    (NEW.id, 'seller', 0, 0, 0, 0, 'GHS')
  ON CONFLICT (user_id, type) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_create_wallets ON profiles;
CREATE TRIGGER on_profile_created_create_wallets
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION ensure_user_wallets();

-- Create missing wallets for existing users
INSERT INTO wallets (user_id, type, balance, pending_balance, total_earned, total_withdrawn, currency)
SELECT p.id, 'buyer', 0, 0, 0, 0, 'GHS'
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = p.id AND w.type = 'buyer')
ON CONFLICT (user_id, type) DO NOTHING;

INSERT INTO wallets (user_id, type, balance, pending_balance, total_earned, total_withdrawn, currency)
SELECT p.id, 'seller', 0, 0, 0, 0, 'GHS'
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = p.id AND w.type = 'seller')
ON CONFLICT (user_id, type) DO NOTHING;

-- Migrate existing wallet balances to seller wallets
UPDATE wallets w
SET balance = sub.balance, pending_balance = sub.pending_balance, total_earned = sub.total_earned, total_withdrawn = sub.total_withdrawn
FROM (
  SELECT id, balance, pending_balance, total_earned, total_withdrawn
  FROM wallets
  WHERE type = 'seller' OR type IS NULL
) sub
WHERE w.user_id = (SELECT user_id FROM wallets WHERE id = sub.id)
  AND w.type = 'seller';

-- ----------------------------
-- 4. ADD ESCROW COLUMNS TO ORDERS
-- ----------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (escrow_status IN ('pending', 'held', 'released', 'refunded', 'partially_released', 'disputed'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_held_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_released_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_release_type TEXT
  CHECK (escrow_release_type IN ('completed', 'cancelled', 'refunded', 'dispute_resolved', 'auto_release'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_expires_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_accepted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_confirmed_at TIMESTAMPTZ;

-- Migrate existing orders: paid orders are "held", completed are "released"
UPDATE orders SET escrow_status = 'held', escrow_held_amount = total
WHERE payment_status = 'paid' AND escrow_status = 'pending';
UPDATE orders SET escrow_status = 'released', escrow_release_type = 'completed'
WHERE status = 'completed' AND escrow_status = 'pending';
UPDATE orders SET escrow_status = 'refunded'
WHERE status = 'cancelled' AND escrow_status = 'pending';

-- ----------------------------
-- 5. ESCROW TRANSACTIONS TABLE
-- ----------------------------
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id),
  from_wallet_id UUID REFERENCES wallets(id),
  to_wallet_id UUID REFERENCES wallets(id),
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hold', 'release', 'refund', 'partial_release', 'partial_refund', 'commission', 'fee')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  actor_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- 6. DISPUTES TABLE
-- ----------------------------
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES profiles(id),
  raised_against UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'cancelled')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- 7. AUDIT LOGS TABLE
-- ----------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);

-- ----------------------------
-- 8. ESCROW TIMEOUT CONFIG
-- ----------------------------
CREATE TABLE IF NOT EXISTS escrow_timeout_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage TEXT NOT NULL UNIQUE CHECK (stage IN ('seller_acceptance', 'fulfillment', 'buyer_confirmation', 'auto_release')),
  timeout_hours INTEGER NOT NULL,
  default_action TEXT NOT NULL CHECK (default_action IN ('cancel', 'refund', 'release_to_seller', 'notify_admin')),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO escrow_timeout_config (stage, timeout_hours, default_action) VALUES
  ('seller_acceptance', 48, 'cancel'),
  ('fulfillment', 168, 'notify_admin'),
  ('buyer_confirmation', 72, 'release_to_seller'),
  ('auto_release', 336, 'release_to_seller')
ON CONFLICT (stage) DO NOTHING;

-- ----------------------------
-- 9. WALLET CONFIGURATION
-- ----------------------------
CREATE TABLE IF NOT EXISTS wallet_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO wallet_config (key, value, description) VALUES
  ('commission_percentage', '5', 'Platform commission percentage on sales'),
  ('withdrawal_minimum', '50', 'Minimum withdrawal amount in GHS'),
  ('withdrawal_fee', '0', 'Withdrawal processing fee'),
  ('escrow_enabled', 'true', 'Enable escrow payment system'),
  ('auto_release_enabled', 'true', 'Enable automatic escrow release')
ON CONFLICT (key) DO NOTHING;

-- ----------------------------
-- 10. ADD ACTOR_ID TO TRANSACTIONS
-- ----------------------------
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES profiles(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_type TEXT;

-- ----------------------------
-- 11. RLS POLICIES
-- ----------------------------
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Escrow transactions: involved parties and admins can read
CREATE POLICY "Parties can read escrow transactions"
  ON escrow_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (auth.uid() = o.buyer_id OR auth.uid() = o.seller_id OR is_admin())
    )
  );

CREATE POLICY "System can insert escrow transactions"
  ON escrow_transactions FOR INSERT
  WITH CHECK (true);

-- Disputes: involved parties and admins can read/manage
CREATE POLICY "Parties can read disputes"
  ON disputes FOR SELECT
  USING (
    auth.uid() = raised_by
    OR auth.uid() = raised_against
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (auth.uid() = o.buyer_id OR auth.uid() = o.seller_id OR is_admin())
    )
  );

CREATE POLICY "Buyers and sellers can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = raised_by);

-- Audit logs: admins only
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ----------------------------
-- 12. INDEXES
-- ----------------------------
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_order ON escrow_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_created ON escrow_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_wallet ON escrow_transactions(from_wallet_id) WHERE from_wallet_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_to_wallet ON escrow_transactions(to_wallet_id) WHERE to_wallet_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_disputes_order ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_orders_escrow_status ON orders(escrow_status) WHERE escrow_status IN ('held', 'disputed');
CREATE INDEX IF NOT EXISTS idx_orders_escrow_expires ON orders(escrow_expires_at) WHERE escrow_expires_at IS NOT NULL AND escrow_status = 'held';

-- ----------------------------
-- 13. FUNCTIONS
-- ----------------------------

-- Get or create buyer wallet for a user
CREATE OR REPLACE FUNCTION get_buyer_wallet(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_user_id AND type = 'buyer';
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, type, balance, pending_balance, total_earned, total_withdrawn, currency)
    VALUES (p_user_id, 'buyer', 0, 0, 0, 0, 'GHS')
    RETURNING id INTO v_wallet_id;
  END IF;
  RETURN v_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get or create seller wallet for a user
CREATE OR REPLACE FUNCTION get_seller_wallet(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_user_id AND type = 'seller';
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, type, balance, pending_balance, total_earned, total_withdrawn, currency)
    VALUES (p_user_id, 'seller', 0, 0, 0, 0, 'GHS')
    RETURNING id INTO v_wallet_id;
  END IF;
  RETURN v_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get escrow wallet ID
CREATE OR REPLACE FUNCTION get_escrow_wallet()
RETURNS UUID AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  SELECT id INTO v_wallet_id FROM wallets WHERE type = 'escrow' LIMIT 1;
  RETURN v_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hold funds in escrow
CREATE OR REPLACE FUNCTION hold_funds_in_escrow(
  p_order_id UUID,
  p_amount DECIMAL,
  p_actor_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_escrow_wallet_id UUID;
  v_buyer_wallet_id UUID;
  v_order RECORD;
  v_transaction_id UUID;
  v_escrow_tx_id UUID;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;

  v_escrow_wallet_id := get_escrow_wallet();
  v_buyer_wallet_id := get_buyer_wallet(v_order.buyer_id);

  -- Create wallet transaction
  INSERT INTO transactions (wallet_id, amount, balance_before, balance_after, type, reference, description, order_id, actor_id, wallet_type)
  VALUES (
    v_buyer_wallet_id,
    -p_amount,
    (SELECT COALESCE(balance, 0) FROM wallets WHERE id = v_buyer_wallet_id),
    (SELECT COALESCE(balance, 0) FROM wallets WHERE id = v_buyer_wallet_id) - p_amount,
    'escrow_hold',
    'ESC-' || p_order_id || '-' || extract(epoch from now())::bigint,
    'Funds held in escrow for order',
    p_order_id,
    p_actor_id,
    'buyer'
  )
  RETURNING id INTO v_transaction_id;

  -- Debit buyer wallet
  UPDATE wallets SET balance = balance - p_amount WHERE id = v_buyer_wallet_id;

  -- Credit escrow wallet
  UPDATE wallets SET balance = balance + p_amount WHERE id = v_escrow_wallet_id;

  -- Record escrow transaction
  INSERT INTO escrow_transactions (order_id, transaction_id, from_wallet_id, to_wallet_id, amount, type, actor_id, notes)
  VALUES (p_order_id, v_transaction_id, v_buyer_wallet_id, v_escrow_wallet_id, p_amount, 'hold', p_actor_id, 'Funds held in escrow')
  RETURNING id INTO v_escrow_tx_id;

  -- Update order
  UPDATE orders SET escrow_status = 'held', escrow_held_amount = p_amount, payment_status = 'paid', paid_at = NOW()
  WHERE id = p_order_id;

  -- Audit log
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (p_actor_id, 'escrow_hold', 'order', p_order_id, jsonb_build_object('amount', p_amount, 'escrow_tx_id', v_escrow_tx_id));

  RETURN v_escrow_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Release funds from escrow to seller
CREATE OR REPLACE FUNCTION release_escrow_to_seller(
  p_order_id UUID,
  p_actor_id UUID,
  p_release_type TEXT DEFAULT 'completed'
)
RETURNS UUID AS $$
DECLARE
  v_escrow_wallet_id UUID;
  v_seller_wallet_id UUID;
  v_order RECORD;
  v_release_amount DECIMAL;
  v_commission_amount DECIMAL;
  v_seller_amount DECIMAL;
  v_transaction_id UUID;
  v_commission_tx_id UUID;
  v_escrow_tx_id UUID;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.escrow_status != 'held' THEN RAISE EXCEPTION 'Escrow not held for this order'; END IF;

  v_escrow_wallet_id := get_escrow_wallet();
  v_seller_wallet_id := get_seller_wallet(v_order.seller_id);

  v_release_amount := v_order.escrow_held_amount;
  v_commission_amount := v_order.commission;
  v_seller_amount := v_release_amount - v_commission_amount;

  -- Transfer to seller (minus commission)
  INSERT INTO transactions (wallet_id, amount, balance_before, balance_after, type, reference, description, order_id, actor_id, wallet_type)
  VALUES (
    v_seller_wallet_id,
    v_seller_amount,
    (SELECT COALESCE(balance, 0) FROM wallets WHERE id = v_seller_wallet_id),
    (SELECT COALESCE(balance, 0) FROM wallets WHERE id = v_seller_wallet_id) + v_seller_amount,
    'sale',
    'REL-' || p_order_id || '-' || extract(epoch from now())::bigint,
    'Funds released from escrow for order',
    p_order_id,
    p_actor_id,
    'seller'
  )
  RETURNING id INTO v_transaction_id;

  -- Credit seller wallet
  UPDATE wallets SET
    balance = balance + v_seller_amount,
    total_earned = total_earned + v_seller_amount
  WHERE id = v_seller_wallet_id;

  -- Commission to platform revenue
  INSERT INTO platform_revenue (order_id, commission_amount, order_amount, commission_percentage)
  VALUES (p_order_id, v_commission_amount, v_release_amount, 5);

  INSERT INTO transactions (wallet_id, amount, balance_before, balance_after, type, reference, description, order_id, actor_id, wallet_type)
  VALUES (
    v_escrow_wallet_id,
    -v_release_amount,
    (SELECT COALESCE(balance, 0) FROM wallets WHERE id = v_escrow_wallet_id),
    (SELECT COALESCE(balance, 0) FROM wallets WHERE id = v_escrow_wallet_id) - v_release_amount,
    'commission',
    'COM-' || p_order_id || '-' || extract(epoch from now())::bigint,
    'Commission deducted for order',
    p_order_id,
    p_actor_id,
    'escrow'
  );

  -- Debit escrow wallet (full amount)
  UPDATE wallets SET balance = balance - v_release_amount WHERE id = v_escrow_wallet_id;

  -- Record escrow release transaction
  INSERT INTO escrow_transactions (order_id, transaction_id, from_wallet_id, to_wallet_id, amount, type, actor_id, notes)
  VALUES (p_order_id, v_transaction_id, v_escrow_wallet_id, v_seller_wallet_id, v_seller_amount, 'release', p_actor_id, 'Escrow released to seller')
  RETURNING id INTO v_escrow_tx_id;

  -- Record commission as separate escrow transaction
  INSERT INTO escrow_transactions (order_id, from_wallet_id, amount, type, actor_id, notes)
  VALUES (p_order_id, v_escrow_wallet_id, v_commission_amount, 'commission', p_actor_id, 'Platform commission from order');

  -- Update order
  UPDATE orders SET
    escrow_status = 'released',
    escrow_released_at = NOW(),
    escrow_release_type = p_release_type,
    status = 'completed',
    completed_at = NOW()
  WHERE id = p_order_id;

  -- Audit log
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (p_actor_id, 'escrow_release', 'order', p_order_id, jsonb_build_object(
    'amount', v_seller_amount, 'commission', v_commission_amount, 'release_type', p_release_type
  ));

  RETURN v_escrow_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refund escrow to buyer
CREATE OR REPLACE FUNCTION refund_escrow_to_buyer(
  p_order_id UUID,
  p_actor_id UUID,
  p_refund_type TEXT DEFAULT 'cancelled'
)
RETURNS UUID AS $$
DECLARE
  v_escrow_wallet_id UUID;
  v_buyer_wallet_id UUID;
  v_order RECORD;
  v_refund_amount DECIMAL;
  v_transaction_id UUID;
  v_escrow_tx_id UUID;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.escrow_status NOT IN ('held', 'disputed') THEN RAISE EXCEPTION 'Escrow not available for refund'; END IF;

  v_escrow_wallet_id := get_escrow_wallet();
  v_buyer_wallet_id := get_buyer_wallet(v_order.buyer_id);
  v_refund_amount := v_order.escrow_held_amount;

  -- Credit buyer wallet
  INSERT INTO transactions (wallet_id, amount, balance_before, balance_after, type, reference, description, order_id, actor_id, wallet_type)
  VALUES (
    v_buyer_wallet_id,
    v_refund_amount,
    (SELECT COALESCE(balance, 0) FROM wallets WHERE id = v_buyer_wallet_id),
    (SELECT COALESCE(balance, 0) FROM wallets WHERE id = v_buyer_wallet_id) + v_refund_amount,
    'refund',
    'REF-' || p_order_id || '-' || extract(epoch from now())::bigint,
    'Escrow refunded for order',
    p_order_id,
    p_actor_id,
    'buyer'
  )
  RETURNING id INTO v_transaction_id;

  UPDATE wallets SET balance = balance + v_refund_amount WHERE id = v_buyer_wallet_id;

  -- Debit escrow wallet
  UPDATE wallets SET balance = balance - v_refund_amount WHERE id = v_escrow_wallet_id;

  -- Record escrow refund transaction
  INSERT INTO escrow_transactions (order_id, transaction_id, from_wallet_id, to_wallet_id, amount, type, actor_id, notes)
  VALUES (p_order_id, v_transaction_id, v_escrow_wallet_id, v_buyer_wallet_id, v_refund_amount, 'refund', p_actor_id, 'Escrow refunded to buyer')
  RETURNING id INTO v_escrow_tx_id;

  -- Update order
  UPDATE orders SET
    escrow_status = 'refunded',
    escrow_released_at = NOW(),
    escrow_release_type = p_refund_type,
    payment_status = 'refunded',
    status = CASE WHEN p_refund_type = 'cancelled' THEN 'cancelled' ELSE 'refunded' END
  WHERE id = p_order_id;

  -- Audit log
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (p_actor_id, 'escrow_refund', 'order', p_order_id, jsonb_build_object('amount', v_refund_amount, 'refund_type', p_refund_type));

  RETURN v_escrow_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------
-- 14. TRIGGER: AUTO-CREATE WALLETS ON EXISTING USERS (SAFETY)
-- ----------------------------
-- Run for any user that might have been missed
INSERT INTO wallets (user_id, type, balance, pending_balance, total_earned, total_withdrawn, currency)
SELECT p.id, 'buyer', 0, 0, 0, 0, 'GHS'
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = p.id AND w.type = 'buyer')
ON CONFLICT (user_id, type) DO NOTHING;

INSERT INTO wallets (user_id, type, balance, pending_balance, total_earned, total_withdrawn, currency)
SELECT p.id, 'seller', 0, 0, 0, 0, 'GHS'
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = p.id AND w.type = 'seller')
ON CONFLICT (user_id, type) DO NOTHING;

-- Migrate existing wallets to seller type, create buyer wallets
DO $$
DECLARE
  w RECORD;
BEGIN
  FOR w IN SELECT * FROM wallets WHERE type = 'seller' OR (type IS NULL AND user_id IS NOT NULL) LOOP
    -- Ensure buyer wallet exists
    INSERT INTO wallets (user_id, type, balance, pending_balance, total_earned, total_withdrawn, currency)
    VALUES (w.user_id, 'buyer', 0, 0, 0, 0, 'GHS')
    ON CONFLICT (user_id, type) DO NOTHING;
  END LOOP;
END $$;

-- ----------------------------
-- 15. UPDATE WALLET RLS FOR MULTI-TYPE
-- ----------------------------
DROP POLICY IF EXISTS "Users can read own wallet" ON wallets;
CREATE POLICY "Users can read own wallets"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
CREATE POLICY "System can update wallets"
  ON wallets FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());
