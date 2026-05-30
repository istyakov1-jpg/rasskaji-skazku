'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { AnalyticsData } from '@/lib/analytics';

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) onLogin(); else setError('Неверный пароль');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-3xl mb-2 text-center">🔐</div>
        <h1 className="text-xl font-bold text-center mb-6">Вход в админку</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Пароль"
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon, accent = false }: {
  label: string; value: string | number; sub?: string; icon: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? 'bg-purple-900/40 border-purple-700' : 'bg-gray-900 border-gray-800'}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{sub}</span>}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function MiniChart({ data }: { data: { date: string; stories: number; tts: number }[] }) {
  if (data.length < 2) return null;
  const maxVal = Math.max(...data.map(d => d.stories), 1);
  const W = 500; const H = 80;
  const pts    = data.map((d, i) => `${(i / (data.length - 1)) * W},${H - (d.stories / maxVal) * H}`).join(' ');
  const ptsTts = data.map((d, i) => `${(i / (data.length - 1)) * W},${H - (d.tts    / maxVal) * H}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
      <polyline points={pts}    fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={ptsTts} fill="none" stroke="#22d3ee" strokeWidth="2"   strokeLinejoin="round" strokeLinecap="round" strokeDasharray="6 3" />
    </svg>
  );
}

function BarChart({ items, color = 'bg-purple-500' }: { items: { label: string; count: number }[]; color?: string }) {
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <div className="flex flex-col gap-2">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="text-sm text-gray-300 w-36 truncate shrink-0">{item.label}</div>
          <div className="flex-1 bg-gray-800 rounded-full h-2">
            <div className={`${color} h-2 rounded-full`} style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
          <div className="text-sm text-gray-400 w-8 text-right">{item.count}</div>
        </div>
      ))}
    </div>
  );
}

function CostBlock({ costs }: { costs: AnalyticsData['costs'] }) {
  // Умное форматирование: убираем лишние нули, сохраняем читаемость
  const fmt = (n: number): string => {
    if (n === 0) return '0';
    if (n >= 100) return n.toFixed(0);
    if (n >= 10)  return n.toFixed(1);
    if (n >= 1)   return n.toFixed(2);
    if (n >= 0.1) return n.toFixed(3);
    return n.toFixed(4);
  };
  const c = costs.currency;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h2 className="font-semibold mb-4 text-gray-200 flex items-center gap-2">
        💰 Затраты (себестоимость)
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { icon: '💸', label: 'Всего потрачено', value: `${fmt(costs.total_cost)} ${c}`, accent: true },
          { icon: '📖', label: 'Ср. стоимость сказки', value: `${fmt(costs.cost_per_story_avg)} ${c}` },
          { icon: '🎙️', label: 'Ср. стоимость TTS', value: `${fmt(costs.cost_per_tts_avg)} ${c}` },
          { icon: '📅', label: 'За последние 7 дней', value: `${fmt(costs.cost_7d)} ${c}` },
        ].map(item => (
          <div key={item.label} className={`rounded-xl p-4 border ${item.accent ? 'bg-amber-900/30 border-amber-700' : 'bg-gray-800 border-gray-700'}`}>
            <div className="text-xl mb-1">{item.icon}</div>
            <div className={`text-xl font-bold ${item.accent ? 'text-amber-300' : 'text-white'}`}>{item.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-800/50 rounded-xl p-3">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
          <span>Сказок сгенерировано: <b className="text-white">{costs.total_stories}</b></span>
          <span>Озвучек сгенерировано: <b className="text-white">{costs.total_tts}</b></span>
          <span>За 30 дней: <b className="text-white">{fmt(costs.cost_30d)} {c}</b></span>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [tab, setTab] = useState<'overview' | 'stories'>('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' });
      if (res.ok) { setData(await res.json()); setLastUpdated(new Date().toLocaleTimeString('ru')); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">🪄 Расскажи Сказку — Админка</h1>
          {lastUpdated && <p className="text-gray-600 text-xs mt-1">Обновлено в {lastUpdated}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/settings" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">⚙️ Настройки</Link>
          <button onClick={load} disabled={loading}
            className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
            <span className={loading ? 'animate-spin inline-block' : ''}>↻</span>
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>
          <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300 text-sm">Выйти</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['overview', 'stories'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {t === 'overview' ? '📊 Обзор' : '📖 Сказки'}
          </button>
        ))}
      </div>

      {loading && !data && <div className="text-center py-20 text-gray-500">Загружаем данные...</div>}

      {data && tab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Ключевые метрики */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon="📖" label="Сказок всего" value={data.total_stories} sub={`+${data.stories_7d} за 7д`} accent />
            <MetricCard icon="🎙️" label="Озвучек" value={data.total_tts} sub={`+${data.tts_7d} за 7д`} />
            <MetricCard icon="👁️" label="Просмотров" value={data.total_views} />
            <MetricCard icon="🔗" label="Шеров" value={data.total_shares} />
          </div>

          {/* Затраты */}
          <CostBlock costs={data.costs} />

          {/* Воронка + конверсии */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="font-semibold mb-4 text-gray-200">🔻 Воронка</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Просмотры страниц сказок', value: data.total_views, color: 'bg-blue-500' },
                  { label: 'Создали сказку', value: data.total_stories, color: 'bg-purple-500' },
                  { label: 'Запросили озвучку', value: data.total_tts, color: 'bg-cyan-500' },
                  { label: 'Поделились', value: data.total_shares, color: 'bg-green-500' },
                ].map((step, i, arr) => {
                  const base = arr[0].value + arr[1].value || 1;
                  const pct = Math.round((step.value / base) * 100);
                  return (
                    <div key={step.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{step.label}</span>
                        <span className="text-gray-400">{step.value} <span className="text-xs">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full">
                        <div className={`${step.color} h-2 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="font-semibold mb-4 text-gray-200">📈 Конверсии</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Озвучку запросили', value: `${data.tts_conversion}%`, icon: '🎙️', desc: 'от сказок' },
                  { label: 'Поделились', value: `${data.share_conversion}%`, icon: '🔗', desc: 'от сказок' },
                  { label: 'Уник. 7 дней', value: data.unique_users_7d, icon: '👤', desc: 'по IP' },
                  { label: 'Уник. 30 дней', value: data.unique_users_30d, icon: '👥', desc: 'по IP' },
                ].map(c => (
                  <div key={c.label} className="bg-gray-800 rounded-xl p-4">
                    <div className="text-xl mb-1">{c.icon}</div>
                    <div className="text-2xl font-bold">{c.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
                    <div className="text-xs text-gray-600">{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* График */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-200">📅 Активность за 14 дней</h2>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-purple-500 inline-block rounded" /> Сказки</span>
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-cyan-500 inline-block rounded" /> Озвучки</span>
              </div>
            </div>
            <MiniChart data={data.by_day} />
            <div className="flex justify-between mt-2">
              {data.by_day.filter((_, i) => i % 2 === 0).map(d => (
                <span key={d.date} className="text-xs text-gray-600">
                  {new Date(d.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                </span>
              ))}
            </div>
          </div>

          {/* Топы */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="font-semibold mb-4 text-gray-200">💫 Популярные морали</h2>
              {data.top_morals.length > 0
                ? <BarChart items={data.top_morals.map(m => ({ label: m.moral, count: m.count }))} color="bg-purple-500" />
                : <p className="text-gray-600 text-sm">Нет данных</p>}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="font-semibold mb-4 text-gray-200">🎭 Популярные персонажи</h2>
              {data.top_characters.length > 0
                ? <BarChart items={data.top_characters.map(c => ({ label: c.character, count: c.count }))} color="bg-cyan-600" />
                : <p className="text-gray-600 text-sm">Нет данных</p>}
            </div>
          </div>
        </div>
      )}

      {data && tab === 'stories' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-200">📖 Последние сказки</h2>
            <span className="text-xs text-gray-600">Показано {data.recent_stories.length}</span>
          </div>
          {data.recent_stories.length === 0
            ? <div className="p-8 text-center text-gray-600">Сказок пока нет</div>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50">
                    <tr>
                      {['Имя', 'Персонажи', 'Мораль', 'Озвучка', 'Дата', ''].map(h => (
                        <th key={h} className="text-left text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_stories.map((s, i) => (
                      <tr key={s.slug} className={`border-t border-gray-800 ${i % 2 === 0 ? '' : 'bg-gray-800/20'}`}>
                        <td className="px-4 py-3 font-medium text-white">{s.child_name}</td>
                        <td className="px-4 py-3 text-gray-400 max-w-[140px] truncate">{s.characters.join(', ')}</td>
                        <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate">{s.moral}</td>
                        <td className="px-4 py-3">{s.has_tts ? <span className="text-green-400 text-xs font-medium">✓ Есть</span> : <span className="text-gray-600 text-xs">—</span>}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                          {new Date(s.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <a href={`/skazka/${s.slug}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-xs">→ Открыть</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    fetch('/api/admin/analytics', { cache: 'no-store' }).then(r => setAuthed(r.status !== 401));
  }, []);
  if (authed === null) return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard />;
}