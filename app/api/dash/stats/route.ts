import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { kv } from '@/lib/kv';

export const runtime = 'nodejs';

async function verifySession(request: NextRequest) {
  const token = request.cookies.get('dash_session')?.value;
  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(
      process.env.DASH_SECRET || 'fallback_secret_for_dev_only_please_change'
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const isAuthenticated = await verifySession(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const totalRequests = await kv.get<number>('dash:stats:total_requests') || 0;
    const emailsFound = await kv.get<number>('dash:stats:emails_found') || 0;
    const successCount = await kv.get<number>('dash:stats:success') || 0;
    
    // Providers distribution
    const github = await kv.get<number>('dash:stats:provider:github') || 0;
    const gitlab = await kv.get<number>('dash:stats:provider:gitlab') || 0;
    const generic = await kv.get<number>('dash:stats:provider:generic') || 0;
    
    // Errors distribution
    const errPrivate = await kv.get<number>('dash:stats:error:REPO_PRIVATE') || 0;
    const errNotFound = await kv.get<number>('dash:stats:error:REPO_NOT_FOUND') || 0;
    const errEmpty = await kv.get<number>('dash:stats:error:REPO_EMPTY') || 0;
    const errTimeout = await kv.get<number>('dash:stats:error:TIMEOUT') || 0;
    const errInvalidUrl = await kv.get<number>('dash:stats:error:INVALID_URL') || 0;

    // Daily requests (last 14 days)
    const dailyRequests = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = await kv.get<number>(`dash:stats:daily_requests:${dateStr}`) || 0;
      dailyRequests.push({ date: dateStr.slice(5), count }); // keep MM-DD
    }

    const logs = await kv.get<any[]>('dash:logs') || [];

    return NextResponse.json({
      success: true,
      stats: {
        totalRequests,
        emailsFound,
        successRate: totalRequests > 0 ? Math.round((successCount / totalRequests) * 100) : 0,
        providers: [
          { name: 'GitHub', value: github },
          { name: 'GitLab', value: gitlab },
          { name: 'Générique', value: generic },
        ].filter(p => p.value > 0),
        errors: [
          { name: 'Privé', value: errPrivate },
          { name: 'Introuvable', value: errNotFound },
          { name: 'Vide', value: errEmpty },
          { name: 'Timeout', value: errTimeout },
          { name: 'URL Invalide', value: errInvalidUrl },
        ].filter(e => e.value > 0).sort((a, b) => b.value - a.value),
        dailyRequests,
        logs: logs.slice(0, 50), // Send only last 50 to client for table
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
