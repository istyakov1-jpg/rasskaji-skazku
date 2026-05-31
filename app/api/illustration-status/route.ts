import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getSettings } from '@/lib/settings';
import { trackEvent } from '@/lib/analytics';
import { getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const KIE_API_KEY = process.env.KIE_API_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  const slug = searchParams.get('slug');

  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

  try {
    const res = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
    );
    const json = JSON.parse(await res.text());
    const d = json?.data ?? {};
    const state = String(d.state ?? '').toLowerCase();

    console.log(`[illus-status] taskId=${taskId} state=${state}`);

    if (state === 'success') {
      const imageUrl = JSON.parse(d.resultJson ?? '{}')?.resultUrls?.[0];
      if (!imageUrl) return NextResponse.json({ status: 'failed' });

      // Сохраняем в Supabase
      if (slug) {
        const db = getServiceSupabase();
        await db.from('stories').update({ illustration_url: imageUrl }).eq('slug', slug);
      }

      // Аналитика
      const settings = await getSettings();
      const ip = getClientIP(req);
      await trackEvent({ event_type: 'illustration_generated', story_slug: slug ?? undefined, ip, cost: settings.cost_per_illustration });

      return NextResponse.json({ status: 'completed', imageUrl });
    }

    if (state === 'fail') return NextResponse.json({ status: 'failed' });

    return NextResponse.json({ status: 'processing' });
  } catch (err) {
    console.error('[illus-status] error:', err);
    return NextResponse.json({ status: 'processing' }); // не ломаем поллинг
  }
}