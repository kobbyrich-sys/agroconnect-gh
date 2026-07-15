import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  const { data: coupons, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, coupons });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  const body = await request.json();
  const { code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, expires_at } = body;

  if (!code || !discount_type || !discount_value || !expires_at) {
    return NextResponse.json({ success: false, error: 'Code, type, value, and expiry required' }, { status: 400 });
  }

  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .insert({
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      min_order_amount: min_order_amount || 0,
      max_discount: max_discount || null,
      usage_limit: usage_limit || 100,
      expires_at,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, coupon }, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  const body = await request.json();
  const { code, subtotal } = body;

  if (!code || subtotal === undefined) {
    return NextResponse.json({ success: false, error: 'Code and subtotal required' }, { status: 400 });
  }

  const { data: coupon } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (!coupon) return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 404 });
  if (new Date(coupon.expires_at) < new Date()) return NextResponse.json({ success: false, error: 'Coupon expired' }, { status: 400 });
  if (coupon.used_count >= coupon.usage_limit) return NextResponse.json({ success: false, error: 'Coupon usage limit reached' }, { status: 400 });
  if (subtotal < coupon.min_order_amount) {
    return NextResponse.json({ success: false, error: `Minimum order amount is ₵${coupon.min_order_amount}` }, { status: 400 });
  }

  let discount = coupon.discount_type === 'percentage'
    ? subtotal * (coupon.discount_value / 100)
    : coupon.discount_value;

  if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);

  return NextResponse.json({ success: true, coupon: { ...coupon, calculated_discount: Math.round(discount * 100) / 100 } });
}
