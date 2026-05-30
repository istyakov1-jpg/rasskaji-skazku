import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Админка', template: '%s | Админка' },
  robots: 'noindex,nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {children}
    </div>
  );
}