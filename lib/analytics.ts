import { getServiceSupabase } from './supabase';
import { createHash } from 'crypto';

export type EventType = 'story_generated' | 'tts_generated' | 'share_clicked' | 'page_view' | 'illustration_generated';

interface TrackEventParams {
  event_type: EventType;
  story_slug?: string;
  moral?: string;
  characters?: string[];
  ip?: string;
  cost?: number;
}

export async function trackEvent(params: TrackEventParams) {
  try {
    const db = getServiceSupabase();
    const ip_hash = params.ip
      ? createHash('sha256').update(params.ip).digest('hex').slice(0, 16)
      : null;
    await db.from('analytics_events').insert({
      event_type: params.event_type,
      story_slug: params.story_slug ?? null,
      moral: params.moral ?? null,
      characters: params.characters ?? null,
      ip_hash,
      cost: params.cost ?? null,
    });
  } catch (e) {
    console.error('[analytics] track error:', e);
  }
}

export interface CostStats {
  total_cost: number;
  total_stories: number;
  total_tts: number;
  cost_per_story_avg: number;
  cost_per_tts_avg: number;
  cost_7d: number;
  cost_30d: number;
  currency: string;
}

export interface AnalyticsData {
  total_stories: number;
  total_tts: number;
  total_shares: number;
  total_views: number;
  stories_7d: number;
  tts_7d: number;
  tts_conversion: number;
  share_conversion: number;
  by_day: { date: string; stories: number; tts: number }[];
  top_morals: { moral: string; count: number }[];
  top_characters: { character: string; count: number }[];
  recent_stories: {
    slug: string;
    child_name: string;
    characters: string[];
    moral: string;
    has_tts: boolean;
    created_at: string;
  }[];
  unique_users_7d: number;
  unique_users_30d: number;
  costs: CostStats;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const db = getServiceSupabase();
  const now = new Date();
  const d7  = new Date(now.getTime() -  7 * 86400_000).toISOString();
  const d14 = new Date(now.getTime() - 14 * 86400_000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 86400_000).toISOString();

  const [eventsAll, events7d, events14d, events30d, recentStories, settings] = await Promise.all([
    db.from('analytics_events').select('event_type, moral, characters, ip_hash, cost'),
    db.from('analytics_events').select('event_type, moral, characters, ip_hash, cost').gte('created_at', d7),
    db.from('analytics_events').select('event_type, created_at').gte('created_at', d14),
    db.from('analytics_events').select('event_type, moral, characters, ip_hash, cost').gte('created_at', d30),
    db.from('stories').select('slug, child_name, characters, moral, tts_url, created_at').order('created_at', { ascending: false }).limit(20),
    db.from('app_settings').select('cost_per_story, cost_per_tts, cost_per_illustration, cost_currency').eq('id', 1).single(),
  ]);

  const all  = eventsAll.data   ?? [];
  const w7   = events7d.data    ?? [];
  const w14  = events14d.data   ?? [];
  const w30  = events30d.data   ?? [];
  const stories = recentStories.data ?? [];

  const currency = settings.data?.cost_currency ?? 'USD';
  const costPerStory = Number(settings.data?.cost_per_story ?? 0.015);
  const costPerTts   = Number(settings.data?.cost_per_tts   ?? 0.180);

  // Счётчики
  const total_stories = all.filter(e => e.event_type === 'story_generated').length;
  const total_tts     = all.filter(e => e.event_type === 'tts_generated').length;
  const total_shares  = all.filter(e => e.event_type === 'share_clicked').length;
  const total_views   = all.filter(e => e.event_type === 'page_view').length;
  const stories_7d    = w7.filter(e => e.event_type === 'story_generated').length;
  const tts_7d        = w7.filter(e => e.event_type === 'tts_generated').length;

  const tts_conversion   = total_stories > 0 ? Math.round((total_tts   / total_stories) * 100) : 0;
  const share_conversion = total_stories > 0 ? Math.round((total_shares / total_stories) * 100) : 0;

  // По дням (14д)
  const dayMap: Record<string, { stories: number; tts: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400_000);
    dayMap[d.toISOString().slice(0, 10)] = { stories: 0, tts: 0 };
  }
  for (const e of w14) {
    const key = (e.created_at as string).slice(0, 10);
    if (!dayMap[key]) continue;
    if (e.event_type === 'story_generated') dayMap[key].stories++;
    if (e.event_type === 'tts_generated')   dayMap[key].tts++;
  }
  const by_day = Object.entries(dayMap).map(([date, v]) => ({ date, ...v }));

  // Топ моралей
  const moralMap: Record<string, number> = {};
  for (const e of all.filter(e => e.event_type === 'story_generated' && e.moral)) {
    moralMap[e.moral!] = (moralMap[e.moral!] ?? 0) + 1;
  }
  const top_morals = Object.entries(moralMap).map(([moral, count]) => ({ moral, count })).sort((a, b) => b.count - a.count).slice(0, 6);

  // Топ персонажей
  const charMap: Record<string, number> = {};
  for (const e of all.filter(e => e.event_type === 'story_generated' && e.characters)) {
    for (const c of (e.characters ?? [])) charMap[c] = (charMap[c] ?? 0) + 1;
  }
  const top_characters = Object.entries(charMap).map(([character, count]) => ({ character, count })).sort((a, b) => b.count - a.count).slice(0, 7);

  // Уники
  const unique_users_7d  = new Set(w7.map(e => e.ip_hash).filter(Boolean)).size;
  const unique_users_30d = new Set(w30.map(e => e.ip_hash).filter(Boolean)).size;

  // Затраты — берём из events.cost (фактические) или считаем по тарифу
  const sumCost = (events: typeof all, type: string, fallback: number) => {
    const relevant = events.filter(e => e.event_type === type);
    const withCost = relevant.filter(e => e.cost != null);
    if (withCost.length > 0) return withCost.reduce((s, e) => s + Number(e.cost ?? 0), 0);
    return relevant.length * fallback; // fallback: кол-во × тариф
  };

  const total_cost_stories = sumCost(all, 'story_generated', costPerStory);
  const total_cost_tts     = sumCost(all, 'tts_generated',   costPerTts);
  const total_cost         = total_cost_stories + total_cost_tts;

  const cost_7d  = sumCost(w7,  'story_generated', costPerStory) + sumCost(w7,  'tts_generated', costPerTts);
  const cost_30d = sumCost(w30, 'story_generated', costPerStory) + sumCost(w30, 'tts_generated', costPerTts);

  const costs: CostStats = {
    total_cost: Math.round(total_cost * 10000) / 10000,
    total_stories,
    total_tts,
    cost_per_story_avg: total_stories > 0 ? Math.round((total_cost_stories / total_stories) * 10000) / 10000 : costPerStory,
    cost_per_tts_avg:   total_tts     > 0 ? Math.round((total_cost_tts     / total_tts)     * 10000) / 10000 : costPerTts,
    cost_7d:  Math.round(cost_7d  * 10000) / 10000,
    cost_30d: Math.round(cost_30d * 10000) / 10000,
    currency,
  };

  return {
    total_stories, total_tts, total_shares, total_views,
    stories_7d, tts_7d,
    tts_conversion, share_conversion,
    by_day, top_morals, top_characters,
    unique_users_7d, unique_users_30d,
    costs,
    recent_stories: stories.map(s => ({
      slug: s.slug, child_name: s.child_name, characters: s.characters,
      moral: s.moral, has_tts: !!s.tts_url, created_at: s.created_at,
    })),
  };
}