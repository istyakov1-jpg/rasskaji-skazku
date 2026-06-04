'use client';

import { useEffect } from 'react';
import StoryResult from '@/components/StoryResultV2';
import { Story } from '@/lib/supabase';

interface Props { story: Story }

export default function StoryPageClient({ story }: Props) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'page_view', story_slug: story.slug }),
    }).catch(() => {});
  }, [story.slug]);

  // Никакой обёртки с max-width — StoryResult сам управляет раскладкой
  return (
    <StoryResult
      slug={story.slug}
      childName={story.child_name}
      characters={story.characters}
      moral={story.moral}
      storyText={story.story_text}
      initialAudioUrl={story.tts_url}
      initialIllustrationUrl={story.illustration_url}
      onCreateNew={() => { window.location.href = '/'; }}
    />
  );
}