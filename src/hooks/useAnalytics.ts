import { useCallback, useEffect } from 'react';
import type { AnalyticsEvent } from '../types';
import { supabase } from '../lib/supabase';
import { getOrCreateDeviceInfo } from '../lib/device';

const ANALYTICS_KEY = 'pvf_analytics_v1';
const PENDING_SYNC_KEY = 'pvf_pending_sync_v1';
const SESSION_ID_KEY = 'pvf_session_id';

// Get or create session ID (persists for browser session)
const getSessionId = (): string => {
  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch (error) {
    console.error('Failed to get session ID:', error);
    return 'session_' + Date.now();
  }
};

// Load events from localStorage (for offline access)
const loadEvents = (): AnalyticsEvent[] => {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load analytics:', error);
    return [];
  }
};

// Save events to localStorage (for offline access)
const saveEvents = (events: AnalyticsEvent[]): void => {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save analytics:', error);
  }
};

// Load pending sync events
const loadPendingSync = (): AnalyticsEvent[] => {
  try {
    const data = localStorage.getItem(PENDING_SYNC_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load pending sync:', error);
    return [];
  }
};

// Save pending sync events
const savePendingSync = (events: AnalyticsEvent[]): void => {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save pending sync:', error);
  }
};

// Initialize events from localStorage
let events: AnalyticsEvent[] = loadEvents();

// Sync pending events to Supabase
const syncToSupabase = async (): Promise<void> => {
  const pendingEvents = loadPendingSync();
  if (pendingEvents.length === 0) return;

  const deviceInfo = getOrCreateDeviceInfo();
  const sessionId = getSessionId();

  try {
    // Map to database format
    const rows = pendingEvents.map(event => ({
      session_id: sessionId,
      user_id: event.userId,
      device_fingerprint: deviceInfo.deviceFingerprint,
      framework: event.framework,
      word_id: event.wordId,
      event: event.event,
      meta: {
        ...event.meta,
        device: deviceInfo,
        timestamp: event.ts,
      },
    }));

    const { error } = await supabase
      .from('analytics_events')
      .insert(rows);

    if (error) {
      console.error('Failed to sync to Supabase:', error);
      return;
    }

    // Clear pending sync on success
    savePendingSync([]);

    if (import.meta.env && import.meta.env.DEV) {
      console.log('[Analytics] Synced', rows.length, 'events to Supabase');
    }
  } catch (error) {
    console.error('Failed to sync to Supabase:', error);
  }
};

export const useAnalytics = () => {
  // Sync pending events on mount
  useEffect(() => {
    syncToSupabase();

    // Sync every 30 seconds
    const interval = setInterval(syncToSupabase, 30000);
    return () => clearInterval(interval);
  }, []);

  const log = useCallback(async (event: Omit<AnalyticsEvent, 'ts' | 'userId'>) => {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      ts: Date.now(),
      userId: 'demo-user', // Static user for prototype
    };

    // Save to local storage immediately (offline-first)
    events.push(analyticsEvent);
    saveEvents(events);

    // Add to pending sync queue
    const pending = loadPendingSync();
    pending.push(analyticsEvent);
    savePendingSync(pending);

    // Try to sync immediately
    syncToSupabase();

    // Log to console in development
    if (import.meta.env && import.meta.env.DEV) {
      console.log('[Analytics]', analyticsEvent);
    }
  }, []);

  const getEvents = useCallback(async () => {
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch from Supabase:', error);
        // Fall back to localStorage
        events = loadEvents();
        return events;
      }

      // Map from database format to AnalyticsEvent
      const fetchedEvents: AnalyticsEvent[] = (data || []).map(row => ({
        framework: row.framework,
        wordId: row.word_id,
        event: row.event,
        ts: row.meta?.timestamp || new Date(row.created_at).getTime(),
        userId: row.user_id,
        meta: row.meta,
      }));

      // Update local cache
      events = fetchedEvents;
      saveEvents(events);

      return fetchedEvents;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fall back to localStorage
      events = loadEvents();
      return events;
    }
  }, []);

  const getEventsByFramework = useCallback(async (framework: string) => {
    const allEvents = await getEvents();
    return allEvents.filter((e) => e.framework === framework);
  }, [getEvents]);

  const getEventsByWord = useCallback(async (wordId: string) => {
    const allEvents = await getEvents();
    return allEvents.filter((e) => e.wordId === wordId);
  }, [getEvents]);

  const clearEvents = useCallback(async () => {
    try {
      // Clear from Supabase
      const { error } = await supabase
        .from('analytics_events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        console.error('Failed to clear Supabase:', error);
      }
    } catch (error) {
      console.error('Failed to clear events:', error);
    }

    // Clear local storage
    events = [];
    saveEvents(events);
    savePendingSync([]);
  }, []);

  return {
    log,
    getEvents,
    getEventsByFramework,
    getEventsByWord,
    clearEvents,
  };
};

// Export for direct access in pages
export const getAllEvents = async (): Promise<AnalyticsEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch from Supabase:', error);
      return loadEvents();
    }

    const fetchedEvents: AnalyticsEvent[] = (data || []).map(row => ({
      framework: row.framework,
      wordId: row.word_id,
      event: row.event,
      ts: row.meta?.timestamp || new Date(row.created_at).getTime(),
      userId: row.user_id,
      meta: row.meta,
    }));

    saveEvents(fetchedEvents);
    return fetchedEvents;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return loadEvents();
  }
};

export const clearAllEvents = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Failed to clear Supabase:', error);
    }
  } catch (error) {
    console.error('Failed to clear events:', error);
  }

  const events: AnalyticsEvent[] = [];
  saveEvents(events);
  savePendingSync([]);
};
