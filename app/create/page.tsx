'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CHARACTERS, MORALS, AGE_GROUPS } from '@/lib/constants';

// ─── Типы ────────────────────────────────────────────────────

interface FormData {
  childName: string;
  ageGroup: string;
  characters: string[];
  moral: string;
}

type Screen = 'form' | 'generating' | 'done';

// ─── Прогресс шагов ──────────────────────────────────────────

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
            i < step ? 'bg-violet-600 text-white' :
            i === step ? 'bg-violet-600 text-white ring-4 ring-violet-100' :
            'bg-gray-100 text-gray-400'
          }`}>
            {i < step ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 w-8 rounded-full transition-all ${i < step ? 'bg-violet-600' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Шаг 1: Имя + возраст ────────────────────────────────────

function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Как зовут вашего ребёнка?
        </h2>
        <p className="text-gray-400">Имя ребёнка станет частью сказки</p>
      </div>

      {/* Имя */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Имя ребёнка</label>
        <input
          type="text"
          value={data.childName}
          onChange={e => onChange({ childName: e.target.value })}
          placeholder="Например, Артём"
          maxLength={30}
          autoFocus
          className="w-full text-lg px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none transition-colors bg-white placeholder:text-gray-300"
        />
      </div>

      {/* Возраст */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Возраст</label>
        <div className="grid grid-cols-3 gap-3">
          {AGE_GROUPS.map(age => (
            <button
              key={age.id}
              type="button"
              onClick={() => onChange({ ageGroup: age.id })}
              className={`flex flex-col items-center py-4 px-3 rounded-2xl border-2 transition-all ${
                data.ageGroup === age.id
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="font-bold text-sm">{age.label}</span>
              <span className="text-xs opacity-70 mt-0.5">{age.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Шаг 2: Персонажи ────────────────────────────────────────

function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const toggle = (name: string) => {
    const chars = data.characters;
    if (chars.includes(name)) {
      onChange({ characters: chars.filter(c => c !== name) });
    } else if (chars.length < 2) {
      onChange({ characters: [...chars, name] });
    } else {
      onChange({ characters: [chars[1], name] });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Выберите персонажей
        </h2>
        <p className="text-gray-400">
          Выберите до 2 героев{' '}
          {data.characters.length > 0 && (
            <span className="text-violet-600 font-medium">· {data.characters.length} выбрано</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {CHARACTERS.map(char => {
          const selected = data.characters.includes(char.name);
          const idx = data.characters.indexOf(char.name);
          return (
            <button
              key={char.id}
              type="button"
              onClick={() => toggle(char.name)}
              className={`relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all active:scale-95 ${
                selected
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
              )}
              <span className="text-3xl sm:text-4xl">{char.emoji}</span>
              <span className={`text-xs font-semibold text-center leading-tight ${selected ? 'text-violet-700' : 'text-gray-600'}`}>
                {char.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Шаг 3: Тема ─────────────────────────────────────────────

function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          О чём будет сказка?
        </h2>
        <p className="text-gray-400">Выберите главную тему истории</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {MORALS.map(moral => (
          <button
            key={moral.id}
            type="button"
            onClick={() => onChange({ moral: moral.label })}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
              data.moral === moral.label
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-2xl flex-shrink-0">{moral.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${data.moral === moral.label ? 'text-violet-700' : 'text-gray-800'}`}>
                {moral.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{moral.desc}</p>
            </div>
            {data.moral === moral.label && (
              <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Экран генерации ─────────────────────────────────────────

const GEN_STEPS = [
  { icon: '✨', text: 'Придумываем сюжет...' },
  { icon: '🐉', text: 'Зовём персонажей...' },
  { icon: '📖', text: 'Пишем историю...' },
  { icon: '🎧', text: 'Готовим озвучку...' },
  { icon: '🎨', text: 'Создаём обложку...' },
];

function GeneratingScreen({ childName }: { childName: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % GEN_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const current = GEN_STEPS[step];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Центральная анимация */}
      <div className="relative mb-10">
        {/* Внешние кольца */}
        <div className="absolute inset-0 -m-8 rounded-full border border-violet-100 animate-ping opacity-30" />
        <div className="absolute inset-0 -m-4 rounded-full border border-violet-200 animate-pulse" />

        {/* Центр */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-200">
          <span
            key={step}
            className="text-4xl transition-all duration-300"
            style={{ animation: 'popIn 0.3s ease-out' }}
          >
            {current.icon}
          </span>
        </div>

        {/* Орбитальные точки */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div key={i}
            className="absolute w-28 h-28 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin"
            style={{ animationDuration: '8s', transform: `translate(-50%,-50%) rotate(${deg}deg)` }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-300 opacity-60" />
          </div>
        ))}
      </div>

      {/* Текст */}
      <h2 className="font-bold text-2xl sm:text-3xl text-gray-900 mb-3">
        Придумываем приключение для{' '}
        <span className="text-violet-600">{childName}</span>
      </h2>

      {/* Текущий шаг */}
      <p
        key={step}
        className="text-gray-400 text-lg mb-8"
        style={{ animation: 'fadeUp 0.4s ease-out' }}
      >
        {current.text}
      </p>

      {/* Шаги-индикаторы */}
      <div className="flex gap-2 mb-8">
        {GEN_STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
            i === step ? 'w-6 bg-violet-600' : i < step ? 'w-3 bg-violet-300' : 'w-3 bg-gray-200'
          }`} />
        ))}
      </div>

      <p className="text-sm text-gray-300">Обычно занимает около 2 минут</p>

      <style jsx>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Основная страница ────────────────────────────────────────

const TOTAL_STEPS = 3;

export default function CreatePage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('form');
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    childName: '',
    ageGroup: '5-7',
    characters: [],
    moral: '',
  });

  const updateForm = (data: Partial<FormData>) => setForm(f => ({ ...f, ...data }));

  // Валидация текущего шага
  const canProceed = () => {
    if (currentStep === 0) return form.childName.trim().length >= 1;
    if (currentStep === 1) return form.characters.length >= 1;
    if (currentStep === 2) return form.moral.length > 0;
    return false;
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setError(null);
    setScreen('generating');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: form.childName.trim(),
          characters: form.characters,
          moral: form.moral,
          ageGroup: form.ageGroup,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка генерации');

      // Переходим на страницу превью
      router.push(`/preview/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
      setScreen('form');
    }
  };

  // Экран генерации
  if (screen === 'generating') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <GeneratingScreen childName={form.childName} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 text-sm">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
            </svg>
            Назад
          </Link>
          <span className="font-serif text-sm font-bold text-violet-700">✨ Расскажи Сказку</span>
          <div className="w-12" />
        </div>
      </header>

      {/* Контент */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Прогресс */}
        <div className="flex items-center justify-between mb-8">
          <StepBar step={currentStep} total={TOTAL_STEPS} />
          <span className="text-sm text-gray-400 ml-4">
            {currentStep + 1} / {TOTAL_STEPS}
          </span>
        </div>

        {/* Шаги */}
        <div className="mb-8">
          {currentStep === 0 && <Step1 data={form} onChange={updateForm} />}
          {currentStep === 1 && <Step2 data={form} onChange={updateForm} />}
          {currentStep === 2 && <Step3 data={form} onChange={updateForm} />}
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        {/* Навигация */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex-shrink-0 px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold hover:border-gray-300 transition-colors"
            >
              ← Назад
            </button>
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 py-4 rounded-2xl bg-violet-600 text-white font-bold text-base hover:bg-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Далее →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="flex-1 py-4 rounded-2xl bg-violet-600 text-white font-bold text-base hover:bg-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>✨</span> Создать сказку
            </button>
          )}
        </div>

        {/* Подсказка под кнопкой */}
        {currentStep === TOTAL_STEPS - 1 && (
          <p className="text-center text-xs text-gray-300 mt-4">
            Займёт ~2 минуты · 499 ₽ после просмотра
          </p>
        )}
      </div>
    </div>
  );
}