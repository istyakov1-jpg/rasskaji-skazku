import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServiceSupabase, Story } from '@/lib/supabase';
import Footer from '@/components/Footer';
import Link from 'next/link';
import StoryPageClient from './StoryPageClient';

// Отключаем кеширование — страница всегда рендерится свежей
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

async function getStory(slug: string): Promise<Story | null> {
  // Используем service role чтобы гарантированно получить свежие данные
  const db = getServiceSupabase();
  const { data, error } = await db
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Story;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const story = await getStory(params.slug);
  if (!story) return { title: 'Сказка не найдена' };

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
  const title = `Сказка про ${story.child_name}`;
  const description = story.story_text.substring(0, 160) + '...';

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      locale: 'ru_RU',
      url: `${APP_URL}/skazka/${story.slug}`,
      title,
      description,
      images: [{ url: `/og-default.svg`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const story = await getStory(params.slug);
  if (!story) notFound();

  return (
    <main className="min-h-screen px-4 pt-8 pb-4">
      <div className="max-w-2xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-fairy-purple-500 hover:text-fairy-purple-700 transition-colors text-sm font-medium"
        >
          ← Создать свою сказку
        </Link>
      </div>

      <StoryPageClient story={story} />
      <Footer />
    </main>
  );
}