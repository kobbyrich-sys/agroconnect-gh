import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  const { data: escrowWallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('type', 'escrow')
    .single();

  const { count: heldCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('escrow_status', 'held');

  const { count: releasedCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('escrow_status', 'released');

  const { count: refundedCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('escrow_status', 'refunded');

  const { count: disputesCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('escrow_status', 'disputed');

  const summary = {
    total_in_escrow: parseFloat(escrowWallet?.balance || '0'),
    pending_releases: heldCount || 0,
    total_released: releasedCount || 0,
    total_refunded: refundedCount || 0,
    active_disputes: disputesCount || 0,
  };

  return NextResponse.json({ success: true, summary });
}
