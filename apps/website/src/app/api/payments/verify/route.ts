import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@agroconnect/shared';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ success: false, error: 'Reference required' }, { status: 400 });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (paystackSecret) {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    });
    const verifyData = await verifyRes.json();

    if (verifyData.status && verifyData.data.status === 'success') {
      const { data: payment } = await supabase
        .from('payments')
        .update({ status: 'completed', gateway_response: verifyData })
        .eq('reference', reference)
        .select()
        .single();

      if (payment) {
        await supabase
          .from('orders')
          .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', payment.order_id);
      }

      return NextResponse.json({ success: true, payment, message: 'Payment verified' });
    }
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('*, orders(order_number, status, total)')
    .eq('reference', reference)
    .single();

  return NextResponse.json({ success: true, payment });
}
