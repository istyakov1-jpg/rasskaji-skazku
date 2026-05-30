import { EXAMPLE_STORIES } from '@/lib/constants';

export default function ExampleStories() {
  return (
    <section className="max-w-4xl mx-auto mt-16 mb-12">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl text-fairy-purple-700 mb-2">
          Примеры сказок
        </h2>
        <p className="text-fairy-purple-400">
          Посмотрите, какие истории создаёт наш сервис
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {EXAMPLE_STORIES.map(story => (
          <div
            key={story.id}
            className="fairy-card hover:shadow-fairy-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            {/* Эмодзи персонажей */}
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {story.emoji}
            </div>

            {/* Заголовок */}
            <h3 className="font-serif text-xl text-fairy-purple-700 mb-1">
              Сказка про {story.childName}
            </h3>

            {/* Теги */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {story.characters.map(char => (
                <span
                  key={char}
                  className="text-xs bg-fairy-purple-50 text-fairy-purple-500 px-2 py-0.5 rounded-full"
                >
                  {char}
                </span>
              ))}
              <span className="text-xs bg-fairy-gold-100 text-fairy-gold-700 px-2 py-0.5 rounded-full">
                {story.moral}
              </span>
            </div>

            {/* Превью текста */}
            <p className="text-fairy-purple-500 text-sm leading-relaxed line-clamp-3">
              {story.preview}
            </p>

            <div className="mt-3 pt-3 border-t border-fairy-purple-50 flex items-center gap-1 text-xs text-fairy-purple-300">
              <span>✨</span>
              <span>Персонализированная сказка</span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-8">
        <p className="text-fairy-purple-500 text-sm">
          🌟 Каждая сказка уникальна и создаётся специально для вашего ребёнка
        </p>
      </div>
    </section>
  );
}
