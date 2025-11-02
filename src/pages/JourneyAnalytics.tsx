import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface JourneyStats {
  totalEvents: number;
  uniqueSessions: number;
  completionRate: number;
  avgStepsPerSession: number;
}

interface EventTypeData {
  eventType: string;
  occurrences: number;
  uniqueSessions: number;
  percentage: number;
}

interface FunnelData {
  stage: string;
  sessions: number;
  percentage: number;
}

interface FrameworkData {
  framework: string;
  sessions: number;
  totalEvents: number;
  completions: number;
  completionRate: number;
}

interface WordData {
  wordId: string;
  sessions: number;
  totalEvents: number;
  completions: number;
  completionRate: number;
}

interface DeviceData {
  deviceType: string;
  browser: string;
  os: string;
  sessions: number;
  totalEvents: number;
}

interface JourneySequence {
  sessionId: string;
  framework: string;
  wordId: string;
  eventSequence: string[];
  eventCount: number;
  journeyStart: string;
  journeyEnd: string;
  durationSeconds: number;
}

export const JourneyAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [eventTypes, setEventTypes] = useState<EventTypeData[]>([]);
  const [funnel, setFunnel] = useState<FunnelData[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkData[]>([]);
  const [words, setWords] = useState<WordData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [sequences, setSequences] = useState<JourneySequence[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOverviewStats(),
        loadEventTypes(),
        loadFunnel(),
        loadFrameworks(),
        loadWords(),
        loadDevices(),
        loadSequences(),
      ]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewStats = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('session_id, event');

    if (error || !data) return;

    const uniqueSessions = new Set(data.map(e => e.session_id)).size;
    const completions = data.filter(e => e.event === 'complete_word').length;
    const starts = data.filter(e => e.event === 'start_word').length;

    // Calculate avg steps per session
    const sessionSteps = new Map<string, number>();
    data.forEach(e => {
      if (['start_word', 'complete_step', 'complete_word'].includes(e.event)) {
        sessionSteps.set(e.session_id, (sessionSteps.get(e.session_id) || 0) + 1);
      }
    });
    const avgSteps = sessionSteps.size > 0
      ? Array.from(sessionSteps.values()).reduce((a, b) => a + b, 0) / sessionSteps.size
      : 0;

    setStats({
      totalEvents: data.length,
      uniqueSessions,
      completionRate: starts > 0 ? (completions / starts) * 100 : 0,
      avgStepsPerSession: avgSteps,
    });
  };

  const loadEventTypes = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event, session_id');

    if (error || !data) return;

    const eventMap = new Map<string, { count: number; sessions: Set<string> }>();
    data.forEach(e => {
      if (!eventMap.has(e.event)) {
        eventMap.set(e.event, { count: 0, sessions: new Set() });
      }
      const item = eventMap.get(e.event)!;
      item.count++;
      item.sessions.add(e.session_id);
    });

    const total = data.length;
    const types: EventTypeData[] = Array.from(eventMap.entries()).map(([eventType, { count, sessions }]) => ({
      eventType,
      occurrences: count,
      uniqueSessions: sessions.size,
      percentage: (count / total) * 100,
    }));

    types.sort((a, b) => b.occurrences - a.occurrences);
    setEventTypes(types);
  };

  const loadFunnel = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('session_id, event');

    if (error || !data) return;

    const started = new Set(data.filter(e => e.event === 'start_word').map(e => e.session_id));
    const progressed = new Set(data.filter(e => e.event === 'complete_step').map(e => e.session_id));
    const completed = new Set(data.filter(e => e.event === 'complete_word').map(e => e.session_id));

    const funnelData: FunnelData[] = [
      { stage: 'Started', sessions: started.size, percentage: 100 },
      { stage: 'Progressed', sessions: progressed.size, percentage: started.size > 0 ? (progressed.size / started.size) * 100 : 0 },
      { stage: 'Completed', sessions: completed.size, percentage: started.size > 0 ? (completed.size / started.size) * 100 : 0 },
    ];

    setFunnel(funnelData);
  };

  const loadFrameworks = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('framework, session_id, event');

    if (error || !data) return;

    const frameworkMap = new Map<string, { sessions: Set<string>; events: number; completions: Set<string> }>();
    data.forEach(e => {
      if (!frameworkMap.has(e.framework)) {
        frameworkMap.set(e.framework, { sessions: new Set(), events: 0, completions: new Set() });
      }
      const item = frameworkMap.get(e.framework)!;
      item.sessions.add(e.session_id);
      item.events++;
      if (e.event === 'complete_word') {
        item.completions.add(e.session_id);
      }
    });

    const frameworkData: FrameworkData[] = Array.from(frameworkMap.entries()).map(([framework, { sessions, events, completions }]) => ({
      framework,
      sessions: sessions.size,
      totalEvents: events,
      completions: completions.size,
      completionRate: sessions.size > 0 ? (completions.size / sessions.size) * 100 : 0,
    }));

    frameworkData.sort((a, b) => b.sessions - a.sessions);
    setFrameworks(frameworkData);
  };

  const loadWords = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('word_id, session_id, event');

    if (error || !data) return;

    const wordMap = new Map<string, { sessions: Set<string>; events: number; completions: Set<string> }>();
    data.forEach(e => {
      if (!wordMap.has(e.word_id)) {
        wordMap.set(e.word_id, { sessions: new Set(), events: 0, completions: new Set() });
      }
      const item = wordMap.get(e.word_id)!;
      item.sessions.add(e.session_id);
      item.events++;
      if (e.event === 'complete_word') {
        item.completions.add(e.session_id);
      }
    });

    const wordData: WordData[] = Array.from(wordMap.entries()).map(([wordId, { sessions, events, completions }]) => ({
      wordId,
      sessions: sessions.size,
      totalEvents: events,
      completions: completions.size,
      completionRate: sessions.size > 0 ? (completions.size / sessions.size) * 100 : 0,
    }));

    wordData.sort((a, b) => b.sessions - a.sessions);
    setWords(wordData);
  };

  const loadDevices = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('meta, session_id');

    if (error || !data) return;

    const deviceMap = new Map<string, { sessions: Set<string>; events: number }>();
    data.forEach(e => {
      if (e.meta?.device) {
        const key = `${e.meta.device.deviceType || 'unknown'}|${e.meta.device.browser || 'unknown'}|${e.meta.device.os || 'unknown'}`;
        if (!deviceMap.has(key)) {
          deviceMap.set(key, { sessions: new Set(), events: 0 });
        }
        const item = deviceMap.get(key)!;
        item.sessions.add(e.session_id);
        item.events++;
      }
    });

    const deviceData: DeviceData[] = Array.from(deviceMap.entries()).map(([key, { sessions, events }]) => {
      const [deviceType, browser, os] = key.split('|');
      return { deviceType, browser, os, sessions: sessions.size, totalEvents: events };
    });

    deviceData.sort((a, b) => b.sessions - a.sessions);
    setDevices(deviceData);
  };

  const loadSequences = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('session_id, framework, word_id, event, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return;

    const sessionMap = new Map<string, any[]>();
    data.forEach(e => {
      if (!sessionMap.has(e.session_id)) {
        sessionMap.set(e.session_id, []);
      }
      sessionMap.get(e.session_id)!.push(e);
    });

    const sequences: JourneySequence[] = Array.from(sessionMap.entries())
      .slice(0, 10)
      .map(([sessionId, events]) => {
        events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const start = new Date(events[0].created_at);
        const end = new Date(events[events.length - 1].created_at);
        return {
          sessionId,
          framework: events[0].framework,
          wordId: events[0].word_id,
          eventSequence: events.map(e => e.event),
          eventCount: events.length,
          journeyStart: start.toLocaleString(),
          journeyEnd: end.toLocaleString(),
          durationSeconds: (end.getTime() - start.getTime()) / 1000,
        };
      });

    setSequences(sequences);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto py-12">
          <p className="text-center text-gray-600">Loading journey analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Journey Analytics</h1>
          <p className="text-gray-600">Click-based journey analysis from Supabase</p>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Events</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalEvents.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Unique Sessions</p>
              <p className="text-3xl font-bold text-purple-600">{stats.uniqueSessions.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-green-600">{stats.completionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Avg Steps/Session</p>
              <p className="text-3xl font-bold text-blue-600">{stats.avgStepsPerSession.toFixed(1)}</p>
            </div>
          </div>
        )}

        {/* Event Types */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Distribution</h2>
          {eventTypes.length > 0 ? (
            <div className="space-y-4">
              {eventTypes.map(e => {
                const maxOccurrences = Math.max(...eventTypes.map(et => et.occurrences));
                const widthPercent = (e.occurrences / maxOccurrences) * 100;
                return (
                  <div key={e.eventType}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{e.eventType}</span>
                      <span className="text-sm text-gray-600">{e.occurrences} events ({e.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className="h-6 rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No event data available</p>
          )}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Event Type</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Occurrences</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Sessions</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {eventTypes.map(e => (
                  <tr key={e.eventType}>
                    <td className="px-4 py-2 text-sm text-gray-900">{e.eventType}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{e.occurrences.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{e.uniqueSessions.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{e.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Conversion Funnel</h2>
          {funnel.length > 0 && (
            <div className="space-y-4">
              {funnel.map((stage, idx) => (
                <div key={stage.stage}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <span className="text-sm text-gray-600">{stage.sessions} sessions ({stage.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div
                      className={`h-8 rounded-full transition-all ${
                        idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-indigo-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Frameworks */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Framework Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Framework</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Sessions</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Events</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Completions</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {frameworks.map(f => (
                  <tr key={f.framework}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{f.framework}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{f.sessions}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{f.totalEvents}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{f.completions}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        f.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                        f.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {f.completionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Words */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Word Popularity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Word</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Sessions</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Events</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Completions</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {words.slice(0, 10).map(w => (
                  <tr key={w.wordId}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 capitalize">{w.wordId}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{w.sessions}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{w.totalEvents}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{w.completions}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{w.completionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Device Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Device Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Browser</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">OS</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Sessions</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devices.map((d, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">{d.deviceType}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{d.browser}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{d.os}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{d.sessions}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{d.totalEvents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Journeys */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Journey Sequences (Last 10)</h2>
          <div className="space-y-4">
            {sequences.map(seq => (
              <div key={seq.sessionId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {seq.framework} - <span className="capitalize">{seq.wordId}</span>
                    </p>
                    <p className="text-xs text-gray-500">Session: {seq.sessionId.substring(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{seq.eventCount} events</p>
                    <p className="text-xs text-gray-500">{seq.durationSeconds.toFixed(0)}s duration</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seq.eventSequence.map((event, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                    >
                      {event}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{seq.journeyStart}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
