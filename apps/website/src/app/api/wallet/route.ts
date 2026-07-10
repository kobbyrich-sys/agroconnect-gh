import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

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

  return NextResponse.json({
    success: true,
    wallet: wallet || { balance: 0, locked_balance: 0, currency: 'GHS' },
    transactions: transactions || [],
  });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { amount, method, account_name, account_number, bank_name, mobile_provider } = body;

  if (!amount || amount < 10) {
    return NextResponse.json({ success: false, error: 'Minimum withdrawal is ₵10' }, { status: 400 });
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return NextResponse.json({ success: false, error: 'Business required for withdrawals' }, { status: 403 });
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
      business_id: business.id,
      amount,
      method,
      account_name,
      account_number,
      bank_name,
      mobile_provider,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, withdrawal }, { status: 201 });
}
