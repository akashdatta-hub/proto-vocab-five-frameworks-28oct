import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents, clearAllEvents } from '../hooks/useAnalytics';

export const DebugPage: React.FC = () => {
  const [events, setEvents] = useState(getAllEvents());
  const [filter, setFilter] = useState('');

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all analytics data?')) {
      clearAllEvents();
      setEvents([]);
    }
  };

  const filteredEvents = filter
    ? events.filter(
        (e) =>
          e.framework.includes(filter.toLowerCase()) ||
          e.wordId.includes(filter.toLowerCase()) ||
          e.event.includes(filter.toLowerCase())
      )
    : events;

  const eventsByType = events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Debug Log</h1>
              <p className="text-gray-600">
                Raw event data for development and testing ({events.length} events)
              </p>
            </div>
            <button onClick={handleClear} className="btn-secondary" disabled={events.length === 0}>
              Clear All
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="card text-center">
            <p className="text-xl text-gray-600 mb-4">No analytics events yet!</p>
            <p className="text-gray-500 mb-6">
              Start a learning journey to generate analytics data.
            </p>
            <Link to="/" className="btn-primary inline-block">
              Start a Journey
            </Link>
          </div>
        ) : (
          <>
            {/* Quick Summary Section */}
            <div className="card mb-6 bg-gradient-to-r from-indigo-50 to-blue-50">
              <h2 className="text-xl font-bold mb-3 text-gray-900">Debug Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Total Events:</strong> {events.length} logged interactions
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Unique Event Types:</strong> {Object.keys(eventsByType).length} different actions
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Most Common Event:</strong>{' '}
                    <span className="font-mono text-blue-600">
                      {Object.entries(eventsByType).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                    </span>
                    {' '}({Object.entries(eventsByType).sort(([, a], [, b]) => b - a)[0]?.[1] || 0} times)
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Time Range:</strong>{' '}
                    {events.length > 0 ?
                      `${Math.floor((events[events.length - 1].ts - events[0].ts) / 1000)}s` :
                      'N/A'}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-3 mt-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  This log captures all user interactions for debugging purposes. Events are ephemeral and reset on page refresh.
                  Use the filter below to search by framework, word, or event type.
                </p>
              </div>
            </div>

            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-4">Event Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(eventsByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([event, count]) => (
                    <div key={event} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 capitalize">
                        {event.replace(/_/g, ' ')}
                      </div>
                      <div className="text-2xl font-bold">{count}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="card mb-6">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by framework, word, or event type..."
                className="input-field"
              />
            </div>

            <div className="space-y-3">
              {filteredEvents.map((event, index) => {
                const date = new Date(event.ts);
                return (
                  <div key={index} className="card bg-gray-50 font-mono text-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <span className="font-semibold text-blue-600">{event.event}</span>
                        <span className="text-gray-600 ml-3">
                          {event.framework} / {event.wordId}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {date.toLocaleTimeString()}
                      </div>
                    </div>
                    {event.meta && Object.keys(event.meta).length > 0 && (
                      <div className="bg-white p-2 rounded text-xs overflow-x-auto">
                        <pre>{JSON.stringify(event.meta, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredEvents.length === 0 && filter && (
              <div className="card text-center">
                <p className="text-gray-600">No events match your filter.</p>
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link to="/compare" className="btn-secondary">
            View Comparison
          </Link>
        </div>
      </div>
    </div>
  );
};
