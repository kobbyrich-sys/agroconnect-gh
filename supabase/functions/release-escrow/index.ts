import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { order_id } = await req.json()
  if (!order_id) return new Response(JSON.stringify({ error: 'order_id required' }), { status: 400 })

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single()
  if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })

  if (order.payment_status !== 'paid' && order.payment_status !== 'escrow_held') {
    return new Response(JSON.stringify({ error: 'Payment not held in escrow', status: order.payment_status }))
  }
  if (order.status !== 'delivered') {
    return new Response(JSON.stringify({ error: 'Order not yet delivered', status: order.status }))
  }

  const netAmount = Number(order.total) - (Number(order.platform_fee) || 0)

  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', order.seller_id).single()
  if (!wallet) return new Response(JSON.stringify({ error: 'Seller wallet not found' }))

  const balanceBefore = Number(wallet.balance) || 0

  await supabase.from('wallets').update({
    pending_balance: Math.max((Number(wallet.pending_balance) || 0) - netAmount, 0),
    balance: balanceBefore + netAmount,
    updated_at: new Date().toISOString(),
  }).eq('id', wallet.id)

  await supabase.from('orders').update({
    payment_status: 'escrow_released',
    escrow_released_at: new Date().toISOString(),
  }).eq('id', order_id)

  await supabase.from('ledger_entries').insert({
    wallet_id: wallet.id,
    type: 'escrow_release',
    amount: netAmount,
    balance_before: balanceBefore,
    balance_after: balanceBefore + netAmount,
    reference: order_id,
    description: `Auto-escrow released for order ${order_id}`,
  })

  if (Number(order.platform_fee) > 0) {
    await supabase.from('ledger_entries').insert({
      wallet_id: wallet.id,
      type: 'platform_fee',
      amount: order.platform_fee,
      balance_before: balanceBefore + netAmount,
      balance_after: balanceBefore + netAmount,
      reference: order_id,
      description: `Platform fee for order ${order_id} (${order.platform_fee_rate}%)`,
    })
  }

  console.log(`Order ${order_id}: escrow released, GHS ${netAmount} to seller`)

  return new Response(JSON.stringify({ success: true, released_amount: netAmount }), { headers: { 'Content-Type': 'application/json' } })
})
