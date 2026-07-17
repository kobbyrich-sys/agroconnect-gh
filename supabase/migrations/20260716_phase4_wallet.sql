-- Wallets
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  pending_balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  currency TEXT NOT NULL DEFAULT 'GHS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ledger entries (audit trail)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment', 'escrow_hold', 'escrow_release', 'refund', 'platform_fee', 'withdrawal', 'reversal', 'adjustment', 'promotional_credit')),
  amount NUMERIC(14,2) NOT NULL,
  balance_before NUMERIC(14,2) NOT NULL,
  balance_after NUMERIC(14,2) NOT NULL,
  reference TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Withdrawal requests
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL CHECK (method IN ('mobile_money', 'bank_transfer')),
  provider TEXT,
  account_details JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_wallet_id ON public.ledger_entries(wallet_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_created_at ON public.ledger_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_wallet_id ON public.withdrawal_requests(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- Triggers
DROP TRIGGER IF EXISTS set_wallets_updated_at ON public.wallets;
CREATE TRIGGER set_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_withdrawal_requests_updated_at ON public.withdrawal_requests;
CREATE TRIGGER set_withdrawal_requests_updated_at BEFORE UPDATE ON public.withdrawal_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Wallets: users see own, admins see all
CREATE POLICY "wallets_select_own" ON public.wallets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "wallets_select_admin" ON public.wallets
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "wallets_insert_on_signup" ON public.wallets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "wallets_update_system" ON public.wallets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ledger entries: users see own wallet's entries, admins see all
CREATE POLICY "ledger_entries_select_own" ON public.ledger_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.wallets WHERE id = wallet_id AND user_id = auth.uid())
  );

CREATE POLICY "ledger_entries_select_admin" ON public.ledger_entries
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "ledger_entries_insert_system" ON public.ledger_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Withdrawal requests: users manage own, admins manage all
CREATE POLICY "withdrawal_requests_select_own" ON public.withdrawal_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.wallets WHERE id = wallet_id AND user_id = auth.uid())
  );

CREATE POLICY "withdrawal_requests_select_admin" ON public.withdrawal_requests
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "withdrawal_requests_insert_own" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.wallets WHERE id = wallet_id AND user_id = auth.uid())
  );

CREATE POLICY "withdrawal_requests_update_admin" ON public.withdrawal_requests
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Auto-create wallet on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance, pending_balance, currency)
  VALUES (NEW.id, 0, 0, 'GHS')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_create_wallet ON public.profiles;
CREATE TRIGGER on_profile_created_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_wallet();
