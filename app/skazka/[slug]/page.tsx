import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServiceSupabase, Story } from '@/lib/supabase';
import StoryPageClient from './StoryPageClient';

export const dynamic = 'force-dynamic';

interface PageProps { params: { slug: string } }

async function getStory(slug: string): Promise<Story | null> {
  const db = getServiceSupabase();
  const { data, error } = await db.from('stories').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return data as Story;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const story = await getStory(params.slug);
  if (!story) return { title: 'Сказка не найдена' };
  const title = `Сказка про ${story.child_name}`;
  const description = story.story_text.substring(0, 160) + '...';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
  return {
    title,
    description,
    openGraph: {
      type: 'article', locale: 'ru_RU',
      url: `${APP_URL}/skazka/${story.slug}`,
      title, description,
      images: [{ url: story.illustration_url || '/og-default.svg', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const story = await getStory(params.slug);
  if (!story) notFound();

  // Никаких max-width, padding, margin — StoryResult сам управляет layout
  return <StoryPageClient story={story} />;
}