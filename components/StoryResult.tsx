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
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-fairy-purple-200" />
      <span className="text-fairy-gold-500">✦</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-fairy-purple-200" />
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
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const scenes = splitIntoScenes(storyText);
  const characterCards = buildCharacterCards(characters, childName);
  const dedication = buildDedication(childName, moral);

  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = sceneRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveScene(idx);
          }
        });
      },
      { root: panel, threshold: 0.3 }
    );
    sceneRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [scenes.length]);

  const scrollToScene = (i: number) => {
    sceneRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
    <>
      {/* ════════════════════════════════════════════════════
          MOBILE (< md): одна колонка, обычный скролл
      ════════════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col" style={{ background: 'linear-gradient(180deg,#FFF8F0 0%,#FDFAFF 100%)' }}>
        {/* Hero */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          {initialIllustrationUrl
            ? <Image src={initialIllustrationUrl} alt="" fill className="object-cover" unoptimized priority />
            : <div className="absolute inset-0 bg-gradient-to-br from-fairy-purple-400 via-fairy-pink-400 to-fairy-gold-300" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Создано для</p>
            <h1 className="font-serif text-2xl text-white font-bold leading-tight">{childName}</h1>
            <p className="text-white/50 text-xs mt-1">{moral}</p>
            <div className="flex gap-1.5 flex-wrap mt-3">
              {[`📖 ${scenes.length} сцены`, '🎨 Иллюстрация', '🎧 Озвучка'].map(b => (
                <span key={b} className="bg-white/15 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full border border-white/20">{b}</span>
              ))}
            </div>
          </div>
        </div>

        {!initialIllustrationUrl && (
          <div className="px-4 pt-4">
            <IllustrationBlock slug={slug} storyText={storyText} characters={characters} initialImageUrl={null} />
          </div>
        )}

        <div className="px-4 pt-6 pb-12 flex flex-col gap-7">
          {/* Аудио */}
          <MobileAudio ttsState={ttsState} childName={childName} onRequest={handleRequestTTS} />

          {/* Посвящение */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fairy-gold-100 to-amber-50 border border-fairy-gold-300/40 p-5">
            <div className="absolute top-3 right-4 text-4xl opacity-10 select-none">📜</div>
            <p className="text-fairy-gold-700 text-xs font-semibold uppercase tracking-widest mb-2">Посвящение</p>
            <p className="font-serif text-lg text-fairy-purple-800 mb-2">Дорогой {childName},</p>
            <p className="text-fairy-purple-600 text-sm leading-relaxed">{dedication}</p>
          </div>

          {/* Персонажи */}
          <div>
            <h2 className="font-serif text-lg text-fairy-purple-700 mb-3">🎭 Герои истории</h2>
            <div className="grid grid-cols-2 gap-2">
              {characterCards.map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-3.5 shadow-fairy border border-fairy-purple-50 flex items-center gap-3">
                  <span className="text-3xl">{c.emoji}</span>
                  <div>
                    <p className="font-semibold text-fairy-purple-800 text-sm">{c.name}</p>
                    <p className="text-fairy-purple-400 text-xs">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Сцены */}
          <div className="flex flex-col gap-8">
            {scenes.map((scene, i) => (
              <div key={i} ref={el => { sceneRefs.current[i] = el; }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-fairy-purple-100 text-fairy-purple-600 text-xs font-bold flex items-center justify-center">{scene.number}</div>
                  <div>
                    <p className="text-xs text-fairy-purple-400 uppercase tracking-wide">Сцена {scene.number}</p>
                    <h3 className="font-serif text-base text-fairy-purple-800">{scene.title}</h3>
                  </div>
                </div>
                <div className="space-y-3 pl-11">
                  {scene.paragraphs.map((para, j) => (
                    <p key={j} className={`text-fairy-purple-700 text-sm leading-relaxed ${
                      j === 0 ? 'first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-fairy-purple-500 first-letter:float-left first-letter:mr-1 first-letter:leading-none' : ''
                    }`}>{para}</p>
                  ))}
                </div>
                {i < scenes.length - 1 && <div className="mt-6 pl-11"><Divider /></div>}
              </div>
            ))}
          </div>

          {/* Финал */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-600 to-fairy-purple-900 p-7 text-center">
            <p className="text-5xl mb-3">🌟</p>
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Конец истории</p>
            <h3 className="font-serif text-xl text-white font-bold mb-3">Вот и вся сказка!</h3>
            <p className="text-white/75 text-sm leading-relaxed">
              Спасибо, что отправились в это приключение вместе с {childName}. 💜
            </p>
          </div>

          <ShareButtons slug={slug} childName={childName} />
          <button onClick={onCreateNew} className="btn-magic py-4 text-base flex items-center justify-center gap-2">
            <span>✨</span>Создать новую сказку
          </button>
          <button disabled className="py-3 rounded-2xl border-2 border-dashed border-fairy-purple-200 text-fairy-purple-300 text-sm flex items-center justify-center gap-2 cursor-not-allowed">
            📚 Печатная книга — скоро
          </button>
          <p className="text-center text-xs text-fairy-purple-300">
            Создано в сервисе <a href="/" className="text-fairy-purple-400 font-semibold">Расскажи Сказку</a>
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          DESKTOP (≥ md): левая панель фиксирована, правая скроллится
      ════════════════════════════════════════════════════ */}
      <div className="hidden md:flex h-screen overflow-hidden" style={{ background: '#FDFAFF' }}>

        {/* ── ЛЕВАЯ ПАНЕЛЬ: обложка + управление (40%) ── */}
        <div className="w-[42%] xl:w-[38%] h-full flex-shrink-0 relative flex flex-col overflow-hidden">
          {/* Иллюстрация — на весь фон */}
          <div className="absolute inset-0">
            {initialIllustrationUrl
              ? <Image src={initialIllustrationUrl} alt="" fill className="object-cover" unoptimized priority />
              : <div className="absolute inset-0 bg-gradient-to-br from-fairy-purple-500 via-fairy-pink-400 to-fairy-gold-300" />
            }
            {/* Тёмный оверлей снизу */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          </div>

          {/* Контент поверх */}
          <div className="relative z-10 flex flex-col h-full p-8 xl:p-10">
            {/* Верх: бейдж */}
            <div>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20 font-medium">
                ✨ Персональная сказка
              </span>
            </div>

            {/* Середина: отступ */}
            <div className="flex-1" />

            {/* Низ: title + audio + chars */}
            <div className="flex flex-col gap-5">
              {/* Заголовок */}
              <div>
                <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Создано специально для</p>
                <h1 className="font-serif text-3xl xl:text-4xl text-white font-bold leading-tight mb-1">
                  {childName}
                </h1>
                <p className="text-white/50 text-sm">{moral}</p>
              </div>

              {/* Бейджи */}
              <div className="flex gap-2 flex-wrap">
                {[`📖 ${scenes.length} сцены`, '🎨 Иллюстрация', '🎧 Озвучка'].map(b => (
                  <span key={b} className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20">{b}</span>
                ))}
              </div>

              {/* Аудиоплеер */}
              <div>
                {ttsState.status === 'idle' && (
                  <button onClick={handleRequestTTS}
                    className="w-full flex items-center gap-4 bg-white/15 backdrop-blur-md hover:bg-white/25 transition-colors rounded-2xl p-4 border border-white/20 group">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                      <svg viewBox="0 0 24 24" fill="#7C5CBF" className="w-5 h-5 ml-0.5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">Послушать сказку</p>
                      <p className="text-white/50 text-xs">Нажмите для озвучки</p>
                    </div>
                  </button>
                )}
                {ttsState.status === 'loading' && (
                  <div className="w-full flex items-center gap-4 bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay:`${i*0.2}s` }} />)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Готовим озвучку...</p>
                      <p className="text-white/50 text-xs">~60 секунд</p>
                    </div>
                  </div>
                )}
                {ttsState.status === 'ready' && (
                  <AudioPlayer src={ttsState.audioUrl} title={`Сказка про ${childName}`} />
                )}
                {ttsState.status === 'error' && (
                  <button onClick={handleRequestTTS}
                    className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl p-4 border border-white/20">
                    <span className="text-xl">🔄</span>
                    <span className="text-white/80 text-sm">Попробовать снова</span>
                  </button>
                )}
              </div>

              {/* Персонажи */}
              <div className="grid grid-cols-2 gap-2">
                {characterCards.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <span className="text-2xl">{c.emoji}</span>
                    <div>
                      <p className="text-white text-xs font-semibold">{c.name}</p>
                      <p className="text-white/50 text-xs">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Если иллюстрация ещё генерируется */}
          {!initialIllustrationUrl && (
            <div className="absolute inset-0 z-20 p-6 flex items-end">
              <div className="w-full">
                <IllustrationBlock slug={slug} storyText={storyText} characters={characters} initialImageUrl={null} />
              </div>
            </div>
          )}
        </div>

        {/* ── ПРАВАЯ ПАНЕЛЬ: история (скроллится) ── */}
        <div ref={rightPanelRef} className="flex-1 h-full overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 xl:px-12 py-10">

            {/* Посвящение */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-gold-100 to-amber-50 border border-fairy-gold-300/40 p-8 mb-10">
              <div className="absolute top-4 right-6 text-5xl opacity-10 select-none">📜</div>
              <p className="text-fairy-gold-700 text-xs font-semibold uppercase tracking-widest mb-3">Посвящение</p>
              <p className="font-serif text-2xl text-fairy-purple-800 leading-relaxed mb-3">Дорогой {childName},</p>
              <p className="text-fairy-purple-600 leading-relaxed">{dedication}</p>
              <div className="mt-4"><Divider /></div>
              <p className="text-fairy-purple-400 text-xs text-right italic mt-3">— Твоя волшебная книга</p>
            </div>

            {/* Навигация по сценам */}
            <div className="flex gap-2 flex-wrap mb-8">
              {scenes.map((scene, i) => (
                <button key={i} onClick={() => scrollToScene(i)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    i === activeScene
                      ? 'bg-fairy-purple-600 text-white border-fairy-purple-600'
                      : 'border-fairy-purple-200 text-fairy-purple-400 hover:border-fairy-purple-400 hover:text-fairy-purple-600'
                  }`}>
                  {scene.number}. {scene.title}
                </button>
              ))}
            </div>

            {/* Сцены */}
            <div className="flex flex-col gap-14">
              {scenes.map((scene, i) => (
                <div key={i} ref={el => { sceneRefs.current[i] = el; }}
                  className="scroll-mt-8">
                  {/* Заголовок */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-fairy-purple-100 text-fairy-purple-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {scene.number}
                    </div>
                    <div>
                      <p className="text-xs text-fairy-purple-400 uppercase tracking-wider">Сцена {scene.number}</p>
                      <h3 className="font-serif text-xl text-fairy-purple-800">{scene.title}</h3>
                    </div>
                  </div>

                  {/* Параграфы */}
                  <div className="space-y-4 pl-14">
                    {scene.paragraphs.map((para, j) => (
                      <p key={j} className={`text-fairy-purple-700 leading-loose text-[1.05rem] ${
                        j === 0
                          ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-fairy-purple-500 first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:mt-1'
                          : ''
                      }`}>{para}</p>
                    ))}
                  </div>

                  {i < scenes.length - 1 && (
                    <div className="mt-10 pl-14"><Divider /></div>
                  )}
                </div>
              ))}
            </div>

            {/* Финал */}
            <div className="mt-14 relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-600 to-fairy-purple-900 p-10 text-center">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {['✨','⭐','🌟','💫','✦','🌙'].map((s, i) => (
                  <span key={i} className="absolute text-3xl opacity-10 select-none"
                    style={{ top:`${[10,65,35,80,20,55][i]}%`, left:`${[8,15,78,68,90,45][i]}%` }}>{s}</span>
                ))}
              </div>
              <div className="relative z-10">
                <p className="text-6xl mb-4">🌟</p>
                <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Конец истории</p>
                <h3 className="font-serif text-3xl text-white font-bold mb-4">Вот и вся сказка!</h3>
                <p className="text-white/80 leading-relaxed max-w-md mx-auto">
                  Спасибо, что отправились в это волшебное приключение вместе с {childName}.
                  Пусть сказки всегда живут в вашем сердце! 💜
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-4">
              <ShareButtons slug={slug} childName={childName} />
              <div className="flex gap-3">
                <button onClick={onCreateNew}
                  className="flex-1 btn-magic py-4 text-base flex items-center justify-center gap-2">
                  <span>✨</span>Создать новую сказку
                </button>
                <button disabled
                  className="flex-1 py-4 rounded-2xl border-2 border-dashed border-fairy-purple-200 text-fairy-purple-300 text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                  📚 Печатная книга — скоро
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-fairy-purple-300 mt-8 mb-4">
              Создано в сервисе <a href="/" className="text-fairy-purple-400 font-semibold hover:text-fairy-purple-600">Расскажи Сказку</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Мобильный аудиоблок ──────────────────────────────────
function MobileAudio({ ttsState, childName, onRequest }: {
  ttsState: TTSState;
  childName: string;
  onRequest: () => void;
}) {
  if (ttsState.status === 'idle') {
    return (
      <button onClick={onRequest}
        className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-5 text-left shadow-fairy-lg group">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="#7C5CBF" className="w-6 h-6 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-serif text-lg font-semibold">Послушать сказку</p>
            <p className="text-white/60 text-xs mt-0.5">Нажмите для включения озвучки</p>
          </div>
        </div>
        <div className="flex gap-0.5 items-center h-5 opacity-30">
          {Array.from({length: 28}, (_, i) => (
            <div key={i} className="flex-1 rounded-full bg-white"
              style={{ height:`${35+Math.sin(i*.9)*25+Math.sin(i*1.7)*15}%` }} />
          ))}
        </div>
      </button>
    );
  }
  if (ttsState.status === 'loading') {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-5 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay:`${i*.2}s` }} />)}
        </div>
        <p className="text-white font-medium text-sm">Готовим озвучку...</p>
        <p className="text-white/50 text-xs mt-0.5">~60 секунд</p>
      </div>
    );
  }
  if (ttsState.status === 'ready') {
    return <AudioPlayer src={(ttsState as { status: 'ready'; audioUrl: string }).audioUrl} title={`Сказка про ${childName}`} />;
  }
  return (
    <div className="rounded-3xl bg-fairy-purple-50 border border-fairy-purple-100 p-4 text-center">
      <p className="text-fairy-purple-400 text-sm mb-2">Не удалось загрузить озвучку</p>
      <button onClick={onRequest} className="btn-secondary text-sm">Попробовать снова</button>
    </div>
  );
}