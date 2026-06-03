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

// ─── Декоративный разделитель ─────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-fairy-purple-200" />
      <span className="text-fairy-gold-500 text-lg">✦</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-fairy-purple-200" />
    </div>
  );
}

// ─── Прогресс по сценам ───────────────────────────────────
function SceneProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`transition-all duration-300 rounded-full ${
          i < current ? 'w-2 h-2 bg-fairy-purple-400' :
          i === current ? 'w-2.5 h-2.5 bg-fairy-purple-600 ring-2 ring-fairy-purple-300' :
          'w-2 h-2 bg-fairy-purple-100'
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

  // Трекинг активной сцены при скролле
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
      { threshold: 0.5 }
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
      setTTSState({ status: 'error', message: err instanceof Error ? err.message : 'Ошибка озвучки' });
    }
  };

  return (
    <div className="max-w-lg mx-auto" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FDFAFF 100%)' }}>

      {/* ══════════════════════════════════════════
          БЛОК 1: HERO ОБЛОЖКА
      ══════════════════════════════════════════ */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] overflow-hidden">
        {/* Иллюстрация или градиент */}
        {initialIllustrationUrl ? (
          <Image src={initialIllustrationUrl} alt={`Сказка про ${childName}`}
            fill className="object-cover" unoptimized priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-fairy-purple-400 via-fairy-pink-400 to-fairy-gold-300" />
        )}

        {/* Тёмный градиент снизу для читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Бейдж вверху */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
            ✨ Персональная сказка
          </div>
        </div>

        {/* Текст поверх */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-white/70 text-sm mb-1 font-medium tracking-wide uppercase">
            Создано специально для
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold leading-tight mb-2">
            Сказка про {childName}
          </h1>
          <p className="text-white/60 text-sm">{moral}</p>

          {/* Бейджи */}
          <div className="flex gap-2 flex-wrap mt-4">
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

      {/* ══════════════════════════════════════════
          Если иллюстрация ещё генерируется — показываем под hero
      ══════════════════════════════════════════ */}
      {!initialIllustrationUrl && (
        <div className="px-4 -mt-2 pb-4">
          <IllustrationBlock slug={slug} storyText={storyText} characters={characters} initialImageUrl={null} />
        </div>
      )}

      {/* Основной контент */}
      <div className="px-4 pb-10 flex flex-col gap-8 pt-6">

        {/* ══════════════════════════════════════════
            БЛОК 2: АУДИОПЛЕЕР
        ══════════════════════════════════════════ */}
        <section>
          {ttsState.status === 'idle' && (
            <button onClick={handleRequestTTS}
              className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-6 text-left shadow-fairy-lg group">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="#7C5CBF" className="w-7 h-7 ml-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-serif text-lg font-semibold">Послушать сказку</p>
                  <p className="text-white/60 text-sm mt-0.5">Нажмите чтобы включить озвучку</p>
                </div>
              </div>
              <div className="flex gap-1.5 mt-4 items-center h-6 opacity-40">
                {Array.from({length: 24}, (_, i) => (
                  <div key={i} className="flex-1 rounded-full bg-white"
                    style={{ height: `${30 + Math.sin(i * 0.8) * 20 + Math.sin(i * 1.5) * 15}%` }} />
                ))}
              </div>
            </button>
          )}
          {ttsState.status === 'loading' && (
            <div className="rounded-3xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-6 text-center">
              <div className="flex justify-center gap-1 mb-3">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <p className="text-white font-medium">Готовим озвучку...</p>
              <p className="text-white/50 text-sm mt-1">~60 секунд</p>
            </div>
          )}
          {ttsState.status === 'ready' && (
            <AudioPlayer src={ttsState.audioUrl} title={`Сказка про ${childName}`} />
          )}
          {ttsState.status === 'error' && (
            <div className="rounded-3xl bg-fairy-purple-50 border border-fairy-purple-100 p-5 text-center">
              <p className="text-fairy-purple-400 text-sm mb-3">Не удалось загрузить озвучку</p>
              <button onClick={handleRequestTTS} className="btn-secondary text-sm">Попробовать снова</button>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            БЛОК 3: ПОСВЯЩЕНИЕ
        ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-gold-100 to-fairy-gold-50 border border-fairy-gold-300/40 p-6">
          <div className="absolute top-3 right-4 text-4xl opacity-20 select-none">📜</div>
          <p className="text-fairy-gold-700 text-xs font-semibold uppercase tracking-widest mb-3">
            Посвящение
          </p>
          <p className="font-serif text-xl text-fairy-purple-800 leading-relaxed mb-3">
            Дорогой {childName},
          </p>
          <p className="text-fairy-purple-600 leading-relaxed text-sm">
            {dedication}
          </p>
          <Divider />
          <p className="text-fairy-purple-400 text-xs text-right italic">
            — Твоя волшебная книга
          </p>
        </section>

        {/* ══════════════════════════════════════════
            БЛОК 4: ПЕРСОНАЖИ
        ══════════════════════════════════════════ */}
        <section>
          <h2 className="font-serif text-xl text-fairy-purple-700 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎭</span> Герои истории
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {characterCards.map((char, i) => (
              <div key={i}
                className="bg-white rounded-2xl p-4 shadow-fairy border border-fairy-purple-50 flex flex-col items-center gap-2 text-center">
                <div className="text-4xl">{char.emoji}</div>
                <div>
                  <p className="font-semibold text-fairy-purple-800 text-sm">{char.name}</p>
                  <p className="text-fairy-purple-400 text-xs mt-0.5">{char.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            БЛОК 5 + 6: ИСТОРИЯ ПО СЦЕНАМ + ПРОГРЕСС
        ══════════════════════════════════════════ */}
        <section>
          <h2 className="font-serif text-xl text-fairy-purple-700 mb-6 flex items-center gap-2">
            <span className="text-2xl">📖</span> История
          </h2>

          <div className="flex gap-4">
            {/* Вертикальный прогресс */}
            <div className="flex flex-col items-center pt-3 flex-shrink-0">
              <SceneProgress total={scenes.length} current={activeScene} />
            </div>

            {/* Сцены */}
            <div className="flex-1 flex flex-col gap-10">
              {scenes.map((scene, i) => (
                <div key={i}
                  ref={el => { sceneRefs.current[i] = el; }}
                  className="relative">
                  {/* Номер и название сцены */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-fairy-purple-100 text-fairy-purple-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {scene.number}
                    </div>
                    <div>
                      <p className="text-xs text-fairy-purple-400 uppercase tracking-wider">Сцена {scene.number}</p>
                      <h3 className="font-serif text-lg text-fairy-purple-800">{scene.title}</h3>
                    </div>
                  </div>

                  {/* Текст сцены */}
                  <div className="space-y-3 pl-11">
                    {scene.paragraphs.map((para, j) => (
                      <p key={j}
                        className={`leading-relaxed text-fairy-purple-700 ${
                          j === 0 ? 'first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-fairy-purple-500 first-letter:float-left first-letter:mr-1 first-letter:leading-none' : ''
                        }`}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Разделитель между сценами */}
                  {i < scenes.length - 1 && (
                    <div className="mt-8 pl-11">
                      <Divider />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            БЛОК 7: ФИНАЛ
        ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-600 to-fairy-purple-800 p-8 text-center">
          <div className="absolute inset-0 opacity-10">
            {['✨','⭐','🌟','💫'].map((s, i) => (
              <span key={i} className="absolute text-3xl"
                style={{ top: `${[15,70,40,80][i]}%`, left: `${[10,20,80,70][i]}%` }}>{s}</span>
            ))}
          </div>
          <div className="relative z-10">
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Конец истории</p>
            <h3 className="font-serif text-2xl text-white font-bold mb-4">
              Вот и вся сказка!
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Спасибо, что отправились в это волшебное приключение вместе с {childName}.
              Пусть сказки всегда живут в вашем сердце! 💜
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            БЛОК 8: CTA
        ══════════════════════════════════════════ */}
        <section className="flex flex-col gap-3">
          <ShareButtons slug={slug} childName={childName} />

          <button onClick={onCreateNew}
            className="w-full btn-magic py-4 text-lg flex items-center justify-center gap-2">
            <span>✨</span>Создать новую сказку
          </button>

          {/* Заглушка печатной книги */}
          <button disabled
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-fairy-purple-200 text-fairy-purple-300 text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed">
            📚 Заказать печатную книгу — скоро
          </button>
        </section>

        {/* Водяной знак */}
        <div className="text-center">
          <p className="text-xs text-fairy-purple-300">
            Создано в сервисе{' '}
            <a href="/" className="text-fairy-purple-400 hover:text-fairy-purple-600 font-semibold underline-offset-2 hover:underline">
              Расскажи Сказку
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}