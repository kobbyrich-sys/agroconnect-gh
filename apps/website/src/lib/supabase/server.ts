import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

export async function createClient() {
  const cookieStore = await cookies();
  let pendingCookies: { name: string; value: string; options?: Record<string, unknown> }[] = [];

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies = cookiesToSet.map(c => ({ ...c }));
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const applyCookies = (response: NextResponse) => {
    for (const c of pendingCookies) {
      response.cookies.set(c.name, c.value, c.options);
    }
    pendingCookies = [];
  };

  return { client, applyCookies };
}
