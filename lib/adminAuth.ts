import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const COOKIE_NAME = 'admin_session';
const COOKIE_VALUE = 'authenticated';

export function checkAdminAuth(req: NextRequest): boolean {
  if (!ADMIN_PASSWORD) {
    console.warn('[admin] ADMIN_PASSWORD not set — admin panel disabled');
    return false;
  }
  const cookie = req.cookies.get(COOKIE_NAME);
  return cookie?.value === COOKIE_VALUE;
}

export function setAdminCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 дней
    path: '/',
  });
}

export function clearAdminCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
}

export function withAdminAuth(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  if (!checkAdminAuth(req)) {
    return Promise.resolve(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
  }
  return handler();
}