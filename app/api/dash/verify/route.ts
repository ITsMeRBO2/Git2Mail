import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { kv } from '@/lib/kv';

export const runtime = 'nodejs';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { pin } = body;

    const attemptsKey = `dash:attempts:${ip}`;
    const banKey = `dash:ban:${ip}`;

    // Check if IP is banned
    const banEnd = await kv.get<number>(banKey);
    if (banEnd && banEnd > Date.now()) {
      const remainingSeconds = Math.ceil((banEnd - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Banni temporairement.', remainingSeconds },
        { status: 429 }
      );
    }

    const correctPin = process.env.DASH_PIN || '6767'; // Fallback for dev only

    if (pin !== correctPin) {
      // Increment attempts
      const attempts = await kv.incr(attemptsKey);
      
      if (attempts >= 3) {
        // Ban for 15 minutes
        await kv.set(banKey, Date.now() + 15 * 60 * 1000, { ex: 15 * 60 });
        await kv.del(attemptsKey); // Reset attempts
        return NextResponse.json(
          { error: 'Banni temporairement.', remainingSeconds: 15 * 60 },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `Code incorrect — ${3 - attempts} tentative(s) restante(s).` },
        { status: 401 }
      );
    }

    // PIN is correct, clear attempts
    await kv.del(attemptsKey);

    // Generate JWT cookie
    const secret = new TextEncoder().encode(
      process.env.DASH_SECRET || 'fallback_secret_for_dev_only_please_change'
    );
    
    const token = await new SignJWT({ auth: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: 'dash_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
