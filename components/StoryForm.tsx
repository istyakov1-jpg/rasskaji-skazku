'use client';

import { useState, useRef } from 'react';
import { CHARACTERS, MORALS } from '@/lib/constants';
import LoadingAnimation from './LoadingAnimation';
import StoryResult from './StoryResult';
import clsx from 'clsx';

type FormState = 'form' | 'loading' | 'result';

interface StoryData {
  slug: string;
  storyText: string;
  childName: string;
  characters: string[];
  moral: string;
  illustrationUrl: string | null;
}

export default function StoryForm() {
  const [formState, setFormState] = useState<FormState>('form');
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loadingStep, setLoadingStep] = useState<'story' | 'illustration'>('story');
  const [currentChildName, setCurrentChildName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [childName, setChildName] = useState('');
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [moral, setMoral] = useState('');
  const [wishes, setWishes] = useState('');

  const topRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const toggleCharacter = (charName: string) => {
    setSelectedChars(prev => {
      if (prev.includes(charName)) return prev.filter(c => c !== charName);
      if (prev.length >= 3) return [...prev.slice(1), charName];
      return [...prev, charName];
    });
  };

  const canSubmit = childName.trim().length >= 1 && selectedChars.length >= 2 && moral.length > 0;

  const pollIllustration = async (taskId: string, slug: string): Promise<string | null> => {
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const res = await fetch(
          `/api/illustration-status?taskId=${encodeURIComponent(taskId)}&slug=${encodeURIComponent(slug)}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        console.log(`[poll illus #${i + 1}] status=${data.status} url=${data.imageUrl ?? '—'}`);
        if (data.status === 'completed' && data.imageUrl) return data.imageUrl;
        if (data.status === 'failed') return null;
      } catch (e) {
        console.warn('[poll illus] fetch error:', e);
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const name = childName.trim();
    setError(null);
    setCurrentChildName(name);
    setLoadingStep('story');
    setFormState('loading');
    scrollToTop();

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName: name, characters: selectedChars, moral, wishes: wishes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при создании сказки');

      console.log('[generate] response:', { slug: data.slug, hasTaskId: !!data.illustrationTaskId });

      let illustrationUrl: string | null = null;
      if (data.illustrationTaskId) {
        setLoadingStep('illustration');
        illustrationUrl = await pollIllustration(data.illustrationTaskId, data.slug);
        console.log('[generate] illustration result:', illustrationUrl);
      }

      setStoryData({ slug: data.slug, storyText: data.storyText, childName: data.childName, characters: data.characters, moral: data.moral, illustrationUrl });
      setFormState('result');
      window.history.pushState({}, '', `/skazka/${data.slug}`);
      scrollToTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
      setFormState('form');
    }
  };

  const handleCreateNew = () => {
    setFormState('form');
    setStoryData(null);
    setError(null);
    setLoadingStep('story');
    window.history.pushState({}, '', '/');
    scrollToTop();
  };

  return (
    <div ref={topRef}>
      {formState === 'loading' && (
        <LoadingAnimation step={loadingStep} childName={currentChildName} />
      )}

      {formState === 'result' && storyData && (
        <StoryResult
          slug={storyData.slug}
          childName={storyData.childName}
          characters={storyData.characters}
          moral={storyData.moral}
          storyText={storyData.storyText}
          initialIllustrationUrl={storyData.illustrationUrl}
          onCreateNew={handleCreateNew}
        />
      )}

      {formState === 'form' && (
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          <div className="text-center">
            <h2 className="font-serif text-2xl text-fairy-purple-700 mb-1">Создайте свою сказку</h2>
            <p className="text-fairy-purple-400 text-sm">Заполните форму — и волшебство начнётся!</p>
          </div>

          <div className="fairy-card">
            <label className="block font-semibold text-fairy-purple-700 mb-2">
              👶 Имя ребёнка <span className="text-fairy-pink-500">*</span>
            </label>
            <input type="text" value={childName} onChange={e => setChildName(e.target.value)}
              placeholder="Например, Маша или Артём" maxLength={50}
              className="w-full px-4 py-3 rounded-2xl border-2 border-fairy-purple-100 focus:border-fairy-purple-300 focus:outline-none bg-white/80 text-fairy-purple-800 placeholder:text-fairy-purple-200 transition-colors" />
          </div>

          <div className="fairy-card">
            <label className="block font-semibold text-fairy-purple-700 mb-1">
              🎭 Персонажи сказки <span className="text-fairy-pink-500">*</span>
            </label>
            <p className="text-xs text-fairy-purple-400 mb-4">
              Выберите 2 или 3 персонажа
              {selectedChars.length > 0 && <span className="ml-2 font-semibold text-fairy-purple-600">({selectedChars.length} выбрано)</span>}
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {CHARACTERS.map(char => (
                <button key={char.id} type="button" onClick={() => toggleCharacter(char.name)}
                  className={clsx('character-card', selectedChars.includes(char.name) && 'selected')}>
                  <span className="text-3xl">{char.emoji}</span>
                  <span className="text-xs font-medium text-fairy-purple-600 leading-tight text-center">{char.name}</span>
                  {selectedChars.includes(char.name) && <span className="text-xs text-fairy-purple-400">#{selectedChars.indexOf(char.name) + 1}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="fairy-card">
            <label className="block font-semibold text-fairy-purple-700 mb-2">
              💫 Главная мысль сказки <span className="text-fairy-pink-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MORALS.map(m => (
                <button key={m} type="button" onClick={() => setMoral(m)}
                  className={clsx(
                    'text-left px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-sm font-medium',
                    moral === m ? 'border-fairy-purple-400 bg-fairy-purple-50 text-fairy-purple-700'
                      : 'border-fairy-purple-100 bg-white/60 text-fairy-purple-500 hover:border-fairy-purple-300 hover:bg-white'
                  )}>{m}</button>
              ))}
            </div>
          </div>

          <div className="fairy-card">
            <label className="block font-semibold text-fairy-purple-700 mb-2">
              🌈 Особые пожелания <span className="text-fairy-purple-300 font-normal text-sm">(необязательно)</span>
            </label>
            <textarea value={wishes} onChange={e => setWishes(e.target.value)}
              placeholder="Например: ребёнок боится темноты, хочет про море, любит кошек..."
              maxLength={200} rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-fairy-purple-100 focus:border-fairy-purple-300 focus:outline-none bg-white/80 text-fairy-purple-800 placeholder:text-fairy-purple-200 transition-colors resize-none" />
            <p className="text-right text-xs text-fairy-purple-300 mt-1">{wishes.length}/200</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">⚠️ {error}</div>
          )}

          <button onClick={handleSubmit} disabled={!canSubmit}
            className="btn-magic text-lg py-4 flex items-center justify-center gap-3">
            <span>🪄</span>Создать сказку<span>✨</span>
          </button>

          <p className="text-center text-xs text-fairy-purple-300">Создание занимает ~1–2 минуты</p>
        </div>
      )}
    </div>
  );
}