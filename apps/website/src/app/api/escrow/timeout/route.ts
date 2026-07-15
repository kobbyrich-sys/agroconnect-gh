import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST() {
  
  const supabase = createAdminClient();

  const { data: configs } = await supabase
    .from('escrow_timeout_config')
    .select('*')
    .eq('enabled', true);

  if (!configs) return NextResponse.json({ success: true, processed: 0 });

  const results = [];

  for (const config of configs) {
    const cutoff = new Date(Date.now() - config.timeout_hours * 60 * 60 * 1000).toISOString();

    let query;

    switch (config.stage) {
      case 'seller_acceptance':
        query = supabase
          .from('orders')
          .select('id, escrow_status')
          .eq('escrow_status', 'held')
          .lt('paid_at', cutoff)
          .is('seller_accepted_at', null);
        break;
      case 'fulfillment':
        query = supabase
          .from('orders')
          .select('id, escrow_status')
          .eq('escrow_status', 'held')
          .not('seller_accepted_at', 'is', null)
          .lt('seller_accepted_at', cutoff)
          .is('buyer_confirmed_at', null);
        break;
      case 'buyer_confirmation':
        query = supabase
          .from('orders')
          .select('id, escrow_status')
          .eq('escrow_status', 'held')
          .not('buyer_confirmed_at', 'is', null)
          .lt('buyer_confirmed_at', cutoff);
        break;
      case 'auto_release':
        query = supabase
          .from('orders')
          .select('id, escrow_status, escrow_held_amount')
          .eq('escrow_status', 'held')
          .lt('escrow_expires_at', cutoff);
        break;
      default:
        continue;
    }

    const { data: timedOutOrders } = await query;

    if (!timedOutOrders) continue;

    for (const order of timedOutOrders) {
      try {
        switch (config.default_action) {
          case 'cancel':
          case 'refund':
            await supabase.rpc('refund_escrow_to_buyer', {
              p_order_id: order.id,
              p_actor_id: null,
              p_refund_type: 'cancelled',
            });
            break;
          case 'release_to_seller':
            await supabase.rpc('release_escrow_to_seller', {
              p_order_id: order.id,
              p_actor_id: null,
              p_release_type: 'auto_release',
            });
            break;
          case 'notify_admin':
            await supabase.from('notifications').insert({
              user_id: null,
              type: 'system',
              title: `Escrow timeout: ${config.stage}`,
              message: `Order ${order.id} has exceeded ${config.stage} timeout`,
              data: { order_id: order.id, stage: config.stage },
            });
            break;
        }
        results.push({ order_id: order.id, stage: config.stage, action: config.default_action });
      } catch (err) {
        results.push({ order_id: order.id, stage: config.stage, error: String(err) });
      }
    }
  }

  return NextResponse.json({ success: true, processed: results.length, results });
}
