import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminAuth';
import { getAnalytics } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    const data = await getAnalytics();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  });
}