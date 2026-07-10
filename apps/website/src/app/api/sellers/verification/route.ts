import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Register your business first' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { ghana_card_url, selfie_url, bank_name, bank_account_name, bank_account_number, mobile_money_provider, mobile_money_number } = body;

    if (!ghana_card_url || !selfie_url || !bank_name || !bank_account_name || !bank_account_number || !mobile_money_provider || !mobile_money_number) {
      return NextResponse.json(
        { success: false, error: 'All verification fields are required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('seller_verifications')
      .insert({
        business_id: business.id,
        ghana_card_url,
        ghana_card_number: body.ghana_card_number,
        selfie_url,
        bank_name,
        bank_account_name,
        bank_account_number,
        mobile_money_provider,
        mobile_money_number,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: 'Verification submitted for review', verification: data },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return NextResponse.json({ success: false, error: 'No business found' }, { status: 404 });
  }

  const { data: verification, error } = await supabase
    .from('seller_verifications')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, verification });
}
