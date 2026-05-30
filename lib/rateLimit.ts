import { getServiceSupabase } from './supabase';

export async function checkRateLimit(
  ip: string,
  maxPerHour = 10
): Promise<{ allowed: boolean; remaining: number }> {
  const db = getServiceSupabase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await db
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', oneHourAgo);

  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: maxPerHour };
  }

  const currentCount = count || 0;
  if (currentCount >= maxPerHour) return { allowed: false, remaining: 0 };

  await db.from('rate_limits').insert({ ip });
  return { allowed: true, remaining: maxPerHour - currentCount - 1 };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP.trim();
  return 'unknown';
}