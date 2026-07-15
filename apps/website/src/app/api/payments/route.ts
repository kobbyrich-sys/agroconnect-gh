import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

async function holdInEscrow(supabase: any, orderId: string, amount: number, userId: string) {
  const { data, error } = await supabase.rpc('hold_funds_in_escrow', {
    p_order_id: orderId,
    p_amount: amount,
    p_actor_id: userId,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createAdminClient();

  const body = await request.json();
  const { order_id, method, provider } = body;

  if (!order_id || !method) {
    return NextResponse.json({ success: false, error: 'Order ID and payment method are required' }, { status: 400 });
  }

  const { data: order } = await adminSupabase
    .from('orders')
    .select('id, order_number, total, currency, escrow_status')
    .eq('id', order_id)
    .eq('buyer_id', user.id)
    .single();

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  if (order.escrow_status !== 'pending') {
    return NextResponse.json({ success: false, error: 'Payment already processed for this order' }, { status: 400 });
  }

  const reference = `AGC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const orderId = order.id;
  const orderTotal = order.total;
  const buyerId = user.id;

  async function processPayment(status: string): Promise<boolean> {
    const { error: payErr } = await adminSupabase.from('payments').insert({
      order_id: orderId, buyer_id: buyerId, amount: orderTotal,
      method, provider: provider || method, reference, status,
    });
    if (payErr) throw new Error(payErr.message);

    if (status === 'completed') {
      await holdInEscrow(adminSupabase, orderId, parseFloat(orderTotal), buyerId);
      await adminSupabase.from('orders').update({
        status: 'confirmed', payment_status: 'paid', paid_at: new Date().toISOString(),
      }).eq('id', orderId);
    }
    return true;
  }

  if (method === 'mobile_money' && provider) {
    await processPayment('pending');
    return NextResponse.json({
      success: true,
      message: `Payment of ₵${order.total} initiated via ${provider}. Complete payment on your phone.`,
    });
  }

  if (method === 'paystack') {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ success: false, error: 'Paystack not configured' }, { status: 500 });
    }

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'placeholder@example.com' /* TODO: replace with real user email */,
        amount: Math.round(parseFloat(order.total) * 100),
        currency: order.currency || 'GHS',
        reference,
        metadata: { order_id: order.id, order_number: order.order_number },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({ success: false, error: paystackData.message || 'Paystack error' }, { status: 400 });
    }

    await adminSupabase.from('payments').insert({
      order_id: order.id, buyer_id: user.id, amount: order.total,
      method: 'paystack', provider: 'paystack', reference,
      status: 'pending', gateway_response: paystackData,
    });

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference,
    });
  }

  return NextResponse.json({ success: false, error: 'Unsupported payment method' }, { status: 400 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createAdminClient();

  const body = await request.json();
  const { order_id, reference, status } = body;

  if (!order_id || !reference || !status) {
    return NextResponse.json({ success: false, error: 'Order ID, reference, and status are required' }, { status: 400 });
  }

  const { data: payment } = await adminSupabase
    .from('payments')
    .select('id, status, amount')
    .eq('reference', reference)
    .eq('order_id', order_id)
    .single();

  if (!payment) {
    return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
  }

  if (payment.status !== 'pending') {
    return NextResponse.json({ success: false, error: 'Payment already processed' }, { status: 400 });
  }

  await adminSupabase.from('payments').update({ status }).eq('id', payment.id);

  if (status === 'completed') {
    await holdInEscrow(adminSupabase, order_id, parseFloat(payment.amount), user.id);
    await adminSupabase.from('orders').update({
      status: 'confirmed', payment_status: 'paid', paid_at: new Date().toISOString(),
    }).eq('id', order_id);
  }

  return NextResponse.json({ success: true });
}
