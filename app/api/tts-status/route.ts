import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  const slug = searchParams.get('slug');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId обязателен' }, { status: 400 });
  }

  const KIE_API_KEY = process.env.KIE_API_KEY!;

  try {
    const response = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${KIE_API_KEY}` },
      }
    );

    const raw = await response.text();
    console.log('[tts-status] raw response:', raw);

    if (!response.ok) {
      return NextResponse.json({ status: 'pending' });
    }

    const data = JSON.parse(raw);
    const taskData = data?.data ?? {};
    const state = String(taskData.state ?? '').toLowerCase();

    console.log('[tts-status] state:', state, '| resultJson:', taskData.resultJson);

    // success
    if (state === 'success') {
      let audioUrl: string | undefined;
      try {
        const result = JSON.parse(taskData.resultJson ?? '{}');
        audioUrl = result?.resultUrls?.[0];
      } catch (e) {
        console.error('[tts-status] resultJson parse error:', e);
      }

      console.log('[tts-status] audioUrl:', audioUrl);

      if (!audioUrl) {
        return NextResponse.json({
          status: 'failed',
          error: 'KIE вернул success, но URL аудио не найден',
        });
      }

      // Сохраняем в Supabase
      if (slug) {
        const db = getServiceSupabase();
        await db.from('stories').update({ tts_url: audioUrl }).eq('slug', slug);
      }

      return NextResponse.json({ status: 'completed', audioUrl });
    }

    // fail
    if (state === 'fail') {
      return NextResponse.json({
        status: 'failed',
        error: taskData.failMsg || 'KIE: задача завершилась с ошибкой',
      });
    }

    // generating | queuing | waiting → ещё в процессе
    return NextResponse.json({ status: 'processing' });

  } catch (err) {
    console.error('[tts-status] exception:', err);
    return NextResponse.json({ status: 'pending' });
  }
}