import { useCallback } from 'react';
import type { AnalyticsEvent } from '../types';

const ANALYTICS_KEY = 'pvf_analytics_v1';

// Load events from localStorage
const loadEvents = (): AnalyticsEvent[] => {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load analytics:', error);
    return [];
  }
};

// Save events to localStorage
const saveEvents = (events: AnalyticsEvent[]): void => {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save analytics:', error);
  }
};

// Initialize events from localStorage
let events: AnalyticsEvent[] = loadEvents();

export const useAnalytics = () => {
  const log = useCallback((event: Omit<AnalyticsEvent, 'ts' | 'userId'>) => {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      ts: Date.now(),
      userId: 'demo-user', // Static user for prototype
    };

    events.push(analyticsEvent);
    saveEvents(events);

    // Log to console in development
    if (import.meta.env && import.meta.env.DEV) {
      console.log('[Analytics]', analyticsEvent);
    }
  }, []);

  const getEvents = useCallback(() => {
    // Reload from localStorage to get latest data
    events = loadEvents();
    return events;
  }, []);

  const getEventsByFramework = useCallback((framework: string) => {
    events = loadEvents();
    return events.filter((e) => e.framework === framework);
  }, []);

  const getEventsByWord = useCallback((wordId: string) => {
    events = loadEvents();
    return events.filter((e) => e.wordId === wordId);
  }, []);

  const clearEvents = useCallback(() => {
    events = [];
    saveEvents(events);
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
export const getAllEvents = () => {
  return loadEvents();
};

export const clearAllEvents = () => {
  const events: AnalyticsEvent[] = [];
  saveEvents(events);
};
