import type { FeedbackItem } from '../data/feedback';
import { supabase } from './supabase';
import { getOrCreateDeviceInfo } from './device';

const KEY = "pvf_feedback_v1";
const PENDING_SYNC_KEY = "pvf_pending_feedback_v1";

// Load feedback from localStorage (for offline access)
const loadFeedbackLocal = (): FeedbackItem[] => {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load feedback:', error);
    return [];
  }
};

// Save feedback to localStorage (for offline access)
const saveFeedbackLocal = (items: FeedbackItem[]): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save feedback:', error);
  }
};

// Load pending sync feedback
const loadPendingSync = (): FeedbackItem[] => {
  try {
    const data = localStorage.getItem(PENDING_SYNC_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load pending sync:', error);
    return [];
  }
};

// Save pending sync feedback
const savePendingSync = (items: FeedbackItem[]): void => {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save pending sync:', error);
  }
};

// Sync pending feedback to Supabase
const syncToSupabase = async (): Promise<void> => {
  const pendingItems = loadPendingSync();
  if (pendingItems.length === 0) return;

  const deviceInfo = getOrCreateDeviceInfo();

  try {
    // Map to database format
    const rows = pendingItems.map(item => ({
      session_id: item.sessionId,
      user_id: item.userId,
      framework: item.framework,
      word_id: item.wordId,
      step_id: item.stepId,
      step_label: item.stepLabel,
      thumb: item.thumb,
      include: item.include,
      difficulty: item.difficulty,
      comment: item.comment,
      meta: {
        ...item.meta,
        device: deviceInfo,
        timestamp: item.ts,
      },
    }));

    const { error } = await supabase
      .from('feedback')
      .insert(rows);

    if (error) {
      console.error('Failed to sync feedback to Supabase:', error);
      return;
    }

    // Clear pending sync on success
    savePendingSync([]);

    if (import.meta.env && import.meta.env.DEV) {
      console.log('[Feedback] Synced', rows.length, 'items to Supabase');
    }
  } catch (error) {
    console.error('Failed to sync feedback to Supabase:', error);
  }
};

// Start background sync
let syncInterval: NodeJS.Timeout | null = null;

export const startFeedbackSync = (): void => {
  if (syncInterval) return;

  // Sync immediately
  syncToSupabase();

  // Sync every 30 seconds
  syncInterval = setInterval(syncToSupabase, 30000);
};

export const stopFeedbackSync = (): void => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

// Load feedback from Supabase (falls back to localStorage)
export const loadFeedback = async (): Promise<FeedbackItem[]> => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch feedback from Supabase:', error);
      return loadFeedbackLocal();
    }

    const fetchedItems: FeedbackItem[] = (data || []).map(row => ({
      id: row.id,
      ts: row.meta?.timestamp || new Date(row.created_at).getTime(),
      sessionId: row.session_id,
      userId: row.user_id,
      framework: row.framework,
      wordId: row.word_id,
      stepId: row.step_id,
      stepLabel: row.step_label,
      thumb: row.thumb,
      include: row.include,
      difficulty: row.difficulty,
      comment: row.comment,
      meta: row.meta,
    }));

    // Update local cache
    saveFeedbackLocal(fetchedItems);

    return fetchedItems;
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return loadFeedbackLocal();
  }
};

export const saveFeedback = (items: FeedbackItem[]): void => {
  saveFeedbackLocal(items);
};

export const mergeFeedback = (current: FeedbackItem[], incoming: FeedbackItem[]): FeedbackItem[] => {
  const byId = new Map(current.map(i => [i.id, i]));
  for (const item of incoming) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values()).sort((a, b) => b.ts - a.ts);
};

export const addFeedbackItem = (item: FeedbackItem): void => {
  // Add to local storage immediately (offline-first)
  const current = loadFeedbackLocal();
  const updated = [...current, item];
  saveFeedbackLocal(updated);

  // Add to pending sync queue
  const pending = loadPendingSync();
  pending.push(item);
  savePendingSync(pending);

  // Trigger sync
  syncToSupabase();
};

export const clearFeedback = async (): Promise<void> => {
  try {
    // Clear from Supabase
    const { error } = await supabase
      .from('feedback')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Failed to clear Supabase:', error);
    }
  } catch (error) {
    console.error('Failed to clear feedback:', error);
  }

  // Clear local storage
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(PENDING_SYNC_KEY);
  } catch (error) {
    console.error('Failed to clear feedback:', error);
  }
};

export const exportFeedback = async (): Promise<string> => {
  const items = await loadFeedback();
  return JSON.stringify(items, null, 2);
};

export const importFeedback = async (jsonString: string): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const incoming = JSON.parse(jsonString) as FeedbackItem[];
    if (!Array.isArray(incoming)) {
      return { success: false, count: 0, error: 'Invalid format: expected array' };
    }

    const current = await loadFeedback();
    const merged = mergeFeedback(current, incoming);
    saveFeedback(merged);

    // Add to pending sync
    const pending = loadPendingSync();
    pending.push(...incoming);
    savePendingSync(pending);

    // Trigger sync
    syncToSupabase();

    return { success: true, count: incoming.length };
  } catch (error) {
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
