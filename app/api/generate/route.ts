import { NextRequest, NextResponse } from 'next/server';
import { generateStory } from '@/lib/kie';
import { getServiceSupabase } from '@/lib/supabase';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { containsProfanity, generateSlug, CHARACTERS, MORAL_LABELS } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import { getSettings } from '@/lib/settings';

export const runtime = 'nodejs';
export const maxDuration = 60;

const validCharacterNames = CHARACTERS.map(c => c.name);

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 }); }

    const { childName, characters, moral, wishes, ageGroup } = body as Record<string, unknown>;

    // Валидация имени
    if (!childName || typeof childName !== 'string')
      return NextResponse.json({ error: 'Укажите имя ребёнка' }, { status: 400 });
    const name = childName.trim().slice(0, 50);
    if (!name) return NextResponse.json({ error: 'Имя не может быть пустым' }, { status: 400 });
    if (containsProfanity(name))
      return NextResponse.json({ error: 'Пожалуйста, введите настоящее имя ребёнка' }, { status: 400 });

    // Валидация персонажей
    if (!Array.isArray(characters) || characters.length < 1 || characters.length > 3)
      return NextResponse.json({ error: 'Выберите от 1 до 3 персонажей' }, { status: 400 });
    const charSet = new Set<string>(validCharacterNames);
    const validatedChars = (characters as string[]).filter(c => typeof c === 'string' && charSet.has(c));
    if (validatedChars.length !== characters.length)
      return NextResponse.json({ error: 'Недопустимый персонаж' }, { status: 400 });

    // Валидация морали (принимаем и новый формат label и старый)
    if (!moral || typeof moral !== 'string')
      return NextResponse.json({ error: 'Выберите тему сказки' }, { status: 400 });
    if (!(MORAL_LABELS as string[]).includes(moral) && !['Добро побеждает зло','Беречь природу','Помогать другим'].includes(moral))      return NextResponse.json({ error: 'Неверная тема' }, { status: 400 });

    const cleanWishes = wishes && typeof wishes === 'string' ? wishes.trim().slice(0, 200) : undefined;
    if (cleanWishes && containsProfanity(cleanWishes))
      return NextResponse.json({ error: 'Пожалуйста, используйте подходящие пожелания' }, { status: 400 });

    // Age group для промпта
    const ageHint = typeof ageGroup === 'string' ? ageGroup : '5-7';

    // Rate limit
    const settings = await getSettings();
    const { allowed, remaining } = await checkRateLimit(ip, settings.rate_limit_per_hour);
    if (!allowed)
      return NextResponse.json({ error: 'Вы создали слишком много сказок. Попробуйте через час!' }, { status: 429 });

    // Генерация сказки
    const storyText = await generateStory({
      childName: name,
      characters: validatedChars,
      moral,
      wishes: cleanWishes,
      ageGroup: ageHint,
    });

    // Сохранение
    const slug = generateSlug();
    const db = getServiceSupabase();
    const { data: story, error: dbError } = await db
      .from('stories')
      .insert({ slug, child_name: name, characters: validatedChars, moral, wishes: cleanWishes || null, story_text: storyText })
      .select().single();

    if (dbError) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Ошибка при сохранении сказки' }, { status: 500 });
    }

    await trackEvent({ event_type: 'story_generated', story_slug: slug, moral, characters: validatedChars, ip, cost: settings.cost_per_story });

    return NextResponse.json(
      { slug: story.slug, storyText, childName: name, characters: validatedChars, moral },
      { headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  } catch (err) {
    console.error('Generate error:', err);
    return NextResponse.json({ error: 'Что-то пошло не так. Попробуйте ещё раз!' }, { status: 500 });
  }
}