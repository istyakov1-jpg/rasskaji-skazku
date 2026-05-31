'use client';

import { useEffect, useState } from 'react';

interface Props {
  step?: 'story' | 'illustration';
  childName?: string;
}

const STORY_MESSAGES = [
  { emoji: '📖', text: 'Открываем волшебную книгу...' },
  { emoji: '✨', text: 'Зовём сказочных персонажей...' },
  { emoji: '🌟', text: 'Придумываем приключение...' },
  { emoji: '🧚', text: 'Фея плетёт волшебство...' },
  { emoji: '🌙', text: 'Сказка оживает...' },
];

const ILLUSTRATION_MESSAGES = [
  { emoji: '🎨', text: 'Берём волшебные краски...' },
  { emoji: '🖌️', text: 'Рисуем сказочный мир...' },
  { emoji: '🌈', text: 'Добавляем яркие цвета...' },
  { emoji: '⭐', text: 'Рассыпаем звёздную пыль...' },
  { emoji: '🎠', text: 'Картинка оживает...' },
];

// Позиции звёздочек (фиксированные, без Math.random — SSR-safe)
const STARS = [
  { top: '8%',  left: '12%', size: 16, delay: 0,   dur: 2.1 },
  { top: '15%', left: '88%', size: 12, delay: 0.4, dur: 1.8 },
  { top: '72%', left: '6%',  size: 14, delay: 0.8, dur: 2.4 },
  { top: '80%', left: '90%', size: 10, delay: 1.2, dur: 1.6 },
  { top: '45%', left: '95%', size: 8,  delay: 0.2, dur: 2.2 },
  { top: '90%', left: '50%', size: 12, delay: 0.6, dur: 1.9 },
  { top: '25%', left: '4%',  size: 10, delay: 1.0, dur: 2.0 },
  { top: '55%', left: '85%', size: 16, delay: 1.4, dur: 1.7 },
];

const FLOATING_EMOJIS = ['🌟','✨','💫','⭐','🌙','🦋','🌸','🍀'];

export default function LoadingAnimation({ step = 'story', childName }: Props) {
  const messages = step === 'story' ? STORY_MESSAGES : ILLUSTRATION_MESSAGES;
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Плавно меняем сообщения каждые 3 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx(i => (i + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const current = messages[msgIdx];

  return (
    <div className="relative flex flex-col items-center justify-center py-12 gap-8 overflow-hidden min-h-[420px]">

      {/* Фоновые звёздочки */}
      {STARS.map((s, i) => (
        <div key={i} className="absolute pointer-events-none select-none"
          style={{ top: s.top, left: s.left,
            animation: `starPulse ${s.dur}s ease-in-out ${s.delay}s infinite` }}>
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
              fill="rgba(124,92,191,0.35)" />
          </svg>
        </div>
      ))}

      {/* Плавающие эмодзи по углам */}
      {FLOATING_EMOJIS.map((emoji, i) => {
        const angle = (i / FLOATING_EMOJIS.length) * 360;
        const radius = 140;
        const x = 50 + Math.cos((angle * Math.PI) / 180) * (radius / 3.2);
        const y = 50 + Math.sin((angle * Math.PI) / 180) * (radius / 4.5);
        return (
          <div key={i} className="absolute text-lg pointer-events-none select-none opacity-40"
            style={{
              left: `${x}%`, top: `${y}%`,
              animation: `floatEmoji ${2.5 + (i % 3) * 0.5}s ease-in-out ${(i * 0.3) % 2}s infinite`,
            }}>
            {emoji}
          </div>
        );
      })}

      {/* Центральный магический круг */}
      <div className="relative flex items-center justify-center">
        {/* Внешнее кольцо */}
        <div className="absolute w-44 h-44 rounded-full border-2 border-fairy-purple-200/60 animate-spin-slow" />
        {/* Среднее кольцо */}
        <div className="absolute w-32 h-32 rounded-full border-2 border-fairy-gold-300/50 animate-spin-slow"
          style={{ animationDirection: 'reverse', animationDuration: '4s' }} />

        {/* Орбитальные звёздочки */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div key={i} className="absolute w-44 h-44 animate-spin-slow"
            style={{ animationDuration: '6s', transform: `rotate(${deg}deg)` }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-2.5 h-2.5 rounded-full bg-fairy-purple-300/70"
                style={{ animation: `starPulse 1.5s ease-in-out ${i * 0.25}s infinite` }} />
            </div>
          </div>
        ))}

        {/* Центральный символ */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-fairy-purple-100 to-fairy-pink-100 flex items-center justify-center shadow-fairy-lg"
          style={{ animation: 'centerPulse 2s ease-in-out infinite' }}>
          <span className="text-5xl" style={{ animation: 'centerPulse 2s ease-in-out infinite' }}>
            {current.emoji}
          </span>
        </div>
      </div>

      {/* Текст */}
      <div className="text-center flex flex-col gap-3 z-10">
        {childName && (
          <p className="font-serif text-xl text-fairy-purple-600">
            Сказка для {childName} почти готова!
          </p>
        )}
        <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease', minHeight: 32 }}>
          <p className="text-fairy-purple-500 text-lg font-medium">{current.text}</p>
        </div>
        <div className="flex justify-center gap-1.5 mt-1">
          {messages.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${
              i === msgIdx ? 'w-5 h-2 bg-fairy-purple-400' : 'w-2 h-2 bg-fairy-purple-200'
            }`} />
          ))}
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="w-64 z-10">
        <div className="h-1.5 bg-fairy-purple-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-fairy-purple-400 via-fairy-pink-400 to-fairy-gold-500"
            style={{ animation: `progress ${step === 'story' ? 22 : 65}s linear forwards` }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress { from { width: 2%; } to { width: 97%; } }
        @keyframes starPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(10deg); }
        }
        @keyframes centerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }
      `}</style>
    </div>
  );
}