import type { Metadata } from 'next';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rasskaji-skazku.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Расскажи Сказку — персонализированные сказки для детей',
    template: '%s | Расскажи Сказку',
  },
  description:
    'Создайте персонализированную сказку для своего ребёнка за 20 секунд! Введите имя, выберите персонажей и получите уникальную историю с озвучкой.',
  keywords: ['сказки для детей', 'персонализированная сказка', 'сказка онлайн', 'детские истории', 'сказка с именем'],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: APP_URL,
    siteName: 'Расскажи Сказку',
    title: 'Расскажи Сказку — персонализированные сказки для детей',
    description: 'Создайте персонализированную сказку для своего ребёнка за 20 секунд!',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Расскажи Сказку',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Расскажи Сказку',
    description: 'Персонализированные сказки для детей за 20 секунд',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

// Декоративные звёздочки (рендерится один раз на сервере)
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: `${Math.floor((i * 37 + 11) % 100)}%`,
  left: `${Math.floor((i * 53 + 7) % 100)}%`,
  duration: `${2 + (i % 4)}s`,
  delay: `${(i * 0.3) % 3}s`,
  size: i % 3 === 0 ? 6 : 4,
}));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="relative min-h-screen">
        {/* Декоративный фон */}
        <div className="stars-bg" aria-hidden="true">
          {STARS.map(star => (
            <div
              key={star.id}
              className="star"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                '--duration': star.duration,
                '--delay': star.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
