import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    const { client, applyCookies } = await createClient();

    const { error } = await client.auth.updateUser({ password });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    applyCookies(response);
    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'An error occurred' },
      { status: 500 },
    );
  }
}
