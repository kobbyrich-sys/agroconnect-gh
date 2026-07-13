import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';
import { jwtVerify } from 'jose';

export async function GET() {
  const supabase = await createServerClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (user && !error) {
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

  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').split('.')[0] || '';
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(`sb-${projectRef}-auth-token`);

  if (!authCookie?.value) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const parts = JSON.parse(authCookie.value);
    const token = Array.isArray(parts) ? parts[0] : parts;

    const jwtSecret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
    const { payload } = await jwtVerify(token, jwtSecret);

    const supabase = await createServerClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', payload.sub)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: payload.sub,
        email: payload.email,
        full_name: profile?.full_name,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        role: profile?.role || 'buyer',
        status: profile?.status,
        is_email_verified: true,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
}