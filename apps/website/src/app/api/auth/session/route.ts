import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ success: true, user: null, profile: null });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, region, avatar_url, status, created_at, updated_at')
      .eq('id', session.user.id)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      profile,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'An error occurred' },
      { status: 500 },
    );
  }
}
