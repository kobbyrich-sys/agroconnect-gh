import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: accounts, error } = await supabase
    .from('withdrawal_accounts')
    .select('*')
    .eq('seller_id', user.id)
    .order('is_primary', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, accounts });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { account_name, account_number, network, bank_name } = body;

  if (!account_name || !account_number || !network) {
    return NextResponse.json({ success: false, error: 'Account name, number, and network are required' }, { status: 400 });
  }

  const { count } = await supabase
    .from('withdrawal_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', user.id);

  const { data: account, error } = await supabase
    .from('withdrawal_accounts')
    .insert({
      seller_id: user.id,
      account_name,
      account_number,
      network,
      bank_name: bank_name || null,
      is_primary: count === 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, account }, { status: 201 });
}
