'use client';

interface Props {
  step?: 'story' | 'illustration';
}

const SPARKLE_POSITIONS = [
  { top: '10%', left: '20%', delay: '0s' },
  { top: '20%', left: '75%', delay: '0.3s' },
  { top: '60%', left: '10%', delay: '0.6s' },
  { top: '70%', left: '80%', delay: '0.9s' },
  { top: '40%', left: '50%', delay: '1.2s' },
  { top: '80%', left: '40%', delay: '0.4s' },
  { top: '15%', left: '55%', delay: '0.8s' },
  { top: '55%', left: '90%', delay: '1.5s' },
];

export default function LoadingAnimation({ step = 'story' }: Props) {
  const isStory = step === 'story';

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Волшебная палочка */}
      <div className="relative w-48 h-48">
        {SPARKLE_POSITIONS.map((pos, i) => (
          <div key={i} className="absolute text-2xl sparkle-dot"
            style={{ top: pos.top, left: pos.left, animationDelay: pos.delay, animationDuration: `${1.5 + (i % 3) * 0.5}s` }}>
            {['✨', '⭐', '🌟', '💫'][i % 4]}
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-fairy-purple-300/50 animate-spin-slow" />
            <div className="absolute inset-2 rounded-full border-4 border-fairy-gold-500/60 animate-spin-slow"
              style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
            <div className="absolute inset-0 flex items-center justify-center text-4xl magic-wand">
              {isStory ? '🪄' : '🎨'}
            </div>
          </div>
        </div>
      </div>

      {/* Текст */}
      <div className="text-center">
        <h3 className="font-serif text-2xl text-fairy-purple-600 mb-2">
          {isStory ? 'Пишем сказку...' : 'Рисуем иллюстрацию...'}
        </h3>
        <p className="text-fairy-purple-400 text-sm">
          {isStory ? 'Придумываем историю ~20 секунд' : 'Flux-2 рисует картинку ~60 секунд'}
        </p>
      </div>

      {/* Шаги */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          isStory ? 'bg-fairy-purple-500 text-white' : 'bg-fairy-purple-100 text-fairy-purple-400 line-through'
        }`}>
          {isStory ? '⏳' : '✓'} Сказка
        </div>
        <div className="w-8 h-0.5 bg-fairy-purple-200" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !isStory ? 'bg-fairy-purple-500 text-white' : 'bg-fairy-purple-100 text-fairy-purple-300'
        }`}>
          {!isStory ? '⏳' : '○'} Иллюстрация
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="w-64 flex flex-col gap-2">
        <div className="h-2 bg-fairy-purple-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-fairy-purple-400 to-fairy-pink-500 rounded-full"
            style={{ animation: `progress ${isStory ? 20 : 70}s linear forwards` }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 95%; }
        }
      `}</style>
    </div>
  );
}