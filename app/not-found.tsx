import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 animate-float inline-block">🔮</div>
        <h1 className="font-serif text-4xl text-fairy-purple-700 mb-4">
          Сказка не найдена
        </h1>
        <p className="text-fairy-purple-400 mb-8 leading-relaxed">
          Кажется, эта история затерялась в волшебном лесу.
          Попробуйте создать новую сказку!
        </p>
        <Link href="/" className="btn-magic inline-flex items-center gap-2">
          <span>🪄</span>
          Создать сказку
        </Link>
      </div>
    </main>
  );
}
