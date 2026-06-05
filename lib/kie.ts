import { getSettings, buildPrompt } from './settings';

const KIE_API_KEY = process.env.KIE_API_KEY!;

interface GenerateStoryParams {
  childName: string;
  characters: string[];
  moral: string;
  wishes?: string;
  ageGroup?: string; // '2-4' | '5-7' | '8-10'
}

const AGE_HINTS: Record<string, string> = {
  '2-4':  'Ребёнку 2–4 года. Используй очень простые слова, короткие предложения, яркие образы.',
  '5-7':  'Ребёнку 5–7 лет. Язык простой и понятный, предложения средней длины.',
  '8-10': 'Ребёнку 8–10 лет. Можно использовать чуть более сложные слова, интересный сюжет.',
};

export async function generateStory(params: GenerateStoryParams): Promise<string> {
  const settings = await getSettings();
  const ageHint = AGE_HINTS[params.ageGroup ?? '5-7'] ?? AGE_HINTS['5-7'];

  const userPrompt = buildPrompt(settings.ai_user_prompt_template, {
    name: params.childName,
    characters: params.characters,
    moral: params.moral,
    wishes: params.wishes,
    min_words: settings.ai_min_words,
    max_words: settings.ai_max_words,
  }) + `\n\n${ageHint}`;

  const response = await fetch('https://api.kie.ai/claude/v1/messages', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KIE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.ai_model,
      max_tokens: settings.ai_max_tokens,
      system: settings.ai_system_prompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) throw new Error(`KIE Claude error: ${response.status}`);
  const data = await response.json();
  const textBlock = data.content?.find((b: { type: string; text?: string }) => b.type === 'text');
  if (!textBlock?.text) throw new Error('No text in KIE response');
  return textBlock.text.trim();
}

export async function submitTTSJob(text: string): Promise<string> {
  const settings = await getSettings();
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KIE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'elevenlabs/text-to-speech-multilingual-v2',
      input: {
        text: text.slice(0, 4000),
        voice: settings.tts_voice,
        stability: settings.tts_stability,
        similarity_boost: settings.tts_similarity_boost,
        style: settings.tts_style,
        speed: settings.tts_speed,
        language_code: settings.tts_language_code,
      },
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`KIE TTS error: ${res.status}`);
  const json = JSON.parse(raw);
  const taskId = json?.data?.taskId ?? json?.data?.recordId;
  if (!taskId) throw new Error(`No taskId: ${raw}`);
  return taskId;
}

export async function pollTTSResult(taskId: string, maxAttempts = 30): Promise<string> {
  for (let i = 1; i <= maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const res = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
    );
    const json = JSON.parse(await res.text());
    const d = json?.data ?? {};
    const state = String(d.state ?? '').toLowerCase();
    if (state === 'success') {
      const url = JSON.parse(d.resultJson ?? '{}')?.resultUrls?.[0];
      if (url) return url;
      throw new Error('success but no URL');
    }
    if (state === 'fail') throw new Error('KIE TTS failed: ' + d.failMsg);
  }
  throw new Error(`TTS timeout`);
}