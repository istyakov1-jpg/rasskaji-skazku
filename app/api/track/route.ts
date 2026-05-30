import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { createHash } from 'crypto';

export const runtime = 'nodejs';

const ALLOWED_EVENTS = ['page_view', 'share_clicked'] as const;
type AllowedEvent = typeof ALLOWED_EVENTS[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, story_slug } = body as { event_type: string; story_slug?: string };

    if (!ALLOWED_EVENTS.includes(event_type as AllowedEvent)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    // IP из заголовков
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
    const ip_hash = createHash('sha256').update(ip).digest('hex').slice(0, 16);

    const db = getServiceSupabase();
    await db.from('analytics_events').insert({
      event_type,
      story_slug: story_slug || null,
      ip_hash,
    });

    // Если шер — инкрементим счётчик в stories
    if (event_type === 'share_clicked' && story_slug) {
      await db.rpc('increment_share_count', { story_slug_param: story_slug }).catch(() => {
        // Если RPC не создана — тихо игнорируем, основное событие уже записано
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[track]', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}