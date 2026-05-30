import { NextRequest, NextResponse } from 'next/server';
import { submitTTSJob, pollTTSResult } from '@/lib/kie';
import { getServiceSupabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { slug, storyText } = await req.json();
    if (!slug || !storyText) {
      return NextResponse.json({ error: 'slug и storyText обязательны' }, { status: 400 });
    }

    const taskId = await submitTTSJob(storyText);
    const audioUrl = await pollTTSResult(taskId);

    const db = getServiceSupabase();
    await db.from('stories')
      .update({ tts_task_id: taskId, tts_url: audioUrl })
      .eq('slug', slug);

    // Трекаем событие
    const ip = getClientIP(req);
    await trackEvent({ event_type: 'tts_generated', story_slug: slug, ip });

    return NextResponse.json({ audioUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[tts] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}