import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getSettings, buildIllustrationPrompt } from '@/lib/settings';
import { trackEvent } from '@/lib/analytics';
import { getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const maxDuration = 120;

const KIE_API_KEY = process.env.KIE_API_KEY!;

async function submitIllustrationJob(prompt: string): Promise<string> {
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'flux-2/pro-text-to-image',
      input: {
        prompt,
        aspect_ratio: '4:3',
        resolution: '1K',
        nsfw_checker: true,
      },
    }),
  });

  const raw = await res.text();
  console.log('[illustration/submit] HTTP', res.status, raw.slice(0, 300));

  if (!res.ok) throw new Error(`KIE illustration submit failed: ${res.status} — ${raw}`);

  const json = JSON.parse(raw);
  const taskId = json?.data?.taskId ?? json?.data?.recordId;
  if (!taskId) throw new Error(`No taskId in response: ${raw}`);

  return taskId;
}

async function pollIllustrationResult(taskId: string): Promise<string> {
  const maxAttempts = 30; // 30 × 4s = 120s

  for (let i = 1; i <= maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 4000));

    const res = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
    );

    const raw = await res.text();
    console.log(`[illustration/poll #${i}] state raw:`, raw.slice(0, 300));

    if (!res.ok) continue;

    const json = JSON.parse(raw);
    const d = json?.data ?? {};
    const state = String(d.state ?? '').toLowerCase();

    if (state === 'success') {
      // Flux возвращает URL в resultJson: {"resultUrls":["https://..."]}
      const result = JSON.parse(d.resultJson ?? '{}');
      const url = result?.resultUrls?.[0] ?? result?.url;
      if (url) return url;
      throw new Error('success but no image URL in resultJson: ' + d.resultJson);
    }

    if (state === 'fail') {
      throw new Error('Illustration generation failed: ' + (d.failMsg || 'unknown'));
    }
  }

  throw new Error('Illustration timeout after 120s');
}

export async function POST(req: NextRequest) {
  try {
    const { slug, storyText, characters, customPrompt } = await req.json();

    if (!slug || !storyText) {
      return NextResponse.json({ error: 'slug и storyText обязательны' }, { status: 400 });
    }

    const settings = await getSettings();

    // Строим промпт: если передан customPrompt — используем его, иначе из шаблона настроек
    const prompt = customPrompt
      ? customPrompt
      : buildIllustrationPrompt(settings.illustration_prompt_template, storyText, characters ?? []);

    console.log('[illustration] prompt:', prompt.slice(0, 200));

    // Генерируем
    const taskId = await submitIllustrationJob(prompt);
    const imageUrl = await pollIllustrationResult(taskId);

    console.log('[illustration] done! imageUrl:', imageUrl);

    // Сохраняем в Supabase
    const db = getServiceSupabase();
    await db.from('stories').update({
      illustration_url: imageUrl,
      illustration_prompt: prompt,
    }).eq('slug', slug);

    // Трекинг
    const ip = getClientIP(req);
    await trackEvent({
      event_type: 'illustration_generated',
      story_slug: slug,
      ip,
      cost: settings.cost_per_illustration,
    });

    return NextResponse.json({ imageUrl, prompt });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[illustration] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}