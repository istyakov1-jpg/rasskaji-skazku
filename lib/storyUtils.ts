import { CHARACTERS } from './constants';

export interface Scene {
  number: number;
  title: string;
  paragraphs: string[];
}

// Атмосферные названия сцен
const SCENE_TITLES = [
  'Начало истории',
  'Первые приключения',
  'Важный выбор',
  'Испытание',
  'Путь домой',
  'Счастливый финал',
];

export function splitIntoScenes(storyText: string): Scene[] {
  const paragraphs = storyText
    .split(/\n\n+/)
    .map(p => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [];

  // Делим на 3–4 сцены равномерно
  const sceneCount = paragraphs.length <= 4 ? 2 : paragraphs.length <= 8 ? 3 : 4;
  const perScene = Math.ceil(paragraphs.length / sceneCount);

  return Array.from({ length: sceneCount }, (_, i) => ({
    number: i + 1,
    title: SCENE_TITLES[i] ?? `Сцена ${i + 1}`,
    paragraphs: paragraphs.slice(i * perScene, (i + 1) * perScene),
  })).filter(s => s.paragraphs.length > 0);
}

// Персонаж → emoji
export function getCharacterEmoji(name: string): string {
  return CHARACTERS.find(c => c.name === name)?.emoji ?? '✨';
}

// Роли персонажей в истории
const CHARACTER_ROLES = ['Главный герой', 'Верный друг', 'Таинственный помощник', 'Спутник'];

export interface CharacterCard {
  name: string;
  emoji: string;
  role: string;
}

export function buildCharacterCards(characters: string[], childName: string): CharacterCard[] {
  return characters.map((name, i) => ({
    name,
    emoji: getCharacterEmoji(name),
    role: i === 0 ? `Друг ${childName}` : (CHARACTER_ROLES[i] ?? 'Персонаж'),
  }));
}

// Посвящение на основе морали
export function buildDedication(childName: string, moral: string): string {
  const dedications: Record<string, string> = {
    'Добро побеждает зло': `Пусть эта история напомнит тебе, что доброта сильнее любой тьмы. Делай добро — и мир вокруг тебя станет ярче.`,
    'Дружба важна': `Настоящие друзья — это самое большое сокровище на свете. Береги тех, кто рядом, и они всегда поддержат тебя.`,
    'Помогать другим': `Когда помогаешь другим, внутри зажигается маленькое солнышко. Твоя доброта делает мир лучше.`,
    'Не сдаваться': `Даже когда трудно — продолжай идти вперёд. Самые красивые победы достаются тем, кто не останавливается.`,
    'Верить в себя': `В тебе есть всё, что нужно для чудес. Верь в себя — и невозможное станет возможным.`,
    'Беречь природу': `Наша планета — это волшебный дом для всех нас. Береги её, и она ответит тебе красотой и любовью.`,
  };
  return dedications[moral] ?? `Пусть эта история станет маленьким волшебством в твоей жизни.`;
}