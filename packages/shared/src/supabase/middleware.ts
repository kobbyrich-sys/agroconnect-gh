import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  return { supabase, supabaseResponse };
}

export async function updateSession(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAdminLoginRoute = request.nextUrl.pathname === '/admin/login';
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isPublicRoute =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/products') ||
    request.nextUrl.pathname.startsWith('/categories') ||
    request.nextUrl.pathname.startsWith('/about') ||
    request.nextUrl.pathname.startsWith('/contact') ||
    request.nextUrl.pathname.startsWith('/search') ||
    request.nextUrl.pathname.startsWith('/api');

  if (isAdminRoute && !isAdminLoginRoute && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isAdminLoginRoute && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return supabaseResponse;
}
