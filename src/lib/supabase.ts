import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface AnalyticsEventRow {
  id: string;
  created_at: string;
  session_id: string;
  user_id: string;
  device_fingerprint: string | null;
  framework: string;
  word_id: string;
  event: string;
  meta: Record<string, unknown>;
}

export interface FeedbackRow {
  id: string;
  created_at: string;
  session_id: string;
  user_id: string;
  framework: string;
  word_id: string;
  step_id: string;
  step_label: string;
  thumb: string | null;
  include: boolean | null;
  difficulty: string | null;
  comment: string | null;
  meta: Record<string, unknown>;
}
