'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AudioPlayer from './AudioPlayer';
import ShareButtons from './ShareButtons';
import IllustrationBlock from './IllustrationBlock';
import { splitIntoScenes, buildCharacterCards, buildDedication } from '@/lib/storyUtils';

interface Props {
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
  | { status: 'error' };

// ─── Оценка времени чтения ────────────────────────────────
function readingTime(text: string): string {
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 120); // детское чтение ~120 слов/мин
  return `${minutes} мин чтения`;
}

export default function StoryResultV2({
  slug, childName, characters, moral, storyText, onCreateNew,
  initialAudioUrl, initialIllustrationUrl,
}: Props) {
  const [ttsState, setTTSState] = useState<TTSState>(
    initialAudioUrl ? { status: 'ready', audioUrl: initialAudioUrl } : { status: 'idle' }
  );
  const [activeScene, setActiveScene] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scenes = splitIntoScenes(storyText);
  const charCards = buildCharacterCards(characters, childName);
  const dedication = buildDedication(childName, moral);
  const rt = readingTime(storyText);

  // Прогресс чтения + активная сцена
  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
    setScrollProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0);

    // Скрывать хедер при скролле вниз
    setHeaderVisible(scrollTop < lastScrollY || scrollTop < 60);
    setLastScrollY(scrollTop);

    // Активная сцена
    for (let i = sceneRefs.current.length - 1; i >= 0; i--) {
      const ref = sceneRefs.current[i];
      if (ref && ref.offsetTop - 120 <= scrollTop) {
        setActiveScene(i);
        break;
      }
    }
  }, [lastScrollY]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToScene = (i: number) => {
    const el = sceneRefs.current[i];
    const container = contentRef.current;
    if (!el || !container) return;
    container.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  };

  const handleTTS = async () => {
    setTTSState({ status: 'loading' });
    try {
      const res = await fetch('/api/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, storyText }),
      });
      const data = await res.json();
      if (!res.ok || !data.audioUrl) throw new Error();
      setTTSState({ status: 'ready', audioUrl: data.audioUrl });
    } catch {
      setTTSState({ status: 'error' });
    }
  };

  return (
    <div className="w-full bg-[#FAF8F5]">

      {/* ══════════════════════════════════════════════
          MOBILE (< lg)  — та же одноколоночная схема
      ══════════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Hero + mobile content — упрощённая версия */}
        <div className="relative w-full aspect-[4/3]">
          {initialIllustrationUrl
            ? <Image src={initialIllustrationUrl} alt="" fill className="object-cover" unoptimized priority />
            : <div className="absolute inset-0 bg-gradient-to-br from-fairy-purple-400 via-fairy-pink-400 to-fairy-gold-300" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <Link href="/" className="text-white/80 text-sm">← Назад</Link>
          </div>
          <div className="absolute bottom-0 p-5 w-full">
            <h1 className="font-serif text-2xl text-white font-bold">{childName}</h1>
            <p className="text-white/50 text-xs mt-0.5">{moral} · {rt}</p>
          </div>
        </div>
        {!initialIllustrationUrl && (
          <div className="px-4 pt-4">
            <IllustrationBlock slug={slug} storyText={storyText} characters={characters} initialImageUrl={null} />
          </div>
        )}
        <div className="px-4 py-6 flex flex-col gap-6">
          {/* Audio */}
          <div className="rounded-2xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-4">
            {ttsState.status === 'idle' || ttsState.status === 'error' ? (
              <button onClick={handleTTS} className="w-full flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="#7C5CBF" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Послушать сказку</p>
                  <p className="text-white/50 text-xs">{ttsState.status === 'error' ? 'Попробовать снова' : 'Озвучка на русском'}</p>
                </div>
              </button>
            ) : ttsState.status === 'loading' ? (
              <div className="flex items-center gap-3 py-1">
                <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{animationDelay:`${i*.2}s`}}/>)}</div>
                <p className="text-white text-sm">Готовим озвучку ~60с</p>
              </div>
            ) : (
              <AudioPlayer src={(ttsState as {status:'ready';audioUrl:string}).audioUrl} title={`Сказка про ${childName}`} />
            )}
          </div>
          {/* Посвящение */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-2">Посвящение</p>
            <p className="font-serif text-lg text-fairy-purple-800 mb-2">Дорогой {childName},</p>
            <p className="text-fairy-purple-600 text-sm leading-relaxed">{dedication}</p>
          </div>
          {/* Персонажи */}
          <div className="grid grid-cols-2 gap-2">
            {charCards.map((c,i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-2.5">
                <span className="text-2xl">{c.emoji}</span>
                <div><p className="font-semibold text-sm text-gray-800">{c.name}</p><p className="text-gray-400 text-xs">{c.role}</p></div>
              </div>
            ))}
          </div>
          {/* Сцены */}
          {scenes.map((scene, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-fairy-purple-100 text-fairy-purple-600 text-xs font-bold flex items-center justify-center">{scene.number}</div>
                <div>
                  <p className="text-xs text-fairy-purple-400 uppercase tracking-wide">Сцена {scene.number}</p>
                  <h3 className="font-serif text-base text-fairy-purple-800">{scene.title}</h3>
                </div>
              </div>
              <div className="space-y-3 pl-10">
                {scene.paragraphs.map((p,j) => (
                  <p key={j} className={`text-gray-700 text-sm leading-relaxed ${j===0?'first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-fairy-purple-400 first-letter:float-left first-letter:mr-1 first-letter:leading-none':''}`}>{p}</p>
                ))}
              </div>
              {i < scenes.length-1 && <div className="mt-5 pl-10 border-b border-gray-100" />}
            </div>
          ))}
          <div className="rounded-2xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-7 text-center">
            <p className="text-5xl mb-3">🌟</p>
            <h3 className="font-serif text-xl text-white font-bold mb-2">Вот и вся сказка!</h3>
            <p className="text-white/70 text-sm">Спасибо за приключение вместе с {childName}. 💜</p>
          </div>
          <ShareButtons slug={slug} childName={childName} />
          <button onClick={onCreateNew} className="btn-magic py-4 flex items-center justify-center gap-2 text-base"><span>✨</span>Создать новую сказку</button>
          <button disabled className="py-3.5 rounded-2xl border-2 border-dashed border-fairy-purple-200 text-fairy-purple-300 text-sm flex items-center justify-center gap-2 cursor-not-allowed">📚 Печатная книга — скоро</button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP (≥ lg) — 3 колонки + sticky header
      ══════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:flex-col h-screen overflow-hidden">

        {/* ── STICKY HEADER ───────────────────────── */}
        <header className={`flex-shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm transition-all duration-300 z-30 ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="flex items-center gap-6 px-6 xl:px-10 h-14">
            {/* Назад */}
            <Link href="/" className="text-gray-400 hover:text-gray-700 text-sm transition-colors flex items-center gap-1.5 flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/></svg>
              Назад
            </Link>

            {/* Прогресс + заголовок */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-serif text-base text-gray-800 truncate">Сказка про {childName}</h2>
                <span className="text-gray-300 text-xs flex-shrink-0">·</span>
                <span className="text-gray-400 text-xs flex-shrink-0">
                  {scenes[activeScene]?.title ?? ''}
                </span>
              </div>
              {/* Прогресс бар */}
              <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-fairy-purple-400 to-fairy-pink-400 rounded-full transition-all duration-150"
                  style={{ width: `${scrollProgress}%` }} />
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400">{Math.round(scrollProgress)}%</span>
              {ttsState.status === 'idle' && (
                <button onClick={handleTTS}
                  className="flex items-center gap-2 bg-fairy-purple-600 hover:bg-fairy-purple-700 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 5v14l11-7z"/></svg>
                  Озвучка
                </button>
              )}
              {ttsState.status === 'loading' && (
                <span className="flex items-center gap-1.5 text-xs text-fairy-purple-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-fairy-purple-400 animate-pulse"/>Загрузка...
                </span>
              )}
              {ttsState.status === 'ready' && (
                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">✓ Озвучка готова</span>
              )}
              {ttsState.status === 'error' && (
                <button onClick={handleTTS} className="text-xs text-red-400 hover:text-red-600">Повторить</button>
              )}
            </div>
          </div>
        </header>

        {/* ── 3-КОЛОНОЧНАЯ СЕТКА ──────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ЛЕВЫЙ САЙДБАР: навигация */}
          <aside className="w-56 xl:w-64 flex-shrink-0 border-r border-gray-100 bg-white overflow-y-auto">
            <div className="p-5 xl:p-6 flex flex-col gap-6">

              {/* Обложка-миниатюра */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
                {initialIllustrationUrl
                  ? <Image src={initialIllustrationUrl} alt="" fill className="object-cover" unoptimized />
                  : <div className="absolute inset-0 bg-gradient-to-br from-fairy-purple-400 to-fairy-pink-400" />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 p-3">
                  <p className="font-serif text-white text-sm font-bold leading-tight">{childName}</p>
                  <p className="text-white/60 text-xs">{rt}</p>
                </div>
              </div>

              {/* Навигация по сценам */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Содержание</p>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                    className={`text-left text-sm px-3 py-2 rounded-xl transition-all ${
                      activeScene === -1 ? 'bg-fairy-purple-50 text-fairy-purple-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
                    }`}>
                    Посвящение
                  </button>
                  {scenes.map((scene, i) => (
                    <button key={i} onClick={() => scrollToScene(i)}
                      className={`text-left px-3 py-2 rounded-xl transition-all flex items-center gap-2.5 group ${
                        i === activeScene ? 'bg-fairy-purple-50 text-fairy-purple-700' : 'text-gray-500 hover:bg-gray-50'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                        i === activeScene ? 'bg-fairy-purple-500' : 'bg-gray-200 group-hover:bg-gray-400'
                      }`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${i === activeScene ? 'text-fairy-purple-700' : ''}`}>
                          {scene.title}
                        </p>
                        <p className="text-xs text-gray-400">Сцена {scene.number}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Персонажи */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Герои</p>
                <div className="flex flex-col gap-2">
                  {charCards.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-1">
                      <span className="text-xl flex-shrink-0">{c.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <button onClick={onCreateNew}
                  className="w-full text-sm text-center py-2.5 rounded-xl bg-fairy-purple-600 text-white font-medium hover:bg-fairy-purple-700 transition-colors">
                  ✨ Новая сказка
                </button>
                <button disabled
                  className="w-full text-sm text-center py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-300 cursor-not-allowed">
                  📚 Книга — скоро
                </button>
              </div>
            </div>
          </aside>

          {/* ЦЕНТР: основной текст */}
          <main ref={contentRef} className="flex-1 overflow-y-auto bg-[#FAF8F5]">
            <div className="max-w-2xl xl:max-w-3xl mx-auto px-8 xl:px-12 py-10 xl:py-14">

              {/* Посвящение */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-8 xl:p-10 mb-14">
                <div className="absolute top-5 right-7 text-7xl opacity-5 select-none font-serif">📜</div>
                <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-4">Посвящение</p>
                <p className="font-serif text-2xl xl:text-3xl text-gray-800 leading-snug mb-4">
                  Дорогой {childName},
                </p>
                <p className="text-gray-600 leading-relaxed xl:text-lg">{dedication}</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="flex-1 h-px bg-amber-200" />
                  <span className="text-amber-400 text-sm">✦</span>
                  <div className="flex-1 h-px bg-amber-200" />
                </div>
                <p className="text-gray-400 text-sm text-right italic mt-4">— Твоя волшебная книга</p>
              </div>

              {/* Сцены */}
              <div className="flex flex-col gap-0">
                {scenes.map((scene, i) => (
                  <div key={i}
                    ref={el => { sceneRefs.current[i] = el; }}
                    className="pb-16 xl:pb-20 scroll-mt-24">

                    {/* Заголовок сцены */}
                    <div className="flex items-start gap-5 mb-8">
                      <div className="flex-shrink-0 text-center pt-0.5">
                        <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                          <span className="font-serif text-xl xl:text-2xl text-gray-300 font-bold">{scene.number}</span>
                        </div>
                      </div>
                      <div className="pt-1">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Сцена {scene.number}</p>
                        <h3 className="font-serif text-2xl xl:text-3xl text-gray-900 leading-tight">{scene.title}</h3>
                      </div>
                    </div>

                    {/* Текст */}
                    <div className="space-y-5 xl:space-y-6 pl-17 xl:pl-19" style={{ paddingLeft: '4.25rem' }}>
                      {scene.paragraphs.map((para, j) => (
                        <p key={j}
                          className={`text-gray-700 xl:text-lg leading-loose xl:leading-[1.9] ${
                            j === 0
                              ? 'first-letter:text-5xl xl:first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-fairy-purple-400 first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:mt-1.5'
                              : ''
                          }`}>
                          {para}
                        </p>
                      ))}
                    </div>

                    {i < scenes.length - 1 && (
                      <div className="flex items-center gap-4 mt-14 xl:mt-16" style={{ paddingLeft: '4.25rem' }}>
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-gray-200 text-lg">✦</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Финал */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-700 to-indigo-900 p-10 xl:p-14 text-center mb-10">
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                  {['✨','⭐','🌟','💫','✦','🌙','🎆','🌠'].map((s, i) => (
                    <span key={i} className="absolute xl:text-4xl text-3xl opacity-10"
                      style={{ top:`${[8,62,32,78,18,52,88,42][i]}%`, left:`${[6,12,76,65,88,44,28,92][i]}%` }}>{s}</span>
                  ))}
                </div>
                <div className="relative z-10">
                  <p className="text-6xl xl:text-7xl mb-5">🌟</p>
                  <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Конец истории</p>
                  <h3 className="font-serif text-3xl xl:text-4xl text-white font-bold mb-4">Вот и вся сказка!</h3>
                  <p className="text-white/75 xl:text-lg leading-relaxed max-w-md mx-auto">
                    Спасибо, что отправились в это волшебное приключение вместе с {childName}.
                    Пусть сказки всегда живут в вашем сердце! 💜
                  </p>
                </div>
              </div>

              <ShareButtons slug={slug} childName={childName} />
              <p className="text-center text-xs text-gray-300 mt-8 mb-2">
                Создано в <a href="/" className="text-fairy-purple-400 hover:text-fairy-purple-600 font-medium">Расскажи Сказку</a>
              </p>
            </div>
          </main>

          {/* ПРАВЫЙ САЙДБАР: иллюстрация + аудио */}
          <aside className="w-72 xl:w-80 flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto">
            <div className="p-5 xl:p-6 flex flex-col gap-5">

              {/* Иллюстрация */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-fairy">
                {initialIllustrationUrl
                  ? <Image src={initialIllustrationUrl} alt="" fill className="object-cover" unoptimized priority />
                  : <IllustrationBlock slug={slug} storyText={storyText} characters={characters} initialImageUrl={null} />
                }
              </div>

              {/* Инфо о книге */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="font-serif text-lg text-gray-800 font-bold mb-0.5">Сказка про {childName}</p>
                <p className="text-xs text-gray-500 mb-3">{moral}</p>
                <div className="flex gap-3 flex-wrap">
                  {[`📖 ${scenes.length} сцены`, `⏱ ${rt}`].map(b => (
                    <span key={b} className="text-xs text-gray-500 bg-white border border-gray-100 px-2.5 py-1 rounded-full">{b}</span>
                  ))}
                </div>
              </div>

              {/* Аудиоплеер */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Озвучка</p>
                {ttsState.status === 'idle' && (
                  <button onClick={handleTTS}
                    className="w-full flex items-center gap-3 bg-gradient-to-br from-fairy-purple-600 to-fairy-purple-800 rounded-2xl p-4 group hover:from-fairy-purple-700 hover:to-fairy-purple-900 transition-all">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow">
                      <svg viewBox="0 0 24 24" fill="#7C5CBF" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Послушать</p>
                      <p className="text-white/60 text-xs">Аудиокнига на русском</p>
                    </div>
                  </button>
                )}
                {ttsState.status === 'loading' && (
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
                    <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full bg-fairy-purple-300 animate-bounce" style={{animationDelay:`${i*.2}s`}}/>)}</div>
                    <div><p className="text-gray-700 text-sm font-medium">Готовим...</p><p className="text-gray-400 text-xs">~60 секунд</p></div>
                  </div>
                )}
                {ttsState.status === 'ready' && (
                  <AudioPlayer src={(ttsState as {status:'ready';audioUrl:string}).audioUrl} title={`Сказка про ${childName}`} />
                )}
                {ttsState.status === 'error' && (
                  <button onClick={handleTTS} className="w-full text-sm text-red-400 hover:text-red-600 py-3 rounded-2xl border border-red-100 hover:border-red-200 transition-colors">
                    🔄 Попробовать снова
                  </button>
                )}
              </div>

              {/* Прогресс чтения */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Прогресс</p>
                  <p className="text-xs font-bold text-fairy-purple-600">{Math.round(scrollProgress)}%</p>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-fairy-purple-400 to-fairy-pink-400 rounded-full transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Сцена {activeScene + 1} из {scenes.length}
                </p>
              </div>

              {/* Поделиться */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Поделиться</p>
                <ShareButtons slug={slug} childName={childName} />
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}