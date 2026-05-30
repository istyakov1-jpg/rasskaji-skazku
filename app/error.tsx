'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">😔</div>
        <h2 className="font-serif text-3xl text-fairy-purple-700 mb-4">
          Что-то пошло не так
        </h2>
        <p className="text-fairy-purple-400 mb-8">
          Волшебство временно не работает. Попробуйте ещё раз!
        </p>
        <button onClick={reset} className="btn-magic inline-flex items-center gap-2">
          <span>🔄</span>
          Попробовать снова
        </button>
      </div>
    </main>
  );
}
