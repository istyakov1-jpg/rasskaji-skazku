// ────────────────────────────────────────────────────────────
// ПЕРСОНАЖИ
// ────────────────────────────────────────────────────────────

export const CHARACTERS = [
  { id: 'dragon',    emoji: '🐉', name: 'Дракон' },
  { id: 'robot',     emoji: '🤖', name: 'Робот' },
  { id: 'princess',  emoji: '👸', name: 'Принцесса' },
  { id: 'unicorn',   emoji: '🦄', name: 'Единорог' },
  { id: 'dinosaur',  emoji: '🦕', name: 'Динозавр' },
  { id: 'rabbit',    emoji: '🐰', name: 'Зайчик' },
  { id: 'astronaut', emoji: '👨‍🚀', name: 'Космонавт' },
  { id: 'fairy',     emoji: '🧚', name: 'Фея' },
  { id: 'bear',      emoji: '🐻', name: 'Мишка' },
] as const;

export type CharacterId = typeof CHARACTERS[number]['id'];

// ────────────────────────────────────────────────────────────
// ТЕМЫ / МОРАЛИ
// ────────────────────────────────────────────────────────────

export const MORALS = [
  { id: 'friendship', label: 'Дружба',              desc: 'Настоящий друг всегда рядом',       emoji: '🤝' },
  { id: 'bravery',    label: 'Смелость',             desc: 'Страх можно победить',              emoji: '🦁' },
  { id: 'honesty',    label: 'Честность',            desc: 'Правда всегда побеждает',           emoji: '💎' },
  { id: 'care',       label: 'Забота',               desc: 'Помогать другим — это здорово',     emoji: '💛' },
  { id: 'confidence', label: 'Уверенность в себе',   desc: 'Ты можешь всё, что захочешь',       emoji: '⭐' },
  { id: 'persistence',label: 'Не сдаваться',         desc: 'Упорство приводит к победе',        emoji: '🏆' },
] as const;

export type MoralId = typeof MORALS[number]['id'];

// Для API — плоский список меток (обратная совместимость)
export const MORAL_LABELS = MORALS.map(m => m.label);

// ────────────────────────────────────────────────────────────
// ВОЗРАСТ
// ────────────────────────────────────────────────────────────

export const AGE_GROUPS = [
  { id: '2-4', label: '2–4 года',  hint: 'Совсем маленький' },
  { id: '5-7', label: '5–7 лет',   hint: 'Дошкольник' },
  { id: '8-10', label: '8–10 лет', hint: 'Младший школьник' },
] as const;

// ────────────────────────────────────────────────────────────
// ФИЛЬТР НЕЖЕЛАТЕЛЬНЫХ СЛОВ
// ────────────────────────────────────────────────────────────

const BAD_WORDS = [
  'хуй','пизд','ебл','еба','ёба','блять','блядь','сука','мудак',
  'пидор','пидар','залупа','шлюха','ёбан','жопа',
  'cock','fuck','shit','bitch','ass','dick','cunt',
];

export function containsProfanity(text: string): boolean {
  const n = text.toLowerCase();
  return BAD_WORDS.some(w => n.includes(w));
}

// ────────────────────────────────────────────────────────────
// SLUG
// ────────────────────────────────────────────────────────────

export function generateSlug(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}