import { createClient } from '@supabase/supabase-js';

// Hardcoded fallback values
const FALLBACK_URL = 'https://axjvvhpobolvohtgtytm.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4anZ2aHBvYm9sdm9odGd0eXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDE5MzEsImV4cCI6MjA3NzU3NzkzMX0.O5MIarplhSwNfBrFeJ3fqzSoy9dbq5w8UOAs5EQBI5A';

// Use environment variables if available, otherwise use fallbacks
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (envUrl && envUrl !== 'undefined' && envUrl.startsWith('http')) ? envUrl : FALLBACK_URL;
const supabaseAnonKey = (envKey && envKey !== 'undefined' && envKey.length > 20) ? envKey : FALLBACK_KEY;

console.log('[Supabase] Using URL:', supabaseUrl);
console.log('[Supabase] Using Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING');

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
