'use client';

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

// Сообщения с примерным временем — сказка ~20с, иллюстрация ~60с
const STEPS = [
  { icon: '📖', text: 'Пишем сказку...', from: 0, to: 25 },
  { icon: '✨', text: 'Добавляем волшебство...', from: 25, to: 40 },
  { icon: '🎨', text: 'Рисуем иллюстрацию...', from: 40, to: 90 },
  { icon: '🖼️', text: 'Финальные штрихи...', from: 90, to: 100 },
];

export default function LoadingAnimation() {
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
            <div className="absolute inset-0 flex items-center justify-center text-4xl magic-wand">🪄</div>
          </div>
        </div>
      </div>

      {/* Шаги с иконками */}
      <div className="text-center">
        <h3 className="font-serif text-2xl text-fairy-purple-600 mb-4">Создаём сказку...</h3>
        <div className="flex flex-col gap-3 text-left max-w-xs mx-auto">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3 sparkle-dot"
              style={{ animationDelay: `${i * 1.5}s`, animationDuration: `${STEPS.length * 1.5}s` }}>
              <span className="text-xl w-8 text-center">{step.icon}</span>
              <span className="text-sm text-fairy-purple-500">{step.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Прогресс ~80 секунд */}
      <div className="w-64 flex flex-col gap-2">
        <div className="h-2 bg-fairy-purple-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-fairy-purple-400 to-fairy-pink-500 rounded-full"
            style={{ animation: 'progress 80s linear forwards' }} />
        </div>
        <p className="text-xs text-center text-fairy-purple-300">~80 секунд — сказка + иллюстрация</p>
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