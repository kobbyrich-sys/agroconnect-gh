import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: escrowWallet } = await admin
    .from('wallets')
    .select('balance')
    .eq('type', 'escrow')
    .single();

  const { count: heldCount } = await admin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('escrow_status', 'held');

  const { count: releasedCount } = await admin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('escrow_status', 'released');

  const { count: refundedCount } = await admin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('escrow_status', 'refunded');

  const { count: disputesCount } = await admin
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
