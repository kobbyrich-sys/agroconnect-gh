import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const { client, applyCookies } = await createClient();
    await client.auth.signOut();

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
