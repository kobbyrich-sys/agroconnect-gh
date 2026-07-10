import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name,
      phone: profile?.phone,
      avatar_url: profile?.avatar_url,
      role: profile?.role || 'buyer',
      status: profile?.status,
      is_email_verified: !!user.email_confirmed_at,
    },
  });
}
