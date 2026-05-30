import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getServiceSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export type Story = {
  id: string;
  slug: string;
  child_name: string;
  characters: string[];
  moral: string;
  wishes?: string | null;
  story_text: string;
  tts_task_id?: string | null;
  tts_url?: string | null;
  illustration_url?: string | null;
  illustration_prompt?: string | null;
  share_count?: number;
  created_at: string;
};