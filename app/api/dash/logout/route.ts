import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.redirect(
    new URL('/dash', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  );
  response.cookies.set({
    name: 'dash_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}
