import type { Metadata } from 'next';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rasskaji-skazku.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Расскажи Сказку — персональная аудиосказка для вашего ребёнка',
    template: '%s | Расскажи Сказку',
  },
  description: 'Создайте персональную аудиосказку с именем вашего ребёнка за 2 минуты. Ребёнок становится главным героем. 499 ₽.',
  keywords: ['сказки для детей', 'персональная сказка', 'аудиосказка', 'сказка с именем ребёнка'],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: APP_URL,
    siteName: 'Расскажи Сказку',
    title: 'Расскажи Сказку — персональная аудиосказка для вашего ребёнка',
    description: 'Персональная аудиосказка с именем ребёнка. Готово за 2 минуты. 499 ₽.',
    images: [{ url: '/og-default.svg', width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}