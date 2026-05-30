import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getSettings, buildIllustrationPrompt } from '@/lib/settings';
import { trackEvent } from '@/lib/analytics';
import { getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const KIE_API_KEY = process.env.KIE_API_KEY!;

async function submitJob(prompt: string): Promise<string> {
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KIE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'flux-2/pro-text-to-image',
      input: { prompt, aspect_ratio: '4:3', resolution: '1K', nsfw_checker: true },
    }),
  });
  const raw = await res.text();
  console.log('[illus/submit] HTTP', res.status, raw.slice(0, 200));
  if (!res.ok) throw new Error(`KIE submit error: ${res.status}`);
  const taskId = JSON.parse(raw)?.data?.taskId;
  if (!taskId) throw new Error('No taskId: ' + raw);
  return taskId;
}

async function pollJob(taskId: string): Promise<string> {
  // 12 попыток × 4с = 48с — укладываемся в 60с лимит
  for (let i = 1; i <= 12; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const res = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
    );
    const json = JSON.parse(await res.text());
    const d = json?.data ?? {};
    const state = String(d.state ?? '').toLowerCase();
    console.log(`[illus/poll #${i}] state=${state}`);

    if (state === 'success') {
      const url = JSON.parse(d.resultJson ?? '{}')?.resultUrls?.[0];
      if (url) return url;
      throw new Error('No URL in resultJson: ' + d.resultJson);
    }
    if (state === 'fail') throw new Error('KIE failed: ' + (d.failMsg || 'unknown'));
  }
  throw new Error('Illustration timeout');
}

export async function POST(req: NextRequest) {
  try {
    const { slug, storyText, characters } = await req.json();
    if (!slug || !storyText) {
      return NextResponse.json({ error: 'slug и storyText обязательны' }, { status: 400 });
    }

    const settings = await getSettings();
    const prompt = buildIllustrationPrompt(
      settings.illustration_prompt_template,
      storyText,
      characters ?? []
    );

    console.log('[illus] prompt:', prompt.slice(0, 150));

    const taskId = await submitJob(prompt);
    const imageUrl = await pollJob(taskId);

    // Сохраняем в Supabase
    const db = getServiceSupabase();
    await db.from('stories').update({
      illustration_url: imageUrl,
      illustration_prompt: prompt,
    }).eq('slug', slug);

    // Аналитика
    const ip = getClientIP(req);
    await trackEvent({
      event_type: 'illustration_generated',
      story_slug: slug,
      ip,
      cost: settings.cost_per_illustration,
    });

    return NextResponse.json({ imageUrl, prompt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[illus] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}