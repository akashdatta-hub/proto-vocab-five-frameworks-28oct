import { useCallback } from 'react';
import type { AnalyticsEvent } from '../types';

// In-memory analytics store (ephemeral, resets on refresh)
const events: AnalyticsEvent[] = [];

export const useAnalytics = () => {
  const log = useCallback((event: Omit<AnalyticsEvent, 'ts' | 'userId'>) => {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      ts: Date.now(),
      userId: 'demo-user', // Static user for prototype
    };

    events.push(analyticsEvent);

    // Log to console in development
    if (import.meta.env && import.meta.env.DEV) {
      console.log('[Analytics]', analyticsEvent);
    }
  }, []);

  const getEvents = useCallback(() => events, []);

  const getEventsByFramework = useCallback((framework: string) => {
    return events.filter((e) => e.framework === framework);
  }, []);

  const getEventsByWord = useCallback((wordId: string) => {
    return events.filter((e) => e.wordId === wordId);
  }, []);

  const clearEvents = useCallback(() => {
    events.length = 0;
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
export const getAllEvents = () => events;
export const clearAllEvents = () => {
  events.length = 0;
};
