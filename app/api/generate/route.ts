import { NextRequest, NextResponse } from 'next/server';
import { generateStory } from '@/lib/kie';
import { getServiceSupabase } from '@/lib/supabase';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { containsProfanity, generateSlug, CHARACTERS, MORALS } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import { getSettings, buildIllustrationPrompt } from '@/lib/settings';

export const runtime = 'nodejs';
export const maxDuration = 180;

const KIE_API_KEY = process.env.KIE_API_KEY!;
const validCharacterNames = CHARACTERS.map(c => c.name);
const validMorals: readonly string[] = MORALS;

async function generateIllustration(prompt: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KIE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'flux-2/pro-text-to-image',
        input: { prompt, aspect_ratio: '4:3', resolution: '1K', nsfw_checker: true },
      }),
    });
    const raw = await res.text();
    console.log('[illustration/submit] HTTP', res.status, raw.slice(0, 200));
    if (!res.ok) return null;

    const taskId = JSON.parse(raw)?.data?.taskId;
    if (!taskId) return null;

    for (let i = 1; i <= 30; i++) {
      await new Promise(r => setTimeout(r, 4000));
      const sr = await fetch(
        `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
        { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
      );
      const sd = JSON.parse(await sr.text());
      const state = String(sd?.data?.state ?? '').toLowerCase();
      console.log(`[illustration/poll #${i}] state=${state}`);
      if (state === 'success') {
        const url = JSON.parse(sd.data.resultJson ?? '{}')?.resultUrls?.[0];
        return url ?? null;
      }
      if (state === 'fail') return null;
    }
    return null;
  } catch (e) {
    console.error('[illustration] error:', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 }); }

    const { childName, characters, moral, wishes } = body as Record<string, unknown>;

    if (!childName || typeof childName !== 'string')
      return NextResponse.json({ error: 'Укажите имя ребёнка' }, { status: 400 });

    const name = childName.trim().slice(0, 50);
    if (!name) return NextResponse.json({ error: 'Имя не может быть пустым' }, { status: 400 });
    if (containsProfanity(name))
      return NextResponse.json({ error: 'Пожалуйста, введите настоящее имя ребёнка' }, { status: 400 });

    if (!Array.isArray(characters) || characters.length < 2 || characters.length > 3)
      return NextResponse.json({ error: 'Выберите 2 или 3 персонажа' }, { status: 400 });

    // Фикс: приводим к string[] через явный as, потом фильтруем через отдельный массив строк
    const validatedChars = (characters as string[]).filter(
      c => typeof c === 'string' && (validCharacterNames as string[]).includes(c)
    );
    if (validatedChars.length !== characters.length)
      return NextResponse.json({ error: 'Недопустимый персонаж' }, { status: 400 });

    if (!moral || typeof moral !== 'string' || !validMorals.includes(moral))
      return NextResponse.json({ error: 'Выберите главную мысль' }, { status: 400 });

    const cleanWishes = wishes && typeof wishes === 'string' ? wishes.trim().slice(0, 200) : undefined;
    if (cleanWishes && containsProfanity(cleanWishes))
      return NextResponse.json({ error: 'Пожалуйста, используйте подходящие пожелания' }, { status: 400 });

    const settings = await getSettings();
    const { allowed, remaining } = await checkRateLimit(ip, settings.rate_limit_per_hour);
    if (!allowed)
      return NextResponse.json({ error: 'Вы создали слишком много сказок. Попробуйте через час!' }, { status: 429 });

    console.log('[generate] generating story...');
    const storyText = await generateStory({
      childName: name, characters: validatedChars, moral, wishes: cleanWishes,
    });
    console.log('[generate] story done, generating illustration...');

    const illustrationPrompt = buildIllustrationPrompt(
      settings.illustration_prompt_template,
      storyText,
      validatedChars
    );

    const illustrationUrl = await generateIllustration(illustrationPrompt);
    console.log('[generate] illustration url:', illustrationUrl);

    const slug = generateSlug();
    const db = getServiceSupabase();
    const { data: story, error: dbError } = await db
      .from('stories')
      .insert({
        slug,
        child_name: name,
        characters: validatedChars,
        moral,
        wishes: cleanWishes || null,
        story_text: storyText,
        illustration_url: illustrationUrl ?? null,
        illustration_prompt: illustrationUrl ? illustrationPrompt : null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Ошибка при сохранении сказки' }, { status: 500 });
    }

    await trackEvent({ event_type: 'story_generated', story_slug: slug, moral, characters: validatedChars, ip, cost: settings.cost_per_story });
    if (illustrationUrl) {
      await trackEvent({ event_type: 'illustration_generated', story_slug: slug, ip, cost: settings.cost_per_illustration });
    }

    return NextResponse.json(
      {
        slug: story.slug,
        storyText,
        childName: name,
        characters: validatedChars,
        moral,
        illustrationUrl: illustrationUrl ?? null,
        illustrationPrompt: illustrationUrl ? illustrationPrompt : null,
      },
      { headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  } catch (err) {
    console.error('Generate error:', err);
    return NextResponse.json({ error: 'Что-то пошло не так. Попробуйте ещё раз!' }, { status: 500 });
  }
}