import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@agroconnect/shared';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_id', wallet?.id || '')
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: summary } = await supabase
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
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!user.roles.includes('seller')) {
    return NextResponse.json({ success: false, error: 'Only sellers can make withdrawals' }, { status: 403 });
  }
  const supabase = createAdminClient();

  const body = await request.json();
  const { amount, account_name, account_number, network, bank_name } = body;

  if (!amount || amount < 50) {
    return NextResponse.json({ success: false, error: 'Minimum withdrawal is ₵50' }, { status: 400 });
  }

  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', user.id)
    .single();

  if (!wallet || parseFloat(wallet.balance) < amount) {
    return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
  }

  const { data: withdrawal, error } = await supabase
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
