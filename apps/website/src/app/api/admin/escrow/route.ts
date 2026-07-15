import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@agroconnect/shared';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }

  const { data: escrowWallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('type', 'escrow')
    .single();

  const { data: heldOrders } = await supabase
    .from('orders')
    .select('id, order_number, total, escrow_held_amount, escrow_expires_at, paid_at, created_at, profiles!buyer_id(full_name), businesses(business_name)')
    .eq('escrow_status', 'held')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: timeoutConfig } = await supabase
    .from('escrow_timeout_config')
    .select('*')
    .order('stage');

  const { data: walletConfig } = await supabase
    .from('wallet_config')
    .select('*')
    .order('key');

  const { data: recentTx } = await supabase
    .from('escrow_transactions')
    .select('*, orders(order_number)')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    success: true,
    escrow_wallet: escrowWallet,
    held_orders: heldOrders || [],
    timeout_config: timeoutConfig || [],
    wallet_config: walletConfig || [],
    recent_transactions: recentTx || [],
  });
}

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const { config_type, key, value } = body;

  if (config_type === 'timeout') {
    const { error } = await supabase
      .from('escrow_timeout_config')
      .update({ timeout_hours: parseInt(value), updated_by: user.id, updated_at: new Date().toISOString() })
      .eq('stage', key);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  if (config_type === 'wallet') {
    const { error } = await supabase
      .from('wallet_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
