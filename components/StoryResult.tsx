'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  | { status: 'error' };

function Divider() {
  return (
    <div className="flex items-center gap-4 my-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-fairy-purple-200 to-transparent" />
      <span className="text-fairy-gold-400 text-sm">✦</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-fairy-purple-200 to-transparent" />
    </div>
  );
}

function TTSButton({ state, onRequest, childName }: {
  state: TTSState; onRequest: () => void; childName: string;
}) {
  if (state.status === 'ready') {
    return <AudioPlayer src={(state as { status: 'ready'; audioUrl: string }).audioUrl} title={`Сказка про ${childName}`} />;
  }
  if (state.status === 'loading') {
    return (
      <div className="rounded-2xl bg-fairy-purple-800/60 backdrop-blur p-4 flex items-center gap-3">
        <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay:`${i*.2}s` }} />)}</div>
        <div><p className="text-white text-sm font-medium">Готовим озвучку...</p><p className="text-white/50 text-xs">~60 секунд</p></div>
      </div>
    );
  }
  return (
    <button onClick={onRequest}
      className="w-full flex items-center gap-4 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur border border-white/20 rounded-2xl p-4 transition-all group">
      <div className="w-12 h-12 rounded-full bg-white flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
        <svg viewBox="0 0 24 24" fill="#7C5CBF" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
      </div>
      <div className="text-left flex-1">
        <p className="text-white font-semibold text-sm">
          {state.status === 'error' ? '🔄 Попробовать снова' : '🎧 Послушать сказку'}
        </p>
        <p className="text-white/50 text-xs mt-0.5">
          {state.status === 'error' ? 'Произошла ошибка' : 'Озвучка на русском языке'}
        </p>
      </div>
      {/* Мини-волна */}
      <div className="flex gap-0.5 items-center h-6 opacity-40 flex-shrink-0">
        {Array.from({length:14}, (_,i) => (
          <div key={i} className="w-1 rounded-full bg-white"
            style={{ height:`${30+Math.sin(i*.9)*25+Math.sin(i*1.7)*15}%` }} />
        ))}
      </div>
    </button>
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
  const rightRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scenes = splitIntoScenes(storyText);
  const characters_cards = buildCharacterCards(characters, childName);
  const dedication = buildDedication(childName, moral);

  // Подсвечиваем активную сцену при скролле правой панели
  useEffect(() => {
    const panel = rightRef.current;
    if (!panel) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const i = sceneRefs.current.indexOf(e.target as HTMLDivElement);
          if (i !== -1) setActiveScene(i);
        }
      }),
      { root: panel, rootMargin: '-20% 0px -60% 0px' }
    );
    sceneRefs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, [scenes.length]);

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

  const scrollToScene = (i: number) => {
    sceneRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full min-h-screen">

      {/* ╔══════════════════════════════════════════════════════╗
          ║  MOBILE: одна колонка, обычный скролл страницы     ║
          ╚══════════════════════════════════════════════════════╝ */}
      <div className="lg:hidden" style={{ background: 'linear-gradient(160deg,#FFF8F0,#F5F0FF)' }}>

        {/* Hero */}
        <div className="relative w-full aspect-[4/3]">
          {initialIllustrationUrl
            ? <Image src={initialIllustrationUrl} alt="" fill className="object-cover" unoptimized priority />
            : <div className="absolute inset-0 bg-gradient-to-br from-fairy-purple-400 via-fairy-pink-400 to-fairy-gold-300" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute top-4 left-4">
            <Link href="/" className="text-white/80 text-sm hover:text-white flex items-center gap-1">← Главная</Link>
          </div>
          <div className="absolute bottom-0 p-5 w-full">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Создано для</p>
            <h1 className="font-serif text-2xl text-white font-bold">{childName}</h1>
            <p className="text-white/50 text-xs mt-0.5">{moral}</p>
            <div className="flex gap-2 flex-wrap mt-3">
              {[`📖 ${scenes.length} сцены`, '🎧 Озвучка'].map(b => (
                <span key={b} className="bg-white/15 text-white text-xs px-2.5 py-1 rounded-full border border-white/20">{b}</span>
              ))}
            </div>
          </div>
        </div>

        {!initialIllustrationUrl && (
          <div className="px-4 pt-4"><IllustrationBlock slug={slug} storyText={storyText} characters={characters} initialImageUrl={null} /></div>
        )}

        <div className="px-4 py-6 flex flex-col gap-6">
          {/* Аудио */}
          <div className="rounded-2xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-4">
            <TTSButton state={ttsState} onRequest={handleTTS} childName={childName} />
          </div>

          {/* Посвящение */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-2">Посвящение</p>
            <p className="font-serif text-lg text-fairy-purple-800 mb-2">Дорогой {childName},</p>
            <p className="text-fairy-purple-600 text-sm leading-relaxed">{dedication}</p>
          </div>

          {/* Персонажи */}
          <div>
            <h2 className="font-serif text-lg text-fairy-purple-700 mb-3">🎭 Герои истории</h2>
            <div className="grid grid-cols-2 gap-2">
              {characters_cards.map((c, i) => (
                <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-fairy-purple-50 flex items-center gap-2.5">
                  <span className="text-2xl">{c.emoji}</span>
                  <div><p className="font-semibold text-fairy-purple-800 text-sm">{c.name}</p><p className="text-fairy-purple-400 text-xs">{c.role}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Сцены */}
          <div className="flex flex-col gap-8">
            {scenes.map((scene, i) => (
              <div key={i} ref={el => { sceneRefs.current[i] = el; }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-fairy-purple-100 text-fairy-purple-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{scene.number}</div>
                  <div>
                    <p className="text-xs text-fairy-purple-400 uppercase tracking-wide">Сцена {scene.number}</p>
                    <h3 className="font-serif text-base text-fairy-purple-800">{scene.title}</h3>
                  </div>
                </div>
                <div className="space-y-3 pl-10">
                  {scene.paragraphs.map((p, j) => (
                    <p key={j} className={`text-fairy-purple-700 text-sm leading-relaxed ${j===0?'first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-fairy-purple-500 first-letter:float-left first-letter:mr-1 first-letter:leading-none':''}`}>{p}</p>
                  ))}
                </div>
                {i < scenes.length-1 && <div className="mt-6 pl-10"><Divider /></div>}
              </div>
            ))}
          </div>

          {/* Финал */}
          <div className="rounded-2xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-7 text-center">
            <p className="text-5xl mb-3">🌟</p>
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Конец истории</p>
            <h3 className="font-serif text-xl text-white font-bold mb-2">Вот и вся сказка!</h3>
            <p className="text-white/75 text-sm leading-relaxed">Спасибо за это приключение вместе с {childName}. 💜</p>
          </div>

          <ShareButtons slug={slug} childName={childName} />
          <button onClick={onCreateNew} className="btn-magic py-4 flex items-center justify-center gap-2 text-base"><span>✨</span>Создать новую сказку</button>
          <button disabled className="py-3.5 rounded-2xl border-2 border-dashed border-fairy-purple-200 text-fairy-purple-300 text-sm flex items-center justify-center gap-2 cursor-not-allowed">📚 Печатная книга — скоро</button>
          <p className="text-center text-xs text-fairy-purple-300 pb-4">Создано в <a href="/" className="text-fairy-purple-400 font-semibold">Расскажи Сказку</a></p>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  DESKTOP (≥ lg): две независимые колонки            ║
          ║  Левая — фиксирована с иллюстрацией                 ║
          ║  Правая — скроллится с историей                      ║
          ╚══════════════════════════════════════════════════════╝ */}
      <div className="hidden lg:grid lg:grid-cols-[45%_55%] xl:grid-cols-[42%_58%] h-screen overflow-hidden">

        {/* ─── ЛЕВАЯ ПАНЕЛЬ: иллюстрация + управление ─── */}
        <div className="relative h-screen flex flex-col overflow-hidden">
          {/* Фон — иллюстрация */}
          <div className="absolute inset-0">
            {initialIllustrationUrl
              ? <Image src={initialIllustrationUrl} alt="" fill className="object-cover" unoptimized priority />
              : <div className="absolute inset-0 bg-gradient-to-br from-fairy-purple-500 via-fairy-pink-400 to-fairy-gold-300" />
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
          </div>

          {/* Иллюстрация на загрузке */}
          {!initialIllustrationUrl && (
            <div className="absolute inset-x-6 bottom-72 z-20">
              <IllustrationBlock slug={slug} storyText={storyText} characters={characters} initialImageUrl={null} />
            </div>
          )}

          {/* Контент */}
          <div className="relative z-10 flex flex-col h-full p-8 xl:p-10 2xl:p-12">
            {/* Навигация */}
            <div className="flex items-center justify-between">
              <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                ← На главную
              </Link>
              <span className="bg-white/15 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
                ✨ Персональная сказка
              </span>
            </div>

            <div className="flex-1" />

            {/* Нижний блок — title + audio + chars */}
            <div className="flex flex-col gap-5">
              {/* Заголовок */}
              <div>
                <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Создано специально для</p>
                <h1 className="font-serif text-4xl xl:text-5xl 2xl:text-6xl text-white font-bold leading-tight">
                  {childName}
                </h1>
                <p className="text-white/50 text-sm mt-1.5">{moral}</p>
              </div>

              {/* Бейджи */}
              <div className="flex gap-2 flex-wrap">
                {[`📖 ${scenes.length} сцены`, '🎧 Озвучка', '🎨 Иллюстрация'].map(b => (
                  <span key={b} className="bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/20">{b}</span>
                ))}
              </div>

              {/* Аудиоплеер */}
              <TTSButton state={ttsState} onRequest={handleTTS} childName={childName} />

              {/* Персонажи */}
              <div className="grid grid-cols-2 gap-2">
                {characters_cards.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/8 hover:bg-white/15 backdrop-blur border border-white/10 rounded-xl p-3 transition-colors">
                    <span className="text-2xl xl:text-3xl">{c.emoji}</span>
                    <div>
                      <p className="text-white text-sm font-semibold">{c.name}</p>
                      <p className="text-white/50 text-xs">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── ПРАВАЯ ПАНЕЛЬ: история (скроллится) ─── */}
        <div ref={rightRef} className="h-screen overflow-y-auto bg-[#FDFAFF]">
          <div className="px-10 xl:px-14 2xl:px-20 py-12 max-w-3xl">

            {/* Посвящение */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-fairy-gold-50 border border-amber-200/60 p-8 xl:p-10 mb-12">
              <div className="absolute top-6 right-8 text-6xl opacity-8 select-none">📜</div>
              <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-4">Посвящение</p>
              <p className="font-serif text-2xl xl:text-3xl text-fairy-purple-800 leading-snug mb-4">Дорогой {childName},</p>
              <p className="text-fairy-purple-600 leading-relaxed xl:text-lg">{dedication}</p>
              <Divider />
              <p className="text-fairy-purple-400 text-sm text-right italic">— Твоя волшебная книга</p>
            </div>

            {/* Навигация по сценам */}
            <div className="flex gap-2 flex-wrap mb-10">
              {scenes.map((scene, i) => (
                <button key={i} onClick={() => scrollToScene(i)}
                  className={`text-xs px-4 py-2 rounded-full border font-medium transition-all ${
                    i === activeScene
                      ? 'bg-fairy-purple-600 text-white border-fairy-purple-600 shadow-fairy'
                      : 'border-fairy-purple-200 text-fairy-purple-400 hover:border-fairy-purple-500 hover:text-fairy-purple-600 bg-white'
                  }`}>
                  {scene.number}. {scene.title}
                </button>
              ))}
            </div>

            {/* Сцены */}
            <div className="flex flex-col gap-16">
              {scenes.map((scene, i) => (
                <div key={i} ref={el => { sceneRefs.current[i] = el; }} className="scroll-mt-10">
                  {/* Заголовок сцены */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-fairy-purple-100 text-fairy-purple-600 font-bold text-sm xl:text-base flex items-center justify-center flex-shrink-0 shadow-sm">
                      {scene.number}
                    </div>
                    <div>
                      <p className="text-xs text-fairy-purple-400 uppercase tracking-widest">Сцена {scene.number}</p>
                      <h3 className="font-serif text-xl xl:text-2xl text-fairy-purple-800">{scene.title}</h3>
                    </div>
                  </div>

                  {/* Текст */}
                  <div className="space-y-5 pl-14 xl:pl-16">
                    {scene.paragraphs.map((para, j) => (
                      <p key={j} className={`text-fairy-purple-700 xl:text-lg leading-loose xl:leading-loose ${
                        j === 0
                          ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-fairy-purple-500 first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:mt-1'
                          : ''
                      }`}>{para}</p>
                    ))}
                  </div>

                  {i < scenes.length - 1 && <div className="mt-10 pl-14 xl:pl-16"><Divider /></div>}
                </div>
              ))}
            </div>

            {/* Финал */}
            <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-10 xl:p-14 text-center">
              <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                {['✨','⭐','🌟','💫','✦','🌙','🎆','🌠'].map((s, i) => (
                  <span key={i} className="absolute text-3xl xl:text-4xl opacity-10"
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

            {/* CTA */}
            <div className="mt-10 flex flex-col gap-4">
              <ShareButtons slug={slug} childName={childName} />
              <div className="flex gap-4">
                <button onClick={onCreateNew}
                  className="flex-1 btn-magic py-4 xl:py-5 text-base xl:text-lg flex items-center justify-center gap-2">
                  <span>✨</span>Создать новую сказку
                </button>
                <button disabled
                  className="flex-1 py-4 rounded-2xl border-2 border-dashed border-fairy-purple-200 text-fairy-purple-300 text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                  📚 Печатная книга — скоро
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-fairy-purple-300 mt-10 mb-6">
              Создано в сервисе <a href="/" className="text-fairy-purple-400 font-semibold hover:text-fairy-purple-600">Расскажи Сказку</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}