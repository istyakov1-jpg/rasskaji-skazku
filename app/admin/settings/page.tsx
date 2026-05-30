'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AppSettings } from '@/lib/settings';

const MODELS = ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001', 'gpt-4o', 'gpt-4o-mini'];
const TTS_VOICES = ['Matilda', 'Rachel', 'Domi', 'Bella', 'Antoni', 'Elli', 'Josh', 'Arnold', 'Adam', 'Sam'];
const TTS_LANGS = [
  { code: 'ru', label: 'Русский' }, { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' }, { code: 'fr', label: 'Français' },
];
const CURRENCIES = ['USD', 'EUR', 'RUB'];

const inputCls = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors";
const selectCls = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors";

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-gray-100 mb-5 flex items-center gap-2"><span>{icon}</span>{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {children}
      {help && <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{help}</p>}
    </div>
  );
}

function SliderField({ label, help, value, min, max, step, onChange }: {
  label: string; help?: string; value: number;
  min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label}: ${value}`} help={help}>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-xs text-gray-600 w-8 text-right">{min}</span>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 accent-purple-500 h-2" />
        <span className="text-xs text-gray-600 w-8">{max}</span>
      </div>
    </Field>
  );
}

function VarBadges({ vars }: { vars: string[] }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-3 mt-2">
      <p className="text-xs text-gray-500 mb-2">Переменные:</p>
      <div className="flex flex-wrap gap-1.5">
        {vars.map(v => <code key={v} className="text-xs bg-gray-700 text-purple-300 px-2 py-0.5 rounded">{v}</code>)}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [authed, setAuthed] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/settings', { cache: 'no-store' });
    if (res.status === 401) { setAuthed(false); setLoading(false); return; }
    if (res.ok) setSettings(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const update = (key: keyof AppSettings, value: unknown) =>
    setSettings(s => s ? { ...s, [key]: value } : s);

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) {
      showToast('ok', '✓ Настройки сохранены');
      await loadSettings();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast('err', err.error || 'Ошибка сохранения');
    }
  };

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Нет доступа</p>
        <Link href="/admin" className="text-purple-400 hover:text-purple-300">← Войти в админку</Link>
      </div>
    </div>
  );
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-medium shadow-xl transition-all ${toast.type === 'ok' ? 'bg-green-700' : 'bg-red-700'} text-white`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">← Дашборд</Link>
          <h1 className="text-2xl font-bold">⚙️ Настройки генерации</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50">
          {saving ? 'Сохранение...' : '💾 Сохранить'}
        </button>
      </div>

      <div className="flex flex-col gap-6">

        {/* AI Модель */}
        <Section icon="🤖" title="AI Модель (текст сказки)">
          <Field label="Модель" help="Модель для генерации текста через KIE API">
            <select value={settings.ai_model} onChange={e => update('ai_model', e.target.value)} className={selectCls}>
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Макс. токены">
              <input type="number" value={settings.ai_max_tokens} min={512} max={8192} step={256}
                onChange={e => update('ai_max_tokens', Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Мин. слов">
              <input type="number" value={settings.ai_min_words} min={100} max={2000}
                onChange={e => update('ai_min_words', Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Макс. слов">
              <input type="number" value={settings.ai_max_words} min={200} max={3000}
                onChange={e => update('ai_max_words', Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Системный промпт */}
        <Section icon="📝" title="Системный промпт (сказка)">
          <Field label="System Prompt" help="Главная инструкция для AI. Определяет стиль, тон и ограничения генерации текста.">
            <textarea value={settings.ai_system_prompt}
              onChange={e => update('ai_system_prompt', e.target.value)}
              rows={10} className={`${inputCls} font-mono text-sm resize-y`} />
          </Field>
        </Section>

        {/* Шаблон запроса */}
        <Section icon="🔧" title="Шаблон пользовательского запроса">
          <Field label="User Prompt Template" help="Шаблон запроса который отправляется в AI для генерации каждой сказки.">
            <textarea value={settings.ai_user_prompt_template}
              onChange={e => update('ai_user_prompt_template', e.target.value)}
              rows={8} className={`${inputCls} font-mono text-sm resize-y`} />
          </Field>
          <VarBadges vars={['{name}', '{characters}', '{moral}', '{wishes}', '{min_words}', '{max_words}']} />
        </Section>

        {/* TTS промпт и параметры */}
        <Section icon="🎙️" title="Озвучка (ElevenLabs через KIE)">
          <Field
            label="Инструкция для голоса (preprocessing prompt)"
            help="Текст-инструкция для модели перед основным текстом. Влияет на интонацию, паузы, стиль чтения.">
            <textarea value={settings.tts_preprocessing_prompt}
              onChange={e => update('tts_preprocessing_prompt', e.target.value)}
              rows={3} className={`${inputCls} text-sm resize-y`} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Голос" help="Имя голоса ElevenLabs">
              <select value={settings.tts_voice} onChange={e => update('tts_voice', e.target.value)} className={selectCls}>
                {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Язык">
              <select value={settings.tts_language_code} onChange={e => update('tts_language_code', e.target.value)} className={selectCls}>
                {TTS_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </Field>
          </div>
          <SliderField label="Stability" value={settings.tts_stability} min={0} max={1} step={0.05}
            help="0 — максимальная эмоциональность, 1 — монотонно и стабильно. Для детских сказок рекомендуется 0.5–0.7."
            onChange={v => update('tts_stability', v)} />
          <SliderField label="Similarity Boost" value={settings.tts_similarity_boost} min={0} max={1} step={0.05}
            help="Насколько точно воспроизводится оригинальный голос. Рекомендуется 0.7–0.85."
            onChange={v => update('tts_similarity_boost', v)} />
          <SliderField label="Style" value={settings.tts_style} min={0} max={1} step={0.05}
            help="Выразительность и стилизация. Выше — эмоциональнее, но медленнее генерация. Рекомендуется 0.1–0.3."
            onChange={v => update('tts_style', v)} />
          <SliderField label="Speed" value={settings.tts_speed} min={0.5} max={2.0} step={0.05}
            help="Скорость речи. 1.0 = нормальная, 0.9–0.95 = чуть медленнее (хорошо для детей)."
            onChange={v => update('tts_speed', v)} />
        </Section>

        {/* Промпт иллюстрации */}
        <Section icon="🎨" title="Промпт иллюстрации (будущая функция)">
          <Field
            label="Шаблон промпта для генерации изображений"
            help="Используется при генерации иллюстраций к сказке через DALL-E или Stable Diffusion. Переменные: {story_preview} — первые 300 символов сказки, {characters} — список персонажей.">
            <textarea value={settings.illustration_prompt_template}
              onChange={e => update('illustration_prompt_template', e.target.value)}
              rows={5} className={`${inputCls} text-sm resize-y font-mono`} />
          </Field>
          <VarBadges vars={['{story_preview}', '{characters}']} />
          <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-3">
            <p className="text-xs text-yellow-600">⚠️ Функция пока не активирована. Промпт сохранится и будет использован при включении генерации иллюстраций.</p>
          </div>
        </Section>

        {/* Стоимость */}
        <Section icon="💰" title="Стоимость генерации (себестоимость)">
          <p className="text-sm text-gray-500 -mt-2">Укажите реальную себестоимость каждого типа генерации для отслеживания затрат в дашборде.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Стоимость сказки" help="Цена генерации текста (AI)">
              <input type="number" value={settings.cost_per_story} min={0} step={0.001}
                onChange={e => update('cost_per_story', Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Стоимость TTS" help="Цена генерации озвучки">
              <input type="number" value={settings.cost_per_tts} min={0} step={0.001}
                onChange={e => update('cost_per_tts', Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Стоимость иллюстрации" help="Цена генерации картинки">
              <input type="number" value={settings.cost_per_illustration} min={0} step={0.001}
                onChange={e => update('cost_per_illustration', Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Валюта">
              <select value={settings.cost_currency} onChange={e => update('cost_currency', e.target.value)} className={selectCls}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Лимиты */}
        <Section icon="🛡️" title="Защита и лимиты">
          <Field label="Rate limit (запросов в час с одного IP)"
            help="Максимальное количество сказок, которые один пользователь может создать за час">
            <input type="number" value={settings.rate_limit_per_hour} min={1} max={100}
              onChange={e => update('rate_limit_per_hour', Number(e.target.value))} className={inputCls} />
          </Field>
        </Section>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 text-lg">
            {saving ? 'Сохранение...' : '💾 Сохранить все настройки'}
          </button>
        </div>
      </div>
    </div>
  );
}