import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-fairy-purple-500 hover:text-fairy-purple-700 text-sm mb-8">
          ← На главную
        </Link>

        <div className="fairy-card">
          <h1 className="font-serif text-3xl text-fairy-purple-700 mb-6">
            Политика конфиденциальности
          </h1>

          <div className="prose prose-sm text-fairy-purple-600 space-y-4">
            <p className="text-sm text-fairy-purple-400">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>

            <h2 className="font-serif text-xl text-fairy-purple-700">Какие данные мы собираем</h2>
            <p>
              Для создания сказки мы используем: имя ребёнка, выбранных персонажей,
              главную мысль и дополнительные пожелания. Эти данные хранятся для того,
              чтобы вы могли делиться сказкой по ссылке.
            </p>

            <h2 className="font-serif text-xl text-fairy-purple-700">IP-адреса</h2>
            <p>
              Мы временно сохраняем IP-адреса для защиты от злоупотреблений
              (не более 10 сказок в час с одного адреса). Эти данные автоматически
              удаляются через 2 часа.
            </p>

            <h2 className="font-serif text-xl text-fairy-purple-700">Передача данных третьим лицам</h2>
            <p>
              Текст сказки передаётся в сервисы генерации AI (через KIE.AI) для создания
              истории и озвучки. Мы не продаём и не передаём ваши данные третьим лицам
              в маркетинговых целях.
            </p>

            <h2 className="font-serif text-xl text-fairy-purple-700">Хранение данных</h2>
            <p>
              Сгенерированные сказки хранятся для обеспечения работы ссылок-шеринга.
              Вы можете запросить удаление вашей сказки, написав нам на email.
            </p>

            <h2 className="font-serif text-xl text-fairy-purple-700">Безопасность детей</h2>
            <p>
              Все сгенерированные сказки проходят фильтрацию на безопасность контента.
              Мы не собираем данные о детях — только имя, которое вы сами вводите.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
