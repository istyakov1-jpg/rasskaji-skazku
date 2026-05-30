import StoryForm from '@/components/StoryForm';
import ExampleStories from '@/components/ExampleStories';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero секция */}
      <section className="px-4 pt-12 pb-6">
        <div className="max-w-2xl mx-auto text-center mb-10">
          {/* Логотип/заголовок */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full shadow-fairy mb-6 text-sm text-fairy-purple-500 font-medium">
            <span className="animate-bounce-slow">🪄</span>
            Волшебный генератор сказок
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-fairy-purple-800 mb-4 leading-tight">
            Расскажи
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fairy-purple-500 to-fairy-pink-500">
              Сказку
            </span>
          </h1>

          <p className="text-fairy-purple-500 text-lg md:text-xl leading-relaxed max-w-lg mx-auto">
            Создайте персонализированную сказку для вашего ребёнка за 20 секунд.
            С его именем, любимыми персонажами и важной ценностью.
          </p>

          {/* Преимущества */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { icon: '⚡', text: '20 секунд' },
              { icon: '🎙️', text: 'Озвучка' },
              { icon: '🔗', text: 'Поделиться' },
              { icon: '🔒', text: 'Безопасно' },
            ].map(item => (
              <div
                key={item.text}
                className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-fairy-purple-600 shadow-sm"
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Форма */}
        <StoryForm />
      </section>

      {/* Примеры сказок */}
      <section className="px-4">
        <ExampleStories />
      </section>

      {/* Как это работает */}
      <section className="px-4 max-w-4xl mx-auto my-12">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl text-fairy-purple-700 mb-2">
            Как это работает
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              icon: '✏️',
              title: 'Заполните форму',
              desc: 'Введите имя ребёнка, выберите персонажей и главную мысль сказки',
            },
            {
              step: '2',
              icon: '🪄',
              title: 'Волшебство!',
              desc: 'AI создаёт уникальную добрую сказку специально для вашего ребёнка',
            },
            {
              step: '3',
              icon: '🎁',
              title: 'Наслаждайтесь',
              desc: 'Читайте, слушайте озвучку и делитесь сказкой с близкими',
            },
          ].map(item => (
            <div key={item.step} className="fairy-card text-center">
              <div className="w-10 h-10 rounded-full bg-fairy-purple-100 text-fairy-purple-600 font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                {item.step}
              </div>
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-serif text-lg text-fairy-purple-700 mb-2">{item.title}</h3>
              <p className="text-fairy-purple-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
