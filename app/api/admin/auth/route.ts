import { NextRequest, NextResponse } from 'next/server';
import { setAdminCookie, clearAdminCookie } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { password, action } = await req.json();

  if (action === 'logout') {
    const res = NextResponse.json({ ok: true });
    clearAdminCookie(res);
    return res;
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 503 });
  }

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  setAdminCookie(res);
  return res;
}