import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminAuth';
import { getSettings, invalidateCache } from '@/lib/settings';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    invalidateCache();
    const settings = await getSettings();
    return NextResponse.json(settings, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  });
}

export async function PUT(req: NextRequest) {
  return withAdminAuth(req, async () => {
    const body = await req.json();

    const allowed = [
      'ai_model', 'ai_max_tokens', 'ai_system_prompt',
      'ai_user_prompt_template', 'ai_min_words', 'ai_max_words',
      'tts_voice', 'tts_stability', 'tts_similarity_boost',
      'tts_style', 'tts_speed', 'tts_language_code',
      'tts_preprocessing_prompt',
      'illustration_prompt_template',
      'cost_per_story', 'cost_per_tts', 'cost_per_illustration', 'cost_currency',
      'rate_limit_per_hour',
    ];

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const db = getServiceSupabase();
    const { error } = await db.from('app_settings').update(updates).eq('id', 1);

    if (error) {
      console.error('[settings PUT]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateCache();
    return NextResponse.json({ ok: true });
  });
}