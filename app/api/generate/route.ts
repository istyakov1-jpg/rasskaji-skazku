import { NextRequest, NextResponse } from 'next/server';
import { generateStory } from '@/lib/kie';
import { getServiceSupabase } from '@/lib/supabase';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { containsProfanity, generateSlug, CHARACTERS, MORALS } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import { getSettings, buildIllustrationPrompt } from '@/lib/settings';

export const runtime = 'nodejs';
export const maxDuration = 60;

const KIE_API_KEY = process.env.KIE_API_KEY!;
const validCharacterNames = CHARACTERS.map(c => c.name);
const validMorals: readonly string[] = MORALS;

// Только сабмитим job, не ждём результата
async function submitIllustrationJob(prompt: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KIE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'flux-2/pro-text-to-image',
        input: { prompt, aspect_ratio: '4:3', resolution: '1K', nsfw_checker: true },
      }),
    });
    const json = JSON.parse(await res.text());
    return json?.data?.taskId ?? null;
  } catch (e) {
    console.error('[generate] illustration submit error:', e);
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

    const charSet = new Set<string>(validCharacterNames);
    const validatedChars = (characters as string[]).filter(c => typeof c === 'string' && charSet.has(c));
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

    // 1. Генерируем сказку (~20s)
    const storyText = await generateStory({ childName: name, characters: validatedChars, moral, wishes: cleanWishes });

    // 2. Сразу сабмитим job иллюстрации (мгновенно, не ждём)
    const illustrationPrompt = buildIllustrationPrompt(settings.illustration_prompt_template, storyText, validatedChars);
    const illustrationTaskId = await submitIllustrationJob(illustrationPrompt);

    // 3. Сохраняем сказку в Supabase
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
        illustration_prompt: illustrationTaskId ? illustrationPrompt : null,
      })
      .select().single();

    if (dbError) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Ошибка при сохранении сказки' }, { status: 500 });
    }

    await trackEvent({ event_type: 'story_generated', story_slug: slug, moral, characters: validatedChars, ip, cost: settings.cost_per_story });

    // 4. Возвращаем сказку + taskId для поллинга на клиенте
    return NextResponse.json(
      { slug: story.slug, storyText, childName: name, characters: validatedChars, moral, illustrationTaskId },
      { headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  } catch (err) {
    console.error('Generate error:', err);
    return NextResponse.json({ error: 'Что-то пошло не так. Попробуйте ещё раз!' }, { status: 500 });
  }
}