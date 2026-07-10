import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { order_id, method, provider } = body;

  if (!order_id || !method) {
    return NextResponse.json({ success: false, error: 'Order ID and payment method are required' }, { status: 400 });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, total, currency')
    .eq('id', order_id)
    .eq('buyer_id', user.id)
    .single();

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  const reference = `AGC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  if (method === 'mobile_money' && provider) {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        buyer_id: user.id,
        amount: order.total,
        method,
        provider,
        reference,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      payment,
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
        email: user.email,
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

    await supabase.from('payments').insert({
      order_id: order.id,
      buyer_id: user.id,
      amount: order.total,
      method: 'paystack',
      provider: 'paystack',
      reference,
      status: 'pending',
      gateway_response: paystackData,
    });

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference,
    });
  }

  if (method === 'cash_on_delivery') {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        buyer_id: user.id,
        amount: order.total,
        method: 'cash_on_delivery',
        reference,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, payment, message: 'Pay on delivery' });
  }

  return NextResponse.json({ success: false, error: 'Unsupported payment method' }, { status: 400 });
}
