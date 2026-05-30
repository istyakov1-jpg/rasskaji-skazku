import { getServiceSupabase } from './supabase';

export interface AppSettings {
  ai_model: string;
  ai_max_tokens: number;
  ai_system_prompt: string;
  ai_user_prompt_template: string;
  ai_min_words: number;
  ai_max_words: number;
  tts_voice: string;
  tts_stability: number;
  tts_similarity_boost: number;
  tts_style: number;
  tts_speed: number;
  tts_language_code: string;
  tts_preprocessing_prompt: string;
  illustration_prompt_template: string;
  cost_per_story: number;
  cost_per_tts: number;
  cost_per_illustration: number;
  cost_currency: string;
  rate_limit_per_hour: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  ai_model: 'claude-sonnet-4-6',
  ai_max_tokens: 2048,
  ai_system_prompt: `Ты — добрый детский писатель. Ты пишешь только добрые, светлые и безопасные сказки для детей от 3 до 7 лет.

СТРОГИЕ ПРАВИЛА:
- Никакого насилия, смерти, боли, страха или опасных ситуаций
- Никакой грубости, конфликтов, плохих слов
- Никаких политических тем, религиозных споров, реальных трагических событий
- Никаких страшных персонажей или пугающих сцен
- Язык простой, понятный ребёнку 3–7 лет
- Обязательно позитивное и доброе окончание
- Сказка должна быть тёплой, уютной и вызывать улыбку`,
  ai_user_prompt_template: `Напиши добрую сказку для ребёнка по имени {name}.

Персонажи в сказке: {characters}.
Главная мысль сказки: {moral}.{wishes}

Длина сказки: {min_words}–{max_words} слов.
Начни сказку сразу, без предисловий. Не пиши заголовок.`,
  ai_min_words: 400,
  ai_max_words: 600,
  tts_voice: 'Matilda',
  tts_stability: 0.60,
  tts_similarity_boost: 0.80,
  tts_style: 0.20,
  tts_speed: 0.95,
  tts_language_code: 'ru',
  tts_preprocessing_prompt: 'Читай плавно и душевно, как добрый рассказчик для детей. Делай паузы между абзацами. Голос тёплый, спокойный, с лёгкой улыбкой.',
  illustration_prompt_template: "Children's book illustration, watercolor style, soft pastel colors, whimsical and magical atmosphere. Scene from a fairy tale: {story_preview}. Characters: {characters}. Style: gentle, dreamy, safe for children, no scary elements, warm lighting.",
  cost_per_story: 0.015,
  cost_per_tts: 0.180,
  cost_per_illustration: 0.040,
  cost_currency: 'USD',
  rate_limit_per_hour: 10,
};

let cachedSettings: AppSettings | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000;

export async function getSettings(): Promise<AppSettings> {
  if (cachedSettings && Date.now() - cacheTime < CACHE_TTL) return cachedSettings;
  try {
    const db = getServiceSupabase();
    const { data, error } = await db.from('app_settings').select('*').eq('id', 1).single();
    if (error || !data) { console.warn('[settings] fallback to defaults:', error?.message); return DEFAULT_SETTINGS; }
    cachedSettings = { ...DEFAULT_SETTINGS, ...data } as AppSettings;
    cacheTime = Date.now();
    return cachedSettings;
  } catch (e) {
    console.error('[settings] load error:', e);
    return DEFAULT_SETTINGS;
  }
}

export function invalidateCache() {
  cachedSettings = null;
  cacheTime = 0;
}

export function buildPrompt(
  template: string,
  vars: { name: string; characters: string[]; moral: string; wishes?: string; min_words: number; max_words: number }
): string {
  const wishesText = vars.wishes ? `\nОсобые пожелания: ${vars.wishes}` : '';
  return template
    .replace('{name}', vars.name)
    .replace('{characters}', vars.characters.join(', '))
    .replace('{moral}', vars.moral)
    .replace('{wishes}', wishesText)
    .replace('{min_words}', String(vars.min_words))
    .replace('{max_words}', String(vars.max_words));
}

export function buildIllustrationPrompt(template: string, storyText: string, characters: string[]): string {
  const preview = storyText.slice(0, 300).replace(/\n/g, ' ');
  return template
    .replace('{story_preview}', preview)
    .replace('{characters}', characters.join(', '));
}