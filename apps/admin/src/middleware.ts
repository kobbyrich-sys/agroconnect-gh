import { type NextRequest } from 'next/server';
import { updateSession } from '@agroconnect/shared';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/admin/:path*'],
};
