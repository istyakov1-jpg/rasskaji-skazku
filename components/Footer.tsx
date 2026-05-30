'use client';

import { useState } from 'react';

export default function Footer() {
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    email: '',
    message: '',
    wantBook: false,
    wantSubscription: false,
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');

    // Для MVP — просто показываем успех.
    // В продакшне подключить Resend, Formspree или другой сервис отправки email.
    await new Promise(r => setTimeout(r, 800));
    setContactStatus('sent');
  };

  return (
    <footer className="mt-20 border-t border-fairy-purple-100 bg-white/40 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Верхняя часть */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          {/* Логотип */}
          <div className="text-center sm:text-left">
            <div className="font-serif text-xl text-fairy-purple-700 flex items-center gap-2">
              <span>🪄</span> Расскажи Сказку
            </div>
            <p className="text-xs text-fairy-purple-400 mt-1">
              Персонализированные сказки для детей
            </p>
          </div>

          {/* Навигация */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-fairy-purple-500">
            <a href="#about" className="hover:text-fairy-purple-700 transition-colors">
              О проекте
            </a>
            <button
              onClick={() => setShowContact(v => !v)}
              className="hover:text-fairy-purple-700 transition-colors"
            >
              Контакты
            </button>
            <a href="/privacy" className="hover:text-fairy-purple-700 transition-colors">
              Конфиденциальность
            </a>
          </nav>
        </div>

        {/* Контактная форма */}
        {showContact && (
          <div className="fairy-card mb-8">
            <h3 className="font-serif text-xl text-fairy-purple-700 mb-4">
              📬 Написать нам
            </h3>

            {contactStatus === 'sent' ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">💌</div>
                <p className="text-fairy-purple-600 font-semibold">Спасибо! Мы получили ваше сообщение.</p>
                <p className="text-fairy-purple-400 text-sm mt-1">Ответим в ближайшее время.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-fairy-purple-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-fairy-purple-100 focus:border-fairy-purple-300 focus:outline-none bg-white/80 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-fairy-purple-700 mb-1">
                    Сообщение
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Ваш вопрос или пожелание..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-fairy-purple-100 focus:border-fairy-purple-300 focus:outline-none bg-white/80 text-sm resize-none"
                  />
                </div>

                {/* Лид-вопросы */}
                <div className="bg-fairy-purple-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-fairy-purple-700 mb-3">
                    🌟 Что вас интересует?
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={contactForm.wantSubscription}
                      onChange={e => setContactForm(f => ({ ...f, wantSubscription: e.target.checked }))}
                      className="w-4 h-4 accent-fairy-purple-500"
                    />
                    <span className="text-sm text-fairy-purple-600">
                      Хочу получать новые сказки на почту
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactForm.wantBook}
                      onChange={e => setContactForm(f => ({ ...f, wantBook: e.target.checked }))}
                      className="w-4 h-4 accent-fairy-purple-500"
                    />
                    <span className="text-sm text-fairy-purple-600">
                      Хочу заказать печатную книгу со сказками
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={contactStatus === 'sending'}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  {contactStatus === 'sending' ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" />
                      </svg>
                      Отправляем...
                    </>
                  ) : (
                    <>📨 Отправить</>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* О проекте */}
        <div id="about" className="bg-fairy-purple-50/60 rounded-2xl p-5 mb-6 text-sm text-fairy-purple-500 leading-relaxed">
          <p>
            <strong className="text-fairy-purple-700">Расскажи Сказку</strong> — сервис генерации
            персонализированных сказок для детей с помощью искусственного интеллекта.
            Каждая история создаётся специально для вашего ребёнка: с его именем, любимыми
            персонажами и важной жизненной ценностью.
          </p>
        </div>

        {/* Нижняя часть */}
        <div className="text-center text-xs text-fairy-purple-300">
          <p>© {new Date().getFullYear()} Расскажи Сказку. Сделано с ❤️ для детей.</p>
          <p className="mt-1">
            Все сгенерированные сказки проходят фильтрацию и безопасны для детей.
          </p>
        </div>
      </div>
    </footer>
  );
}
