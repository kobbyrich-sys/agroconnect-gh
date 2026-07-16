import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

const cookieMap = new WeakMap<object, { name: string; value: string; options?: Record<string, unknown> }[]>();

export async function createClient() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookieMap.set(supabase, cookiesToSet.map(c => ({ ...c })));
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  return supabase;
}

export function applyCookies(supabase: object, response: NextResponse) {
  const cookies = cookieMap.get(supabase);
  if (cookies) {
    for (const c of cookies) {
      response.cookies.set(c.name, c.value, c.options);
    }
    cookieMap.delete(supabase);
  }
}
