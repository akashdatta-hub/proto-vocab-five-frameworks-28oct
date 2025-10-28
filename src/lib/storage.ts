import type { FeedbackItem } from '../data/feedback';

const KEY = "pvf_feedback_v1";

export const loadFeedback = (): FeedbackItem[] => {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load feedback:', error);
    return [];
  }
};

export const saveFeedback = (items: FeedbackItem[]): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save feedback:', error);
  }
};

export const mergeFeedback = (current: FeedbackItem[], incoming: FeedbackItem[]): FeedbackItem[] => {
  const byId = new Map(current.map(i => [i.id, i]));
  for (const item of incoming) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values()).sort((a, b) => b.ts - a.ts);
};

export const addFeedbackItem = (item: FeedbackItem): void => {
  const current = loadFeedback();
  const updated = [...current, item];
  saveFeedback(updated);
};

export const clearFeedback = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch (error) {
    console.error('Failed to clear feedback:', error);
  }
};

export const exportFeedback = (): string => {
  const items = loadFeedback();
  return JSON.stringify(items, null, 2);
};

export const importFeedback = (jsonString: string): { success: boolean; count: number; error?: string } => {
  try {
    const incoming = JSON.parse(jsonString) as FeedbackItem[];
    if (!Array.isArray(incoming)) {
      return { success: false, count: 0, error: 'Invalid format: expected array' };
    }

    const current = loadFeedback();
    const merged = mergeFeedback(current, incoming);
    saveFeedback(merged);

    return { success: true, count: incoming.length };
  } catch (error) {
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
