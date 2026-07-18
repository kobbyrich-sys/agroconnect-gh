import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const payload = await req.json()
  const event = payload.event

  if (event === 'charge.success') {
    const reference = payload.data.reference
    const amount = payload.data.amount / 100 // pesewas → GHS
    const channel = payload.data.channel || 'paystack'
    const metadata = payload.data.metadata || {}
    const orderId = metadata.order_id
    const email = payload.data.customer?.email

    if (!orderId) return new Response(JSON.stringify({ status: 'ok', note: 'No order_id in metadata' }), { headers: { 'Content-Type': 'application/json' } })

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
    if (order.payment_status !== 'pending' && order.payment_status !== 'awaiting_payment') {
      return new Response(JSON.stringify({ status: 'ok', note: 'Already confirmed' }))
    }

    const feeRate = 5.00
    const feeAmount = Math.round(Number(order.total) * feeRate / 100 * 100) / 100
    const netAmount = Number(order.total) - feeAmount

    const { data: wallet } = await supabase.from('wallets').upsert(
      { user_id: order.seller_id, balance: 0, pending_balance: 0, currency: order.currency || 'GHS' },
      { onConflict: 'user_id', ignoreDuplicates: false }
    ).select().single()

    await supabase.from('orders').update({
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'paystack',
      payment_reference: reference,
      paid_at: new Date().toISOString(),
      escrow_held_at: new Date().toISOString(),
      platform_fee: feeAmount,
      platform_fee_rate: feeRate,
    }).eq('id', orderId)

    await supabase.from('wallets').update({
      pending_balance: (Number(wallet.pending_balance) || 0) + netAmount,
      updated_at: new Date().toISOString(),
    }).eq('id', wallet.id)

    const { data: updatedWallet } = await supabase.from('wallets').select('*').eq('id', wallet.id).single()

    await supabase.from('ledger_entries').insert({
      wallet_id: wallet.id,
      type: 'escrow_hold',
      amount: netAmount,
      balance_before: (Number(updatedWallet.pending_balance) || 0) - netAmount,
      balance_after: Number(updatedWallet.pending_balance) || 0,
      reference: reference,
      description: `Auto-payment via Paystack for order ${orderId} (fee: GHS ${feeAmount})`,
    })

    console.log(`Order ${orderId}: auto-confirmed Paystack ref ${reference}, escrow GHS ${netAmount}`)
  }

  return new Response(JSON.stringify({ status: 'ok' }), { headers: { 'Content-Type': 'application/json' } })
})
