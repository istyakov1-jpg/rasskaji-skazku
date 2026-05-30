'use client';

import { useEffect } from 'react';
import StoryResult from '@/components/StoryResult';
import { Story } from '@/lib/supabase';

interface Props { story: Story; }

export default function StoryPageClient({ story }: Props) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'page_view', story_slug: story.slug }),
    }).catch(() => {});
  }, [story.slug]);

  return (
    <div className="max-w-2xl mx-auto">
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
    </div>
  );
}