import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://axjvvhpobolvtohtgtytm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4anZ2aHBvYm9sdm9odGd0eXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDE5MzEsImV4cCI6MjA3NzU3NzkzMX0.O5MIarplhSwNfBrFeJ3fqzSoy9dbq5w8UOAs5EQBI5A';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.error('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
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
