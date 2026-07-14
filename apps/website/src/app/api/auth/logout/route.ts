import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'agroconnect_session';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Signed out' });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
