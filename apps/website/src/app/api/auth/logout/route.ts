import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function POST() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();

  return NextResponse.json({ success: true, message: 'Signed out successfully' });
}
