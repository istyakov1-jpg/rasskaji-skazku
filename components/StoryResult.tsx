'use client';

import { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import ShareButtons from './ShareButtons';
import IllustrationBlock from './IllustrationBlock';

interface StoryResultProps {
  slug: string;
  childName: string;
  characters: string[];
  moral: string;
  storyText: string;
  onCreateNew: () => void;
  initialAudioUrl?: string | null;
  initialIllustrationUrl?: string | null;
}

type TTSState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; audioUrl: string }
  | { status: 'error'; message: string };

export default function StoryResult({
  slug, childName, characters, moral, storyText, onCreateNew,
  initialAudioUrl, initialIllustrationUrl,
}: StoryResultProps) {
  const [ttsState, setTTSState] = useState<TTSState>(
    initialAudioUrl ? { status: 'ready', audioUrl: initialAudioUrl } : { status: 'idle' }
  );

  const handleRequestTTS = async () => {
    setTTSState({ status: 'loading' });
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, storyText }),
      });
      const data = await res.json();
      if (!res.ok || !data.audioUrl) throw new Error(data.error || 'Ошибка');
      setTTSState({ status: 'ready', audioUrl: data.audioUrl });
    } catch (err) {
      setTTSState({ status: 'error', message: err instanceof Error ? err.message : 'Ошибка озвучки' });
    }
  };

  const paragraphs = storyText.split(/\n\n+/).filter(p => p.trim()).map(p => p.replace(/\n/g, ' '));

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="text-center">
        <div className="text-5xl mb-3">📖</div>
        <h1 className="font-serif text-3xl md:text-4xl text-fairy-purple-700 mb-2">
          Сказка про {childName}
        </h1>
        <div className="flex flex-wrap justify-center gap-2 text-sm text-fairy-purple-400">
          <span className="bg-fairy-purple-50 px-3 py-1 rounded-full">{characters.join(' · ')}</span>
          <span className="bg-fairy-gold-100 text-fairy-gold-700 px-3 py-1 rounded-full">✨ {moral}</span>
        </div>
      </div>

      {/* Иллюстрация — показываем только если готова */}
      {initialIllustrationUrl && (
        <IllustrationBlock imageUrl={initialIllustrationUrl} />
      )}

      <div className="fairy-card">
        <div className="story-text">
          {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
        </div>
        <div className="mt-6 pt-4 border-t border-fairy-purple-100 text-center">
          <p className="text-xs text-fairy-purple-300">
            Создано в сервисе{' '}
            <a href="/" className="text-fairy-purple-400 hover:text-fairy-purple-600 font-semibold">
              Расскажи Сказку
            </a>
          </p>
        </div>
      </div>

      <div>
        {ttsState.status === 'idle' && (
          <button onClick={handleRequestTTS} className="w-full btn-magic flex items-center justify-center gap-3 text-lg">
            <span>🎙️</span>Послушать сказку
          </button>
        )}
        {ttsState.status === 'loading' && (
          <div className="fairy-card text-center py-8">
            <div className="flex justify-center gap-1 mb-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-fairy-purple-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="text-fairy-purple-600 font-semibold text-lg mb-1">🎙️ Генерируем озвучку...</p>
            <p className="text-fairy-purple-400 text-sm">Подождите ~60 секунд</p>
          </div>
        )}
        {ttsState.status === 'ready' && <AudioPlayer src={ttsState.audioUrl} />}
        {ttsState.status === 'error' && (
          <div className="fairy-card text-center">
            <p className="text-red-400 mb-3 text-sm">⚠️ {ttsState.message}</p>
            <button onClick={handleRequestTTS} className="btn-secondary text-sm">Попробовать снова</button>
          </div>
        )}
      </div>

      <ShareButtons slug={slug} childName={childName} />

      <div className="text-center pb-8">
        <button onClick={onCreateNew} className="btn-secondary flex items-center gap-2 mx-auto">
          <span>✨</span>Создать ещё одну сказку
        </button>
      </div>
    </div>
  );
}