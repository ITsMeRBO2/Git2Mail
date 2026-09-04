// ============================================================
// app/api/analyze/route.ts — Main analysis API endpoint
// ============================================================
// POST /api/analyze
// Body: { repoUrl: string }
// Returns: AnalyzeResponse | AnalyzeErrorResponse
//
// Runtime: Node.js (required for simple-git fallback)
// maxDuration: 60s (Vercel Hobby maximum)
// ============================================================

export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { analyzeRequestSchema } from '@/lib/validate';
import { extractCommitData } from '@/lib/extractor';
import { checkRateLimit } from '@/lib/rate-limiter';
import { kv } from '@/lib/kv';
import type { AnalyzeResponse, AnalyzeErrorResponse } from '@/types';

/** Extract client IP from request headers */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

/** Map provider error codes to API error codes */
function mapErrorCode(
  message: string,
  providerCode?: string
): AnalyzeErrorResponse['code'] {
  if (providerCode) {
    const validCodes: AnalyzeErrorResponse['code'][] = [
      'INVALID_URL',
      'REPO_NOT_FOUND',
      'REPO_PRIVATE',
      'REPO_EMPTY',
      'RATE_LIMITED',
      'TIMEOUT',
      'REPO_TOO_LARGE',
    ];
    if (validCodes.includes(providerCode as AnalyzeErrorResponse['code'])) {
      return providerCode as AnalyzeErrorResponse['code'];
    }
  }

  const lower = message.toLowerCase();
  if (lower.includes('not found') || lower.includes('introuvable')) return 'REPO_NOT_FOUND';
  if (lower.includes('privé') || lower.includes('private') || lower.includes('authentication')) return 'REPO_PRIVATE';
  if (lower.includes('vide') || lower.includes('empty') || lower.includes('aucun commit')) return 'REPO_EMPTY';
  if (lower.includes('rate limit') || lower.includes('limite de taux')) return 'RATE_LIMITED';
  if (lower.includes('timeout') || lower.includes('volumineux')) return 'REPO_TOO_LARGE';

  return 'UNKNOWN_ERROR';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Rate limiting ────────────────────────────────────────
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(clientIp);

  if (rateCheck.limited) {
    const retryAfterSec = Math.ceil((rateCheck.retryAfterMs || 60000) / 1000);
    const errorResponse: AnalyzeErrorResponse = {
      success: false,
      error: `Trop de requêtes. Réessayez dans ${retryAfterSec} secondes.`,
      code: 'RATE_LIMIT_EXCEEDED_LOCAL',
    };
    return NextResponse.json(errorResponse, {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  // ── 2. Parse and validate request body ──────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const errorResponse: AnalyzeErrorResponse = {
      success: false,
      error: 'Corps de requête JSON invalide.',
      code: 'INVALID_URL',
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const parseResult = analyzeRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const errorResponse: AnalyzeErrorResponse = {
      success: false,
      error: parseResult.error.errors[0]?.message || 'URL invalide.',
      code: 'INVALID_URL',
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const { repoUrl } = parseResult.data;

  // ── 3. Analyze the repository ────────────────────────────────
  try {
    const result = await extractCommitData(repoUrl);

    const response: AnalyzeResponse = {
      success: true,
      analysisTimestamp: new Date().toISOString(),
      ...result,
    };

    // Log success for dashboard
    try {
      const today = new Date().toISOString().split('T')[0];
      // Extract unique emails from contributors for display
      const emails = response.contributors
        .map((c: any) => c.email)
        .filter((e: string) => e && !e.includes('noreply.github.com'))
        .slice(0, 20); // Cap at 20 emails per log entry
      
      await kv.lpush('dash:logs', {
        timestamp: response.analysisTimestamp,
        provider: response.provider,
        repo: response.repoName,
        success: true,
        emailsFound: response.contributors.length,
        emails,
      }, 500);
      
      await kv.incr('dash:stats:total_requests');
      await kv.incr(`dash:stats:daily_requests:${today}`);
      await kv.incr(`dash:stats:provider:${response.provider}`);
      await kv.incr('dash:stats:success');
      await kv.incr('dash:stats:emails_found', response.contributors.length);
    } catch (e) {
      console.error('Failed to log stats:', e);
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-RateLimit-Remaining': String(rateCheck.remaining ?? 0),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    const providerCode = (error as Error & { code?: string }).code;

    console.error(`[/api/analyze] Error for ${repoUrl}:`, message);

    const code = mapErrorCode(message, providerCode);

    const errorResponse: AnalyzeErrorResponse = {
      success: false,
      error: message,
      code,
    };

    const status = (() => {
      switch (code) {
        case 'INVALID_URL': return 400;
        case 'REPO_NOT_FOUND': return 404;
        case 'REPO_PRIVATE': return 403;
        case 'REPO_EMPTY': return 422;
        case 'RATE_LIMITED': return 429;
        case 'TIMEOUT':
        case 'REPO_TOO_LARGE': return 504;
        default: return 500;
      }
    })();

    // Log error for dashboard
    try {
      const today = new Date().toISOString().split('T')[0];
      await kv.lpush('dash:logs', {
        timestamp: new Date().toISOString(),
        provider: 'unknown',
        repo: repoUrl,
        success: false,
        error: code,
      }, 500);
      
      await kv.incr('dash:stats:total_requests');
      await kv.incr(`dash:stats:daily_requests:${today}`);
      await kv.incr('dash:stats:error');
      await kv.incr(`dash:stats:error:${code}`);
    } catch (e) {
      console.error('Failed to log error stats:', e);
    }

    return NextResponse.json(errorResponse, { status });
  }
}

// Handle non-POST methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      name: 'GitLeak Finder API',
      version: '1.0.0',
      description: 'Analyse les métadonnées publiques des commits Git',
      endpoints: {
        'POST /api/analyze': 'Analyser un dépôt public — Body: { repoUrl: string }',
      },
    },
    { status: 200 }
  );
}
