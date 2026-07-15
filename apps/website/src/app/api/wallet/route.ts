import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('wallet_id', wallet?.id || '')
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: summary } = await supabaseAdmin
    .from('transactions')
    .select('type, amount')
    .eq('wallet_id', wallet?.id || '');

  const sellerSummary = {
    total_earned: (summary || [])
      .filter((t: any) => t.type === 'sale')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0),
    total_withdrawn: (summary || [])
      .filter((t: any) => t.type === 'withdrawal')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0),
  };

  return NextResponse.json({
    success: true,
    wallet: {
      balance: wallet?.balance || 0,
      pending_balance: wallet?.pending_balance || 0,
      total_earned: wallet?.total_earned || sellerSummary.total_earned,
      total_withdrawn: wallet?.total_withdrawn || sellerSummary.total_withdrawn,
      currency: 'GHS',
    },
    transactions: transactions || [],
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  const body = await request.json();
  const { amount, account_name, account_number, network, bank_name } = body;

  if (!amount || amount < 50) {
    return NextResponse.json({ success: false, error: 'Minimum withdrawal is ₵50' }, { status: 400 });
  }

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('id, balance')
    .eq('user_id', user.id)
    .single();

  if (!wallet || parseFloat(wallet.balance) < amount) {
    return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
  }

  const { data: withdrawal, error } = await supabaseAdmin
    .from('withdrawal_requests')
    .insert({
      seller_id: user.id,
      amount,
      account_name,
      account_number,
      network,
      bank_name: bank_name || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, withdrawal }, { status: 201 });
}
