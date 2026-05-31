'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  slug: string;
  storyText: string;
  characters: string[];
  initialImageUrl?: string | null;
}

type State =
  | { status: 'loading' }
  | { status: 'done'; imageUrl: string }
  | { status: 'error' };

export default function IllustrationBlock({ slug, storyText, characters, initialImageUrl }: Props) {
  const [state, setState] = useState<State>(
    initialImageUrl ? { status: 'done', imageUrl: initialImageUrl } : { status: 'loading' }
  );

  const generate = async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, storyText, characters }),
      });
      const data = await res.json();
      if (!res.ok || !data.imageUrl) throw new Error(data.error || 'Ошибка');
      setState({ status: 'done', imageUrl: data.imageUrl });
    } catch (e) {
      console.error('[IllustrationBlock] error:', e);
      setState({ status: 'error' });
    }
  };

  useEffect(() => {
    if (!initialImageUrl) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="fairy-card overflow-hidden p-0">
        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-fairy-purple-100 via-fairy-pink-100 to-fairy-gold-100">
          {/* Шиммер */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-5xl" style={{ animation: 'float 2s ease-in-out infinite' }}>🎨</div>
            <div className="text-center">
              <p className="text-fairy-purple-600 font-serif text-lg">Рисуем иллюстрацию...</p>
              <p className="text-fairy-purple-400 text-xs mt-1">Это займёт около минуты</p>
            </div>
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-fairy-purple-300 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="fairy-card text-center py-6">
        <p className="text-fairy-purple-300 text-sm mb-3">Не удалось нарисовать иллюстрацию</p>
        <button onClick={generate} className="btn-secondary text-sm">🔄 Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="fairy-card overflow-hidden p-0">
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-fairy-lg">
        <Image src={state.imageUrl} alt="Иллюстрация к сказке"
          fill className="object-cover" unoptimized priority />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </div>
  );
}