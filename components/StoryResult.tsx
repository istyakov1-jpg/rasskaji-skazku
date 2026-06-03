'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import AudioPlayer from './AudioPlayer';
import ShareButtons from './ShareButtons';
import IllustrationBlock from './IllustrationBlock';
import { splitIntoScenes, buildCharacterCards, buildDedication } from '@/lib/storyUtils';

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

function Divider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-fairy-purple-200" />
      <span className="text-fairy-gold-500 text-lg">✦</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-fairy-purple-200" />
    </div>
  );
}

function SceneProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex md:flex-col items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`transition-all duration-300 rounded-full ${
          i < current
            ? 'w-2 h-2 bg-fairy-purple-400'
            : i === current
            ? 'w-3 h-3 bg-fairy-purple-600 ring-2 ring-fairy-purple-200'
            : 'w-2 h-2 bg-fairy-purple-100'
        }`} />
      ))}
    </div>
  );
}

export default function StoryResult({
  slug, childName, characters, moral, storyText, onCreateNew,
  initialAudioUrl, initialIllustrationUrl,
}: StoryResultProps) {
  const [ttsState, setTTSState] = useState<TTSState>(
    initialAudioUrl ? { status: 'ready', audioUrl: initialAudioUrl } : { status: 'idle' }
  );
  const [activeScene, setActiveScene] = useState(0);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scenes = splitIntoScenes(storyText);
  const characterCards = buildCharacterCards(characters, childName);
  const dedication = buildDedication(childName, moral);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = sceneRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveScene(idx);
          }
        });
      },
      { threshold: 0.4 }
    );
    sceneRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [scenes.length]);

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
      setTTSState({ status: 'error', message: err instanceof Error ? err.message : 'Ошибка' });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FDFAFF 100%)' }}>

      {/* ══════════════════════════════════════
          HERO — полная ширина
      ══════════════════════════════════════ */}
      <div className="relative w-full h-[60vw] max-h-[520px] min-h-[280px] overflow-hidden">
        {initialIllustrationUrl ? (
          <Image src={initialIllustrationUrl} alt={`Сказка про ${childName}`}
            fill className="object-cover" unoptimized priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-fairy-purple-400 via-fairy-pink-400 to-fairy-gold-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Бейдж */}
        <div className="absolute top-4 left-4 md:top-6 md:left-8">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium border border-white/20">
            ✨ Персональная сказка
          </span>
        </div>

        {/* Заголовок */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10 max-w-5xl mx-auto">
          <p className="text-white/70 text-xs md:text-sm mb-1 font-medium tracking-widest uppercase">
            Создано специально для
          </p>
          <h1 className="font-serif text-3xl md:text-5xl text-white font-bold leading-tight mb-2 md:mb-3">
            Сказка про {childName}
          </h1>
          <p className="text-white/60 text-sm md:text-base mb-3 md:mb-4">{moral}</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { icon: '📖', label: `${scenes.length} сцены` },
              { icon: '🎨', label: 'Иллюстрация' },
              { icon: '🎧', label: 'Озвучка' },
            ].map(b => (
              <span key={b.label}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Иллюстрация если ещё генерируется */}
      {!initialIllustrationUrl && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <IllustrationBlock slug={slug} storyText={storyText} characters={characters} initialImageUrl={null} />
        </div>
      )}

      {/* ══════════════════════════════════════
          ОСНОВНОЙ КОНТЕНТ
          desktop: 2 колонки — текст + сайдбар
          mobile: 1 колонка
      ══════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:gap-10 md:items-start">

          {/* ── ЛЕВАЯ КОЛОНКА: Основной контент ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* Посвящение */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-gold-100 to-amber-50 border border-fairy-gold-300/40 p-6 md:p-8">
              <div className="absolute top-4 right-5 text-5xl opacity-10 select-none">📜</div>
              <p className="text-fairy-gold-700 text-xs font-semibold uppercase tracking-widest mb-3">Посвящение</p>
              <p className="font-serif text-xl md:text-2xl text-fairy-purple-800 leading-relaxed mb-3">
                Дорогой {childName},
              </p>
              <p className="text-fairy-purple-600 leading-relaxed text-sm md:text-base">{dedication}</p>
              <Divider />
              <p className="text-fairy-purple-400 text-xs text-right italic">— Твоя волшебная книга</p>
            </section>

            {/* История по сценам */}
            <section>
              <h2 className="font-serif text-2xl text-fairy-purple-700 mb-6 flex items-center gap-2">
                <span>📖</span> История
              </h2>

              <div className="flex gap-4 md:gap-6">
                {/* Прогресс — вертикальный */}
                <div className="flex-shrink-0 flex flex-col items-center pt-4 gap-0">
                  <SceneProgress total={scenes.length} current={activeScene} />
                </div>

                {/* Сцены */}
                <div className="flex-1 min-w-0 flex flex-col gap-10 md:gap-14">
                  {scenes.map((scene, i) => (
                    <div key={i} ref={el => { sceneRefs.current[i] = el; }}>
                      {/* Заголовок сцены */}
                      <div className="flex items-center gap-3 mb-4 md:mb-5">
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-fairy-purple-100 text-fairy-purple-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {scene.number}
                        </div>
                        <div>
                          <p className="text-xs text-fairy-purple-400 uppercase tracking-wider">Сцена {scene.number}</p>
                          <h3 className="font-serif text-lg md:text-xl text-fairy-purple-800">{scene.title}</h3>
                        </div>
                      </div>

                      {/* Параграфы */}
                      <div className="space-y-3 md:space-y-4 pl-11 md:pl-12">
                        {scene.paragraphs.map((para, j) => (
                          <p key={j} className={`leading-relaxed md:leading-loose text-fairy-purple-700 text-sm md:text-base ${
                            j === 0
                              ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-fairy-purple-500 first-letter:float-left first-letter:mr-1.5 first-letter:leading-none first-letter:mt-1'
                              : ''
                          }`}>
                            {para}
                          </p>
                        ))}
                      </div>

                      {i < scenes.length - 1 && (
                        <div className="mt-8 pl-11 md:pl-12">
                          <Divider />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* ── ПРАВАЯ КОЛОНКА: Сайдбар ── */}
          <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-5 md:sticky md:top-6">

            {/* Аудиоплеер */}
            <div>
              {ttsState.status === 'idle' && (
                <button onClick={handleRequestTTS}
                  className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-5 text-left shadow-fairy-lg group">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="#7C5CBF" className="w-6 h-6 ml-0.5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-serif text-base font-semibold">Послушать сказку</p>
                      <p className="text-white/60 text-xs mt-0.5">Нажмите для озвучки</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 items-center h-5 opacity-30">
                    {Array.from({length: 28}, (_, i) => (
                      <div key={i} className="flex-1 rounded-full bg-white"
                        style={{ height: `${35 + Math.sin(i * 0.9) * 25 + Math.sin(i * 1.7) * 15}%` }} />
                    ))}
                  </div>
                </button>
              )}
              {ttsState.status === 'loading' && (
                <div className="rounded-3xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-5 text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <p className="text-white text-sm font-medium">Готовим озвучку...</p>
                  <p className="text-white/50 text-xs mt-0.5">~60 секунд</p>
                </div>
              )}
              {ttsState.status === 'ready' && (
                <AudioPlayer src={ttsState.audioUrl} title={`Сказка про ${childName}`} />
              )}
              {ttsState.status === 'error' && (
                <div className="rounded-3xl bg-fairy-purple-50 border border-fairy-purple-100 p-4 text-center">
                  <p className="text-fairy-purple-400 text-xs mb-2">Не удалось загрузить озвучку</p>
                  <button onClick={handleRequestTTS} className="btn-secondary text-xs">Попробовать снова</button>
                </div>
              )}
            </div>

            {/* Персонажи */}
            <div className="bg-white rounded-3xl p-5 shadow-fairy border border-fairy-purple-50">
              <h3 className="font-serif text-base text-fairy-purple-700 mb-4 flex items-center gap-2">
                <span>🎭</span> Герои истории
              </h3>
              <div className="flex flex-col gap-3">
                {characterCards.map((char, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-3xl flex-shrink-0">{char.emoji}</div>
                    <div>
                      <p className="font-semibold text-fairy-purple-800 text-sm">{char.name}</p>
                      <p className="text-fairy-purple-400 text-xs">{char.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Прогресс сцен — только на desktop */}
            <div className="hidden md:block bg-white rounded-3xl p-5 shadow-fairy border border-fairy-purple-50">
              <h3 className="font-serif text-base text-fairy-purple-700 mb-4">📚 Прогресс</h3>
              <div className="flex flex-col gap-2.5">
                {scenes.map((scene, i) => (
                  <button key={i}
                    onClick={() => sceneRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    className={`flex items-center gap-3 text-left transition-colors group ${
                      i === activeScene ? 'text-fairy-purple-700' : 'text-fairy-purple-400 hover:text-fairy-purple-600'
                    }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
                      i < activeScene ? 'bg-fairy-purple-400' :
                      i === activeScene ? 'bg-fairy-purple-600 w-2.5 h-2.5' :
                      'bg-fairy-purple-100 group-hover:bg-fairy-purple-300'
                    }`} />
                    <div>
                      <p className="text-xs font-medium">Сцена {scene.number}</p>
                      <p className="text-xs opacity-70">{scene.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Поделиться */}
            <ShareButtons slug={slug} childName={childName} />
          </div>
        </div>

        {/* ══════════════════════════════════════
            ФИНАЛ — полная ширина
        ══════════════════════════════════════ */}
        <section className="mt-12 md:mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-600 to-fairy-purple-900 p-8 md:p-12 text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {['✨','⭐','🌟','💫','✦','🌙'].map((s, i) => (
              <span key={i} className="absolute text-2xl md:text-3xl opacity-10 select-none"
                style={{ top:`${[10,65,35,80,20,55][i]}%`, left:`${[8,15,78,68,90,45][i]}%` }}>
                {s}
              </span>
            ))}
          </div>
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="text-5xl md:text-6xl mb-4">🌟</div>
            <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Конец истории</p>
            <h3 className="font-serif text-2xl md:text-3xl text-white font-bold mb-4">Вот и вся сказка!</h3>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              Спасибо, что отправились в это волшебное приключение вместе с {childName}.
              Пусть сказки всегда живут в вашем сердце! 💜
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <button onClick={onCreateNew}
            className="flex-1 btn-magic py-4 text-base flex items-center justify-center gap-2">
            <span>✨</span>Создать новую сказку
          </button>
          <button disabled
            className="flex-1 py-4 rounded-2xl border-2 border-dashed border-fairy-purple-200 text-fairy-purple-300 text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed">
            📚 Печатная книга — скоро
          </button>
        </div>

        {/* Водяной знак */}
        <div className="text-center mt-8 pb-4">
          <p className="text-xs text-fairy-purple-300">
            Создано в сервисе{' '}
            <a href="/" className="text-fairy-purple-400 hover:text-fairy-purple-600 font-semibold">
              Расскажи Сказку
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}