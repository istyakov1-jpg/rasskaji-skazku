import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Расскажи Сказку — персональная аудиосказка для вашего ребёнка',
  description: 'Создайте персональную аудиосказку с именем вашего ребёнка. Ребёнок становится главным героем. Готово за 2 минуты. Стоимость 499 ₽.',
};

// ─── Демо-карточка сказки ────────────────────────────────
function DemoStoryCard() {
  return (
    <div className="relative mx-auto max-w-sm">
      {/* Тень-подложка */}
      <div className="absolute inset-0 translate-y-3 translate-x-2 rounded-3xl bg-violet-200/50 blur-sm" />

      <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        {/* Обложка */}
        <div className="relative h-52 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-400 overflow-hidden">
          {/* Декоративные элементы */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-6 text-5xl">🌙</div>
            <div className="absolute top-8 right-8 text-3xl">⭐</div>
            <div className="absolute bottom-6 left-10 text-3xl">✨</div>
            <div className="absolute bottom-8 right-6 text-4xl">🐉</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 p-5 w-full">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Персональная сказка</p>
            <h3 className="font-serif text-xl text-white font-bold leading-tight">
              Артём и Лунный Дракон
            </h3>
          </div>
          {/* Бейдж */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs px-2.5 py-1 rounded-full">
            ✨ Только для Артёма
          </div>
        </div>

        {/* Контент карточки */}
        <div className="p-5">
          {/* Превью текста */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
            В далёком городе, где дома строят из облаков, жил мальчик по имени Артём.
            Однажды ночью он увидел в окне огромного дракона с серебряными крыльями...
          </p>

          {/* Аудиоплеер-заглушка */}
          <div className="flex items-center gap-3 bg-violet-50 rounded-2xl p-3 mb-4">
            <button className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <div className="flex-1">
              <div className="h-1.5 bg-violet-200 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-violet-500 rounded-full" />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">0:42</span>
                <span className="text-xs text-gray-400">3:18</span>
              </div>
            </div>
          </div>

          {/* Бейджи */}
          <div className="flex gap-2 flex-wrap">
            {['📖 Полный текст', '🎧 Аудиосказка', '🎨 Обложка'].map(b => (
              <span key={b} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Плавающая оценка */}
      <div className="absolute -bottom-3 -right-3 bg-white shadow-lg border border-gray-100 rounded-2xl px-3 py-2 flex items-center gap-1.5">
        <span className="text-yellow-400 text-sm">★★★★★</span>
        <span className="text-xs text-gray-600 font-medium">4.9</span>
      </div>
    </div>
  );
}

// ─── Статистика ────────────────────────────────────────────
function Stats() {
  const items = [
    { value: '2 000+', label: 'сказок создано' },
    { value: '4.9', label: 'средняя оценка' },
    { value: '2 мин', label: 'время создания' },
  ];
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="text-center">
          <p className="text-xl sm:text-2xl font-bold text-violet-700">{item.value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Преимущества ───────────────────────────────────────────
const BENEFITS = [
  {
    icon: '👦',
    title: 'Ребёнок — главный герой',
    desc: 'Имя вашего ребёнка вплетено в каждую страницу. Он услышит собственное имя в сказке.',
  },
  {
    icon: '🎧',
    title: 'Готовая аудиоверсия',
    desc: 'Профессиональная озвучка. Просто нажмите Play перед сном.',
  },
  {
    icon: '📖',
    title: 'Полный текст сказки',
    desc: 'Красиво оформленный текст. Читайте вместе или дайте ребёнку самому.',
  },
  {
    icon: '✨',
    title: 'Уникальный сюжет',
    desc: 'Каждая сказка создаётся заново. Никаких шаблонов и повторений.',
  },
];

// ─── Шаги ───────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    title: 'Введите имя ребёнка',
    desc: 'Укажите имя и возраст — сказка будет написана именно для него.',
    icon: '✏️',
  },
  {
    num: '02',
    title: 'Выберите героев',
    desc: 'Дракон, робот, принцесса или единорог — выберите любимых персонажей.',
    icon: '🐉',
  },
  {
    num: '03',
    title: 'Получите сказку',
    desc: 'Через 2 минуты готовы: текст, аудио и красивая обложка.',
    icon: '🎁',
  },
];

// ─── Отзывы ─────────────────────────────────────────────────
const REVIEWS = [
  {
    name: 'Анна К.',
    text: 'Сын был в восторге! Услышал своё имя и просил переслушать три раза подряд.',
    stars: 5,
    child: 'Сын, 5 лет',
  },
  {
    name: 'Мария Т.',
    text: 'Отличная идея для подарка. Записала дочке сказку на день рождения — она до сих пор слушает.',
    stars: 5,
    child: 'Дочь, 7 лет',
  },
  {
    name: 'Дмитрий В.',
    text: 'Простой процесс, красивый результат. Теперь вместо мультиков — сказка перед сном.',
    stars: 5,
    child: 'Сын, 4 года',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-gray-900">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-serif text-lg font-bold text-violet-700 flex items-center gap-1.5">
            <span className="text-xl">✨</span> Расскажи Сказку
          </div>
          <Link href="/create"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
            Создать сказку
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-20 sm:pt-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Текст */}
          <div className="flex-1 text-center lg:text-left">
            {/* Бейдж */}
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-violet-100">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Более 2 000 сказок создано
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
              Сказка, где главный герой —
              <span className="text-violet-600"> ваш ребёнок</span>
            </h1>

            <p className="text-gray-500 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Персональная аудиосказка с именем ребёнка.
              Уникальный сюжет, профессиональная озвучка.
              Готово за 2 минуты.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <Link href="/create"
                className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-violet-200 active:scale-95">
                <span>✨</span> Создать сказку
              </Link>
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <span className="text-amber-400">★★★★★</span>
                <span>4.9 · 499 ₽</span>
              </div>
            </div>

            {/* Micro-benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-gray-400">
              {['✓ Текст + аудио', '✓ Красивая обложка', '✓ Без подписок'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          {/* Карточка */}
          <div className="flex-shrink-0 w-full max-w-xs lg:max-w-sm">
            <DemoStoryCard />
          </div>
        </div>
      </section>

      {/* ── СТАТИСТИКА ─────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Stats />
        </div>
      </section>

      {/* ── ПРЕИМУЩЕСТВА ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Что входит в сказку
          </h2>
          <p className="text-gray-400 text-lg">Всё что нужно для волшебного вечера</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BENEFITS.map((b, i) => (
            <div key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all group">
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="font-semibold text-gray-900 text-base mb-2 group-hover:text-violet-700 transition-colors">
                {b.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── КАК ЭТО РАБОТАЕТ ───────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Как это работает
            </h2>
            <p className="text-gray-400 text-lg">Три простых шага до готовой сказки</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center">
                {/* Линия между шагами */}
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] right-0 h-px border-t-2 border-dashed border-gray-200" />
                )}

                <div className="relative inline-flex">
                  <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-3xl mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПРИМЕР СКАЗКИ ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Пример готовой сказки
          </h2>
          <p className="text-gray-400 text-lg">Вот что получат родители после оплаты</p>
        </div>

        {/* Большая демо-карточка */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl mx-auto">
          {/* Обложка */}
          <div className="relative h-48 sm:h-64 bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500">
            <div className="absolute inset-0 opacity-20 text-6xl flex items-center justify-around pt-4">
              <span>🌙</span><span>🐉</span><span>⭐</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 p-6 w-full">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Создано для</p>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold">Артём и Лунный Дракон</h3>
            </div>
          </div>

          {/* Текст */}
          <div className="p-6">
            <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
              В далёком городе, где дома строят из облаков, жил мальчик по имени{' '}
              <strong className="text-violet-700">Артём</strong>. Он был самым любопытным ребёнком
              во всём квартале — всегда смотрел на звёзды и мечтал о настоящих приключениях.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
              Однажды ночью, когда луна была особенно яркой, <strong className="text-violet-700">Артём</strong> услышал
              тихий шорох за окном. Он выглянул — и увидел огромного дракона с серебряными крыльями,
              который смотрел прямо на него добрыми золотыми глазами...
            </p>

            {/* Размытый текст — намёк на paywall */}
            <div className="relative">
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base blur-sm select-none">
                — Не бойся, — сказал дракон тихим голосом, похожим на шелест ветра. — Я искал
                именно тебя, Артём. У меня есть для тебя важное задание, которое может спасти весь
                звёздный лес...
              </p>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white flex items-end justify-center pb-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <span>🔒</span> Продолжение после оплаты
                </div>
              </div>
            </div>
          </div>

          {/* Аудиоплеер */}
          <div className="border-t border-gray-100 p-5 bg-gray-50">
            <div className="flex items-center gap-4">
              <button className="w-11 h-11 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Сказка про Артёма</span>
                  <span>0:30 / 3:18</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/6 bg-violet-500 rounded-full" />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">🔒 Полная версия — после оплаты</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ОТЗЫВЫ ─────────────────────────────────────────── */}
      <section className="bg-violet-50 border-y border-violet-100 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Что говорят родители
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({length: r.stars}).map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-bold">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.child}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ФИНАЛЬНЫЙ CTA ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-10 sm:p-16 relative overflow-hidden">
          {/* Декор */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-10">
            {['✨','⭐','🌟','💫'].map((s, i) => (
              <span key={i} className="absolute text-4xl"
                style={{ top:`${[15,70,40,80][i]}%`, left:`${[10,20,80,70][i]}%` }}>{s}</span>
            ))}
          </div>

          <div className="relative z-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              Подарите ребёнку его собственную сказку
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
              Текст, аудио и обложка. Всего за 499 ₽.
            </p>

            <Link href="/create"
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold text-lg px-10 py-4 rounded-2xl hover:shadow-xl transition-all hover:scale-105 active:scale-95">
              <span>✨</span> Создать сказку
            </Link>

            <p className="text-white/50 text-sm mt-4">
              Готово за 2 минуты · Оплата через ЮКасса · Навсегда ваша
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-serif text-base font-bold text-violet-700 flex items-center gap-1.5">
            <span>✨</span> Расскажи Сказку
          </div>
          <div className="flex gap-5 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Конфиденциальность</Link>
            <a href="mailto:hello@rasskaji-skazku.ru" className="hover:text-gray-600 transition-colors">Контакты</a>
          </div>
          <p className="text-xs text-gray-300">© {new Date().getFullYear()} Расскажи Сказку</p>
        </div>
      </footer>
    </div>
  );
}